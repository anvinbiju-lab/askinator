import { test } from "node:test";
import assert from "node:assert/strict";
import {
  answers,
  categoryOf,
  freshGame,
  gameReducer,
  nextQuestion,
  restoreGame,
  resultFor,
  ROUND_LENGTH,
  type AnswerHistory,
  type Answer,
  type GameSession,
} from "./thinkntEngine";
import { generate } from "./engine";

function play(choices: Record<string, Answer> = {}, fallback: Answer = "No") {
  let state = gameReducer(freshGame(), { type: "start" });
  const ids = new Set<string>();
  for (let i = 0; i < ROUND_LENGTH; i++) {
    const q = nextQuestion(state.history);
    assert.ok(q);
    assert.ok(!ids.has(q.id));
    ids.add(q.id);
    state = gameReducer(state, {
      type: "answer",
      answer: choices[q.id] ?? fallback,
      questionId: q.id,
    });
  }
  assert.equal(state.phase, "thinking");
  assert.equal(nextQuestion(state.history), null);
  return gameReducer(state, { type: "reveal" });
}
test("all character categories are reachable with coherent adaptive paths", () => {
  const paths: [string, Record<string, Answer>][] = [
    ["athlete", { real: "Yes", famous: "Yes", sports: "Yes" }],
    [
      "actor",
      {
        real: "Yes",
        famous: "Yes",
        entertainment: "Yes",
        acting: "Yes",
        india: "Yes",
      },
    ],
    [
      "singer",
      { real: "Yes", famous: "Yes", entertainment: "Yes", singing: "Yes" },
    ],
    ["influencer", { real: "Yes", famous: "Yes", social: "Yes" }],
    ["politician", { real: "Yes", famous: "Yes", politics: "Yes" }],
    ["friend", { real: "Yes", famous: "No", personal: "Yes" }],
    ["superhero", { real: "No", superhero: "Yes" }],
    ["anime", { real: "No", anime: "Yes" }],
    ["cartoon", { real: "No", cartoon: "Yes" }],
    ["movie", { real: "No", movie: "Yes" }],
    ["game", { real: "No", game: "Yes" }],
    ["other", { real: "Yes" }],
  ];
  for (const [category, path] of paths) {
    const s = play(path);
    assert.equal(categoryOf(s.history), category, category);
    assert.equal(s.history.length, ROUND_LENGTH);
    assert.ok(resultFor(s.history, 0).text);
    if (path.real === "No")
      assert.ok(
        !s.history.some((h) =>
          ["alive", "sports", "personal", "politics"].includes(h.questionId),
        ),
      );
  }
  assert.equal(categoryOf(play({}, "Don’t Know").history), "unknown");
});
test("uncertainty and arbitrary answers never duplicate questions or get stuck", () => {
  let seed = 17;
  for (let run = 0; run < 300; run++) {
    let s = gameReducer(freshGame(), { type: "start" });
    const seen = new Set<string>();
    while (s.phase === "question") {
      const q = nextQuestion(s.history);
      assert.ok(q);
      assert.ok(!seen.has(q.id));
      seen.add(q.id);
      seed = (seed * 1664525 + 1013904223) >>> 0;
      s = gameReducer(s, {
        type: "answer",
        answer: answers[seed % answers.length],
        questionId: q.id,
      });
    }
    assert.equal(s.phase, "thinking");
    assert.equal(s.history.length, ROUND_LENGTH);
  }
});
test("back recomputes the branch and stale double-clicks cannot answer the next question", () => {
  let s = gameReducer(freshGame(), { type: "start" });
  const first = nextQuestion(s.history)!;
  s = gameReducer(s, { type: "answer", answer: "Yes", questionId: first.id });
  assert.equal(
    gameReducer(s, { type: "answer", answer: "Yes", questionId: first.id }),
    s,
  );
  s = gameReducer(s, { type: "back" });
  assert.equal(s.history.length, 0);
  s = gameReducer(s, { type: "answer", answer: "No", questionId: first.id });
  const second = nextQuestion(s.history)!;
  s = gameReducer(s, { type: "answer", answer: "Yes", questionId: second.id });
  assert.equal(nextQuestion(s.history)?.id, "superhero");
  assert.equal(categoryOf(s.history), "unknown");
});
test("correct, three wrong guesses, restart, and new round have bounded valid transitions", () => {
  let s = play({ real: "Yes", famous: "Yes", sports: "Yes" });
  assert.equal(s.stats.rounds, 1);
  const first = resultFor(s.history, s.resultIndex).text;
  s = gameReducer(s, { type: "wrong" });
  assert.equal(s.wrong, 1);
  assert.notEqual(resultFor(s.history, s.resultIndex).text, first);
  const second = resultFor(s.history, s.resultIndex).text;
  const restart = gameReducer(s, { type: "restart" });
  assert.equal(restart.history.length, 0);
  assert.equal(restart.wrong, 0);
  assert.notEqual(resultFor(s.history, restart.resultIndex).text, second);
  s = gameReducer(s, { type: "wrong" });
  assert.equal(s.wrong, 2);
  s = gameReducer(s, { type: "wrong" });
  assert.equal(s.phase, "complete");
  assert.equal(s.wrong, 3);
  assert.equal(gameReducer(s, { type: "wrong" }), s);
  let win = gameReducer(play(), { type: "correct" });
  assert.equal(win.correct, true);
  assert.equal(win.stats.accepted, 1);
  assert.equal(gameReducer(win, { type: "correct" }), win);
  assert.equal(gameReducer(freshGame(), { type: "reveal" }).phase, "intro");
});
test("refresh recovers game progress and corrupt or impossible saved state resets safely", () => {
  let s = gameReducer(freshGame(), { type: "start" });
  s = gameReducer(s, {
    type: "answer",
    answer: "Probably",
    questionId: "real",
  });
  assert.deepEqual(restoreGame(JSON.stringify(s)), s);
  const result = play({ real: "No", cartoon: "Yes" });
  assert.deepEqual(restoreGame(JSON.stringify(result)), result);
  assert.equal(
    restoreGame(
      JSON.stringify({
        ...result,
        phase: "thinking",
        stats: { ...result.stats, rounds: 0 },
      }),
    ).stats.rounds,
    1,
  );
  for (const raw of [
    "invalid",
    JSON.stringify({
      ...s,
      history: [{ questionId: "sports", answer: "Yes" }],
    }),
    JSON.stringify({ ...s, phase: "result" }),
    JSON.stringify({ ...s, wrong: 9 }),
    JSON.stringify({
      ...s,
      history: [{ questionId: "real", answer: "banana" }],
    }),
  ])
    assert.deepEqual(restoreGame(raw), freshGame());
});
test("V3 chat is brief, contextual, varied, and free of corporate output", () => {
  const prompts = [
    "What is 2+2?",
    "Hello",
    "What is Python?",
    "Help me study",
    "I have an exam tomorrow",
    "How do I get a girlfriend?",
    "Why are you useless?",
    "Write a C program",
    "Tell me a joke",
    "Can you help me?",
    "I’m bored",
    "What is cybersecurity?",
    "Are you better than ChatGPT?",
    "I’m hungry",
    "Do you love me?",
  ];
  for (const prompt of prompts) {
    const history: import("./types").ChatMessage[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const w = generate(prompt, i, 5, false, false, history);
      assert.ok(w.text.length < 245, prompt);
      assert.equal(w.stages.length, 0);
      assert.equal(w.council, undefined);
      assert.doesNotMatch(
        w.text,
        /department|workflow|committee|executive|Policy 404/i,
      );
      assert.ok(!seen.has(w.jokeId!));
      seen.add(w.jokeId!);
      history.push({ ...w, id: String(i), role: "assistant", at: i });
    }
  }
  assert.match(
    generate("I failed my exam", 0).text,
    /rough|kind|rest|story|roasting|breath|deserve/,
  );
  assert.equal(
    generate("Can you read my mind?", 0).actions?.[0].id,
    "open_thinknt",
  );
});
