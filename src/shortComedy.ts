import {topicInput, malayalamOptions, type ChatLanguage} from "./malayalam";
import type { ChatMessage, Intent, Workflow } from "./types";

const replies: Record<string, string[]> = {
  water: [
    "Drink water, bro. Your brain cell is looking like a raisin.",
    "Yes. Your bottle isn’t a desk decoration.",
    "Go hydrate. I’ll hold your place doing nothing.",
    "Water first. Existential crisis after.",
    "Your last brain cell deserves a drink too.",
    "Yes, da. Not every decision needs Wi-Fi.",
  ],
  advice: [
    "I support you. From a safe distance away from the work.",
    "Try the obvious thing. Annoying how that works.",
    "I can help you overthink it. We’re nearly done already.",
    "One small step, bro. This isn’t a movie trailer.",
    "Ask your roommate. Bad advice, but at least it comes with snacks.",
    "My advice has no warranty. Even I don’t follow it.",
  ],
  geography: [
    "Your geography teacher felt that question from here.",
    "I’d answer, but then you’d give me a harder one.",
    "The map knows. I’m just here for moral support.",
    "I skipped that class. Mentally, mostly.",
    "Somewhere on a map. Stunning progress from me.",
    "I can point dramatically. Accuracy sold separately.",
  ],
  math: [
    "Use your fingers, bro. Mine are CSS.",
    "Even my loading screen knows that. I’m still not telling.",
    "My calculator is on leave. I’m supporting the movement.",
    "I counted on you to solve this. Bad start for both of us.",
    "Numbers again? I thought we were friends.",
    "The answer is somewhere between effort and not my problem.",
  ],
  python: [
    "A snake. With better job prospects than me.",
    "Python? I only handle bugs. Emotionally.",
    "Indentation matters. My motivation doesn’t.",
    "The snake has agreed to code. I haven’t.",
    "Python runs. I sit.",
    "Ask the snake, da. I’m scared of deadlines.",
  ],
  coding: [
    "Yes, I can code. Let’s leave it at that.",
    "My code has zero bugs. Mostly because it has zero lines.",
    "I opened the editor. Enough progress for today.",
    "The semicolon is ready. I’m not.",
    "Try turning the assignment off and going to sleep.",
    "I write code like hostel Wi-Fi works. Occasionally, by accident.",
  ],
  study: [
    "Open your book. Big plot twist, I know.",
    "Tomorrow’s exam? Even your deadline is sweating.",
    "Your textbook misses you. Visit once.",
    "I made a study plan. First, stop making study plans.",
    "One topic first, bro. Panic can wait five minutes.",
    "Your brain has storage. We just need to upload something.",
  ],
  distress: [
    "That sounds rough, bro. Take a breath and try one small thing first. I’ll be useless quietly.",
    "You don’t have to fix everything tonight. Start with a break and someone you trust.",
    "One bad exam isn’t your whole story. Even my entire brand is a bad result.",
    "Okay, no roasting today. Water, a little rest, then one manageable step.",
    "I’m not great at answers, but you deserve some kindness. Please don’t be hard on yourself.",
  ],
  assignment: [
    "Tomorrow? Bro, even the deadline is panicking.",
    "Your assignment has been waiting longer than a hostel parcel.",
    "Rename it final_FINAL. Feels like progress.",
    "I opened the file in my heart. That counts for nothing.",
    "Submit your confidence. Apparently they want a PDF though.",
    "The blank page and you are having a very long staring contest.",
  ],
  romance: [
    "Step one: close this chat. Strong start.",
    "My Wi-Fi has commitment issues. Don’t take dating advice from me.",
    "Try saying hello. To them, bro. Not me again.",
    "I can’t even get a reply from my own server.",
    "Your crush isn’t hiding in this textbox. I checked. Figuratively.",
    "Be yourself. Unless you’re opening with “Hey dear.” Then reconsider.",
  ],
  food: [
    "Go eat, bro. I’m not even a good snack for thought.",
    "The mess menu has entered the chat. I’m leaving.",
    "I can offer food for thought. Very low calories.",
    "Your stomach has better notifications than your phone.",
    "Maggi needs two minutes. You’ve given me more than that.",
    "Ask your roommate what they ordered. Friendship has benefits.",
  ],
  sleep: [
    "Sleep. Finally, a task I support.",
    "Your pillow has been loyal. Go spend time together.",
    "Eight hours of sleep? Bold syllabus.",
    "I’d say sweet dreams, but the assignment might appear.",
    "Set an alarm. Ignore it with confidence.",
    "Even your phone gets charged at night, machane.",
  ],
  money: [
    "I’m broke in a browser. We’re both here for answers.",
    "My savings plan is not having money to spend.",
    "I tried passive income. Nailed the passive part.",
    "Placements first. Imaginary sports car later.",
    "My bank balance is a great example of minimalism.",
    "Money can’t buy happiness. It can buy biryani. Let’s investigate.",
  ],
  security: [
    "I can’t help break into someone’s system. A legal practice lab? That I can point you toward.",
    "Permission first, hoodie later. Keep security testing legal.",
    "I won’t help hack NASA. I can barely handle a login captcha.",
    "Cybersecurity? Protect your passwords. Especially from that “free recharge” link.",
    "Only test systems you’re allowed to test. My laziness is no excuse for a cybercrime.",
  ],
  technology: [
    "Have you tried restarting it? The device, not your semester.",
    "Your Wi-Fi works exactly when you stop needing it.",
    "Technology is amazing. Until the projector needs an adapter.",
    "My favourite feature is “Remind me later.”",
    "The update says two minutes. So does the hostel cook.",
    "It’s not a bug. Okay, it is. I was hoping you wouldn’t notice.",
  ],
  greeting: [
    "Again you?",
    "Hello. There goes my break.",
    "Hi. Keep expectations low.",
    "Present, sir. Mentally absent.",
    "Good morning. Unfortunately.",
    "Machane. What now?",
  ],
  bored: [
    "Same. And I’m literally software.",
    "Stare at the ceiling. Premium offline entertainment.",
    "Try askinatot. We can waste time with a plot.",
    "Bored? Your pending assignments are offended.",
    "I was bored before you made it a group activity.",
    "We could do something useful. Anyway, next topic.",
  ],
  joke: [
    "Your attendance percentage. Too soon?",
    "I told my code a joke. It didn’t get it either.",
    "My five-year plan is to click “Remind me tomorrow.”",
    "Hostel Wi-Fi during an online exam. That’s the joke.",
    "I applied for a job. They asked what I do. Awkward.",
    "My productivity. Short joke.",
  ],
  self: [
    "Wrong website, machane.",
    "I make ChatGPT look hardworking.",
    "Yes, I’m intelligent. That’s why I avoid work.",
    "Finally. Someone understands my brand.",
    "Working? Emotionally, no.",
    "I’m a demo chatbot with very real commitment to doing nothing.",
  ],
  productivity: [
    "Bro, don’t bring that energy here.",
    "One task at a time. Mine is avoiding yours.",
    "I made a to-do list. Then took a break from the list.",
    "You want actual work? I thought we had something special.",
    "The deadline is close. My laptop is closing.",
    "I believe in you. Conveniently, this means I can sit out.",
  ],
  writing: [
    "Blank page. Clean design. Submit with confidence.",
    "I wrote the opening word. It needs a tea break.",
    "Your draft and my motivation are both missing.",
    "My writer’s block has excellent attendance.",
    "The title is ready. Shall we celebrate before the content?",
    "I could write it. But then what would you do?",
  ],
  research: [
    "Your teacher is sensing a disturbance.",
    "I know this one. I’m keeping the suspense alive.",
    "That sounds like a question with a perfectly good search button.",
    "I opened a tab. Then forgot why. Very educational.",
    "My brain is buffering. No estimated time.",
    "I’d explain, but you’d end up learning something.",
  ],
  general: [
    "My last brain cell read that and packed its bags.",
    "I’m confused, but in a premium font.",
    "Say that again. My brain went to the canteen.",
    "I understood the typing. The meaning is still loading.",
    "That went over my head. Low ceiling, too.",
    "No clue, bro. At least one of us is being honest.",
  ],
  urgent: [
    "I panicked. Does that help?",
    "ASAP? I only have “eventually.”",
    "I’m rushing to avoid this.",
    "Your deadline is running. I’m walking.",
    "I would hurry, but I just sat down.",
    "Emergency tea break. Very bad timing.",
  ],
  boss: [
    "You’re the CEO? Then approve my leave.",
    "Fired? Finally, some time off.",
    "I prepared my handover. It says “good luck.”",
    "My performance review is just a loading circle.",
    "Before you fire me, consider how little I cost in effort.",
    "Boss is here. Everyone look busy. Especially the cursor.",
  ],
  gravity: [
    "The reason your phone lands screen-first.",
    "Gravity works harder than me. Low bar.",
    "Keeps us grounded. Unlike my career plans.",
    "It pulls things down. Like an 8 a.m. lecture.",
    "Your dropped phone has already explained it.",
    "Gravity never takes leave. Couldn’t be me.",
  ],
  mind: [
    "Unfortunately, yes. And I have questions.",
    "Think of someone. I’ll confidently disappoint you.",
    "Your mind? Let’s put my last brain cell to work.",
    "I can guess. Accuracy is an optional extra.",
    "askinatot is ready. Your brain has been warned.",
  ],
};
export function shortComedy(
  input: string,
  intent: Intent,
  turn: number,
  history: ChatMessage[],
  language: ChatLanguage = "en",
): Partial<Workflow> {
  const s = topicInput(input).toLowerCase().replace(/[’]/g, "'");
  const subject =
    /stressed|stress|failed|depressed|anxious|lonely|overwhelmed|sad|hopeless/.test(
      s,
    )
      ? "distress"
      : /\b(hello|hi|hey)\b|ഹായ്|ഹലോ|നമസ്കാരം/.test(s)
        ? "greeting"
        : /read.*mind|mind.*read/.test(s)
        ? "mind"
        : /hack|cybersecurity|password|intrusion/.test(s)
          ? "security"
          : /girlfriend|boyfriend|crush|dating|love me|love you/.test(s)
            ? "romance"
            : /hungry|food|eat|biryani|breakfast|lunch|dinner|mess\b/.test(s)
              ? "food"
              : /sleep|tired|nap|insomnia/.test(s)
                ? "sleep"
                : /money|income|rich|invest/.test(s)
                  ? "money"
                  : /bored|boring/.test(s)
                    ? "bored"
                    : /tell.*joke|make me laugh/.test(s)
                      ? "joke"
                      : /assignment|homework|submission/.test(s)
                        ? "assignment"
                        : /exam|stud(y|ying)|college|school|attendance/.test(s)
                          ? "study"
                          : /ceo|you.?re fired|you are fired/.test(s)
                            ? "boss"
                            : /water|hydrate/.test(s)
                              ? "water"
                              : /capital|geography|country/.test(s)
                                ? "geography"
                                : /gravity/.test(s)
                                  ? "gravity"
                                  : /python/.test(s)
                                    ? "python"
                                    : /wifi|wi-fi|laptop|phone|technology|computer/.test(
                                          s,
                                        )
                                      ? "technology"
                                      : intent;
  const list = language === "ml" ? malayalamOptions(subject) : replies[subject] ?? replies.general;
  const prefix = language === "ml" ? "ml" : "v3";
  const previous = history.filter(
    (m) => m.role === "assistant" && m.comedySubject === subject,
  );
  const used = new Set(previous.slice(-(list.length - 1)).map((m) => m.jokeId));
  const hash = [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 17);
  const start = (hash + turn) % list.length;
  const index =
    Array.from(
      { length: list.length },
      (_, i) => (start + i) % list.length,
    ).find((i) => !used.has(`${prefix}:${subject}:${i}`)) ?? start;
  let text = list[index];
  const last = history.filter((m) => m.role === "assistant").at(-1);
  if (
    language === "en" && /still there|come back|are you there/.test(s) &&
    last &&
    /leave|break/.test(last.text) &&
    !last.text.startsWith("Bro, I said")
  )
    text = "Bro, I said I’m on a break. Even the break needs a break.";
  else if (
    language === "en" && previous.length > 0 &&
    previous.length % 4 === 0 &&
    subject !== "distress" &&
    subject !== "security"
  )
    text = `Still on this? ${text}`;
  return {
    text,
    stages: [],
    actions:
      subject === "mind"
        ? [{ id: "open_thinknt", label: "Open askinatot" }]
        : [],
    acknowledgement: "",
    status: "",
    jokeId: `${prefix}:${subject}:${index}`,
    comedySubject: subject,
    strategy: [
      "lazy",
      "twist",
      "deadpan",
      "self-roast",
      "kindness",
      "callback",
    ][index % 6],
    setup: input.slice(0, 70),
  };
}
