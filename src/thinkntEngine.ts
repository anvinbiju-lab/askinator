export const answers = [
  "Yes",
  "No",
  "Probably",
  "Probably Not",
  "Don’t Know",
] as const;
export type Answer = (typeof answers)[number];
export type Category =
  | "athlete"
  | "actor"
  | "singer"
  | "influencer"
  | "politician"
  | "friend"
  | "superhero"
  | "anime"
  | "cartoon"
  | "movie"
  | "game"
  | "other"
  | "unknown";
export interface Question {
  id: string;
  text: string;
}
export interface AnswerHistory {
  questionId: string;
  answer: Answer;
}
export interface GameSession {
  version: 1;
  phase: "intro" | "question" | "thinking" | "result" | "complete";
  history: AnswerHistory[];
  round: number;
  wrong: number;
  resultIndex: number;
  correct: boolean;
  muted: boolean;
  stats: { rounds: number; accepted: number; wrong: number };
}
export const ROUND_LENGTH = 10;
export const questions: Record<string, string> = {
  real: "Is your person real, or did a writer make them up?",
  famous: "Would your friends recognise this person?",
  alive: "Is your character alive today?",
  india: "Is this person from India?",
  sports: "Do people cheer when this person plays a sport?",
  entertainment: "Is your character known for entertainment?",
  acting: "Is your character an actor?",
  singing: "Is your character known for singing?",
  social: "Did this person get famous through reels or videos?",
  politics: "Is your character involved in politics?",
  personal: "Have you actually spoken to this person in real life?",
  superhero: "Can this character do things a normal human can’t?",
  anime: "Is your character from anime?",
  cartoon: "Is your character from a cartoon?",
  movie: "Is your character mainly from a movie?",
  game: "Is your character from a video game?",
  team: "Do they play on a team, rather than on their own?",
  ball: "Is chasing or hitting a ball part of their job?",
  international: "Is your character known around the world?",
  screen: "Have you watched your character on a screen?",
  funny: "Is your character known for being funny?",
  young: "Is your character usually shown as young?",
  hero: "Is your character usually a hero?",
  costume: "Does your character wear a special costume?",
  magic: "Does your character use magic?",
  family: "Is this person part of your family?",
  college: "Have you met this person at school or college?",
  message: "Have you ever messaged this person?",
  seen: "Have you seen this person in real life?",
  music: "Do you connect this character with music?",
  story: "Does your character have a story you enjoy?",
  name: "Would most of your friends recognise the name?",
  recent: "Have you thought about this character recently?",
  human: "Does your character look human?",
  animal: "Is your character an animal?",
  kind: "Would you say your character is kind?",
  help: "Does your character help other people?",
  leader: "Does your character lead a group?",
  voice: "Would you recognise their voice?",
};
export function value(history: AnswerHistory[], id: string) {
  const a = history.find((h) => h.questionId === id)?.answer;
  return a === "Yes"
    ? 1
    : a === "Probably"
      ? 0.6
      : a === "No"
        ? -1
        : a === "Probably Not"
          ? -0.6
          : 0;
}
export function categoryOf(history: AnswerHistory[]): Category {
  const v = (id: string) => value(history, id);
  if (v("real") > 0) {
    if (v("sports") > 0) return "athlete";
    if (v("acting") > 0) return "actor";
    if (v("singing") > 0) return "singer";
    if (v("social") > 0) return "influencer";
    if (v("politics") > 0) return "politician";
    if (v("personal") > 0) return "friend";
    return history.filter((h) => h.answer === "Yes" || h.answer === "No")
      .length >= 4
      ? "other"
      : "unknown";
  }
  if (v("real") < 0) {
    if (v("superhero") > 0) return "superhero";
    if (v("anime") > 0) return "anime";
    if (v("cartoon") > 0) return "cartoon";
    if (v("movie") > 0) return "movie";
    if (v("game") > 0) return "game";
    return history.filter((h) => h.answer === "Yes" || h.answer === "No")
      .length >= 4
      ? "other"
      : "unknown";
  }
  return "unknown";
}
export function nextQuestion(history: AnswerHistory[]): Question | null {
  if (history.length >= ROUND_LENGTH) return null;
  const v = (id: string) => value(history, id),
    category = categoryOf(history);
  const order = ["real", "famous"];
  const focus: Partial<Record<Category, string[]>> = {
    athlete: ["team", "ball", "india", "alive", "international"],
    actor: ["india", "alive", "international", "voice", "funny"],
    singer: ["music", "voice", "india", "alive", "international"],
    influencer: ["india", "seen", "voice", "international"],
    politician: ["india", "alive", "leader", "seen"],
    friend: ["family", "college", "message", "seen", "india"],
    superhero: ["costume", "hero", "human", "movie", "magic"],
    anime: ["young", "hero", "magic", "human", "voice"],
    cartoon: ["animal", "young", "funny", "voice", "hero"],
    movie: ["hero", "human", "voice", "funny", "story"],
    game: ["hero", "human", "magic", "story", "voice"],
  };
  if (focus[category]) order.push(...focus[category]!);
  else if (v("real") > 0) {
    if (v("famous") < 0) order.push("personal");
    order.push("sports", "entertainment");
    if (v("entertainment") > 0) order.push("acting");
    order.push("singing", "social", "politics", "personal", "india", "alive");
  } else if (v("real") < 0)
    order.push(
      "superhero",
      "anime",
      "cartoon",
      "movie",
      "game",
      "human",
      "animal",
      "hero",
    );
  else order.push("screen", "human", "music", "story", "seen");
  order.push(
    "international",
    "funny",
    "young",
    "name",
    "recent",
    "kind",
    "help",
    "leader",
    "voice",
  );
  const id = order.find((id) => !history.some((h) => h.questionId === id));
  return id ? { id, text: questions[id] } : null;
}
const endings: Record<Category, string[]> = {
  athlete: [
    "Someone who gets paid to run. I run only when the mess serves biryani.",
    "Someone with millions of fans. You’re not even in their contacts, bro.",
    "Someone who can score goals. Your assignment is still at zero.",
    "An athlete. Meanwhile I pulled a muscle loading this page.",
  ],
  actor: [
    "Someone you’ve watched for hours. They haven’t watched you for a second.",
    "Someone who gets paid to cry. You do it free after checking marks.",
    "An actor. I’d name them, but this is my interval break.",
    "Someone with a hit movie. Your pending assignment has no release date.",
  ],
  singer: [
    "Someone who hits high notes. Mine is just a low battery warning.",
    "Someone with a lovely voice. Unlike my 6 a.m. alarm.",
    "A singer. I knew it from your perfectly silent answers.",
    "Someone whose songs you know better than your syllabus.",
  ],
  influencer: [
    "Someone who earns money saying “Guys, welcome back.” I said hello for free.",
    "Someone with followers. My only follower is a deadline.",
    "Someone who calls everything a life update. Mine is still buffering.",
    "Someone whose screen time counts as a salary. Unfair, honestly.",
  ],
  politician: [
    "Someone who makes big promises. Finally, competition.",
    "Someone who loves a speech. I couldn’t even finish these questions properly.",
    "Someone who can lead a crowd. I lost one thought.",
    "A politician. My prediction has been postponed until further notice.",
  ],
  friend: [
    "Someone who still owes you ₹50. Stop playing and call them.",
    "Someone who knows you’re wasting time here. Probably doing it too.",
    "Someone you could have messaged instead of answering ten questions.",
    "Someone from real life. Ente ponno, I forgot there was an offline mode.",
  ],
  superhero: [
    "Someone who can save the world. Your attendance? Even they said no.",
    "Someone with superpowers. Mine is closing tabs without reading them.",
    "Someone with a secret identity. Mine is “not very good at this.”",
    "A superhero. Even they would ask for help with your timetable.",
  ],
  anime: [
    "Someone with a training arc. Yours starts after one more episode.",
    "Someone with dramatic hair and better focus than me.",
    "An anime character. I ran out of budget before their name appeared.",
    "Someone who can turn a fight into twelve episodes. I respect the delay.",
  ],
  cartoon: [
    "A cartoon. Even their fake life is more sorted than mine.",
    "Someone who has survived everything. Even hostel food, probably.",
    "A cartoon character. Their life has better writing than my predictions.",
    "Someone with a very small wardrobe and a very big fanbase.",
  ],
  movie: [
    "Someone from a movie. The credits rolled before I got their name.",
    "Someone with a great story. This game has taken a very bad turn.",
    "Someone who lives on a screen. So do I. No family connection though.",
    "A movie character. This is the scene where I pretend I knew all along.",
  ],
  game: [
    "Someone who can respawn. Useful feature during semester exams.",
    "Someone with better controls than my life.",
    "A game character. They respawn. Your lost semester doesn’t.",
    "Someone whose side quests are more organised than my main plan.",
  ],
  other: [
    "Someone you know more about than I do. Ten questions well spent.",
    "Your character has a name. I have confidence. We both brought something.",
    "Someone who would be surprised to learn this counts as mind reading.",
    "Your character is… still your character. I kept them safe.",
  ],
  unknown: [
    "After ten questions, I know one thing. You know who it is. I don’t.",
    "I read your mind. Even Google Translate gave up.",
    "I called your brain. It declined.",
    "Someone who exists. Or doesn’t. I’ve covered all possibilities.",
    "You thought I would guess? Bro, this is askinatot.",
    "Before we find your character, let’s find my last brain cell.",
  ],
};
export function resultFor(history: AnswerHistory[], index: number) {
  const category = categoryOf(history);
  const list = endings[category];
  return {
    category,
    text: list[((index % list.length) + list.length) % list.length],
  };
}
export function freshGame(): GameSession {
  return {
    version: 1,
    phase: "intro",
    history: [],
    round: 0,
    wrong: 0,
    resultIndex: 0,
    correct: false,
    muted: true,
    stats: { rounds: 0, accepted: 0, wrong: 0 },
  };
}
export type GameAction =
  | {
      type:
        "start" | "back" | "restart" | "reveal" | "wrong" | "correct" | "mute";
    }
  | { type: "answer"; answer: Answer; questionId: string };
export function gameReducer(s: GameSession, a: GameAction): GameSession {
  switch (a.type) {
    case "start":
    case "restart":
      if (a.type === "start" && s.phase !== "intro") return s;
      return {
        ...freshGame(),
        phase: "question",
        round: s.round + 1,
        resultIndex: s.resultIndex + 1,
        muted: s.muted,
        stats: s.stats,
      };
    case "mute":
      return { ...s, muted: !s.muted };
    case "back":
      return s.phase === "question" && s.history.length
        ? { ...s, history: s.history.slice(0, -1) }
        : s;
    case "answer": {
      if (s.phase !== "question" || !answers.includes(a.answer)) return s;
      const q = nextQuestion(s.history);
      if (!q || q.id !== a.questionId) return s;
      const history = [...s.history, { questionId: q.id, answer: a.answer }];
      return {
        ...s,
        history,
        phase: history.length >= ROUND_LENGTH ? "thinking" : "question",
      };
    }
    case "reveal":
      return s.phase === "thinking"
        ? {
            ...s,
            phase: "result",
            stats: { ...s.stats, rounds: s.stats.rounds + 1 },
          }
        : s;
    case "correct":
      return s.phase === "result"
        ? {
            ...s,
            phase: "complete",
            correct: true,
            stats: { ...s.stats, accepted: s.stats.accepted + 1 },
          }
        : s;
    case "wrong":
      return s.phase === "result"
        ? {
            ...s,
            wrong: s.wrong + 1,
            resultIndex: s.resultIndex + 1,
            phase: s.wrong >= 2 ? "complete" : "result",
            stats: { ...s.stats, wrong: s.stats.wrong + 1 },
          }
        : s;
  }
}
export const GAME_KEY = "worknt.thinknt.v1";
export function restoreGame(raw: string | null): GameSession {
  try {
    const s = JSON.parse(raw || "null");
    if (
      !s ||
      s.version !== 1 ||
      !["intro", "question", "thinking", "result", "complete"].includes(
        s.phase,
      ) ||
      !Array.isArray(s.history) ||
      s.history.length > ROUND_LENGTH
    )
      return freshGame();
    const history: AnswerHistory[] = [];
    for (const h of s.history) {
      if (
        !h ||
        nextQuestion(history)?.id !== h.questionId ||
        !answers.includes(h.answer)
      )
        return freshGame();
      history.push(h);
    }
    if (
      ![
        s.round,
        s.wrong,
        s.resultIndex,
        s.stats?.rounds,
        s.stats?.accepted,
        s.stats?.wrong,
      ].every((v) => Number.isSafeInteger(v) && v >= 0) ||
      s.wrong > 3 ||
      typeof s.correct !== "boolean" ||
      typeof s.muted !== "boolean"
    )
      return freshGame();
    if (
      (s.phase === "result" && s.wrong >= 3) ||
      (s.phase === "complete" && !s.correct && s.wrong !== 3)
    )
      return freshGame();
    if (
      (s.phase === "intro" && history.length) ||
      (["thinking", "result", "complete"].includes(s.phase) &&
        history.length !== ROUND_LENGTH) ||
      (s.phase === "question" && history.length >= ROUND_LENGTH)
    )
      return freshGame();
    return {
      ...s,
      phase: s.phase === "thinking" ? "result" : s.phase,
      stats:
        s.phase === "thinking"
          ? { ...s.stats, rounds: s.stats.rounds + 1 }
          : s.stats,
      history,
    };
  } catch {
    return freshGame();
  }
}
