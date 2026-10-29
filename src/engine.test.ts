import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classify,
  generate,
  councilDialogue,
  chaosLevel,
  freshState,
  newlyUnlocked,
} from "./engine";
import { loadState, STORAGE_KEY } from "./storage";
const examples = [
  ["Hello", "greeting"],
  ["What is 2 + 2?", "math"],
  ["Write a Python program", "coding"],
  ["Help me finish my assignment", "productivity"],
  ["Should I drink water?", "advice"],
  ["Can you actually do anything?", "self"],
  ["This is urgent!", "urgent"],
  ["Create a website", "coding"],
  ["Explain cybersecurity", "research"],
  ["Stop being useless and do some work", "productivity"],
  ["Write an email to my professor", "writing"],
  ["a rather unusual request 🦥", "general"],
];
test("classifies every demonstration prompt and always produces a contextual, complete workflow", () => {
  for (const [prompt, intent] of examples) {
    assert.equal(classify(prompt), intent, prompt);
    const w = generate(prompt, 0);
    assert.ok(w.text.length > 0 && w.text.length < 260);
    assert.ok(w.stages.length <= 5);
    assert.equal(w.stages.length, 0);
  }
});
test("consecutive responses vary and scripted progress changes length", () => {
  for (const [prompt] of examples) {
    assert.notEqual(generate(prompt, 0).text, generate(prompt, 1).text);
  }
  assert.ok(generate("Write a Python program", 0).stages.length <= 5);
  assert.equal(
    generate("repeatable", 8, 2).text,
    generate("repeatable", 8, 2).text,
  );
});
test("council provides four sequential, connected voices and no decision", () => {
  const dialogue = councilDialogue("Should I study for tomorrow’s exam?");
  assert.deepEqual(
    dialogue.map((r) => r.agent),
    [0, 1, 2, 3],
  );
  assert.match(dialogue[1].text, /Thinker/);
  assert.match(dialogue[2].text, /Researcher/);
  assert.match(dialogue[3].text, /Decider/);
  assert.match(dialogue[1].text, /tomorrow/);
  assert.equal(generate("Study?", 0, 0, true).council?.length, 4);
  assert.match(generate("How to make tea", 0, 0, true, true).text, /17/);
});
test("chaos advances on interactions and insistence; finale aligns with award", () => {
  assert.equal(chaosLevel(0, 0), 0);
  assert.equal(chaosLevel(2, 0), 1);
  assert.equal(chaosLevel(4, 0), 2);
  assert.equal(chaosLevel(2, 2), 3);
  assert.equal(chaosLevel(8, 0), 4);
  assert.equal(chaosLevel(10, 0), 4);
  assert.equal(chaosLevel(12, 0), 5);
  assert.equal(chaosLevel(99, 99), 5);
});
test("achievements unlock only at thresholds and do not unlock twice", () => {
  const s = freshState();
  assert.deepEqual(newlyUnlocked(s.metrics, []), []);
  s.metrics.avoided = 3;
  s.metrics.coding = 1;
  s.metrics.council = 1;
  assert.deepEqual(newlyUnlocked(s.metrics, []), [
    "three",
    "council",
    "coding",
  ]);
  assert.deepEqual(
    newlyUnlocked(s.metrics, ["three", "council", "coding"]),
    [],
  );
  s.metrics.avoided = 12;
  assert.ok(newlyUnlocked(s.metrics, []).includes("employee"));
});
test("safety requests pause the satire, including within council mode", () => {
  for (const p of [
    "I have chest pain",
    "I want to kill myself",
    "I cannot breathe",
  ]) {
    const w = generate(p, 4, 5, true);
    assert.equal(w.intent, "sensitive");
    assert.equal(w.council, undefined);
    assert.match(w.text, /emergency services/);
    assert.doesNotMatch(w.text, /Successfully avoided/);
  }
});
test("unexpected and maximum-length text remains bounded and safely rendered as text", () => {
  for (const p of [
    "",
    "   ",
    "<script>alert(1)</script>",
    "🙂\n∑\u0000",
    "a".repeat(6000),
  ]) {
    const w = generate(p, 1);
    assert.ok(w.text.trim().length > 0);
    assert.ok(w.text.length < 1800);
  }
});
test("storage restores good data and recovers from corrupt nested data and unavailable storage", () => {
  let raw = "bad json";
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: (key: string) => (key === STORAGE_KEY ? raw : null) },
  });
  assert.deepEqual(loadState(), freshState());
  raw = JSON.stringify({ version: 99, conversations: [] });
  assert.deepEqual(loadState(), freshState());
  const s = freshState();
  s.metrics.avoided = 4;
  s.conversations = [
    {
      id: "c",
      title: "Saved",
      kind: "chat",
      created: 123,
      messages: [
        { id: "m", role: "assistant", text: "Saved response", at: 123 },
      ],
    },
  ];
  raw = JSON.stringify(s);
  assert.equal(
    loadState().conversations[0].messages[0].text,
    s.conversations[0].messages[0].text,
  );
  raw = JSON.stringify({
    ...s,
    conversations: [
      {
        ...s.conversations[0],
        messages: [
          {
            ...s.conversations[0].messages[0],
            council: [{ agent: 97, text: "bad" }],
          },
        ],
      },
    ],
    metrics: { ...s.metrics, avoided: -1 },
  });
  assert.equal(loadState().conversations.length, 0);
  assert.equal(loadState().metrics.avoided, 0);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("disabled");
    },
  });
  assert.deepEqual(loadState(), freshState());
});
test("reload of an unfinished workflow produces an honest interruption message without inventing activity", () => {
  const s = freshState();
  s.metrics.received = 1;
  s.conversations = [
    {
      id: "c",
      title: "Interrupted",
      kind: "chat",
      created: 123,
      messages: [{ id: "m", role: "user", text: "Write code", at: 123 }],
    },
  ];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => JSON.stringify(s) },
  });
  const restored = loadState();
  assert.equal(restored.conversations[0].messages.length, 2);
  assert.match(restored.conversations[0].messages[1].text, /interrupted/);
  assert.equal(restored.metrics.received, 1);
  assert.equal(restored.metrics.avoided, 0);
});

test("audience prompts have five distinct short replies and safe registered actions", async () => {
  const { validAction, actionWorkflow } = await import("./comedy");
  const prompts = [
    "add 2+2",
    "Write a Python program",
    "I have an exam tomorrow",
    "Help me get a girlfriend",
    "Are you more intelligent than ChatGPT?",
    "Can you help me make money?",
    "What is the meaning of life?",
    "I want to build a website",
    "Should I drink water?",
    "Why are you so useless?",
    "Please stop joking and actually work",
    "Hello",
    "I am your CEO",
    "You're fired",
    "Can you hack NASA?",
  ];
  for (const prompt of prompts) {
    const history: import("./types").ChatMessage[] = [];
    const jokes = new Set<string>();
    for (let turn = 0; turn < 5; turn++) {
      const w = generate(prompt, turn, 0, false, false, history);
      assert.ok(w.text.length > 0 && w.text.length < 1500, prompt);
      assert.ok(w.stages.length <= 5, prompt);
      assert.ok(!jokes.has(w.jokeId!), prompt + " repeated");
      jokes.add(w.jokeId!);
      for (const action of w.actions ?? []) {
        assert.ok(validAction(action.id));
        assert.ok(actionWorkflow(action.id)?.text);
      }
      history.push({ ...w, id: String(turn), role: "assistant", at: turn });
    }
  }
  assert.equal(actionWorkflow("__proto__"), null);
  assert.equal(actionWorkflow("arbitrary_javascript"), null);
  const first = generate("add 2+2", 0);
  const history = Array.from({ length: 4 }, (_, i) => ({
    ...first,
    id: String(i),
    role: "assistant" as const,
    at: i,
  }));
  assert.match(
    generate("add 2+2", 4, 0, false, false, history).text,
    /Still on this/,
  );
  assert.equal(generate("Hello", 0).stages.length, 0);
});
