import RevealVideo from "./RevealVideo";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Maximize,
  Minimize,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  answers,
  freshGame,
  gameReducer,
  GAME_KEY,
  nextQuestion,
  restoreGame,
  ROUND_LENGTH,
} from "./thinkntEngine";

function Mascot({
  mood = "smug",
}: {
  mood?: "smug" | "thinking" | "happy" | "panic";
}) {
  return (
    <svg
      className={`thinknt-mascot mood-${mood}`}
      viewBox="0 0 280 260"
      role="img"
      aria-label={`askinatot, a ${mood} little mind reader`}
    >
      <defs>
        <radialGradient id="orb">
          <stop stopColor="#6f5b8c" />
          <stop offset="1" stopColor="#292335" />
        </radialGradient>
        <linearGradient id="gold" x2="0" y2="1">
          <stop stopColor="#edc18d" />
          <stop offset="1" stopColor="#9a7147" />
        </linearGradient>
      </defs>
      <ellipse cx="140" cy="234" rx="75" ry="9" fill="#000" opacity=".25" />
      <path
        d="M70 162 Q38 114 66 68 Q99 18 152 40 Q217 25 220 101 Q231 152 195 179 Q190 200 159 210 L174 181 Q103 201 70 162Z"
        fill="url(#orb)"
        stroke="#837098"
        strokeWidth="2"
      />
      <path
        d="M73 71 Q138 18 204 70 L196 87 Q142 59 82 88Z"
        fill="#33283d"
        stroke="#a68359"
        strokeWidth="2"
      />
      <path d="M140 37 L150 57 L140 73 L130 57Z" fill="url(#gold)" />
      <path
        d={
          mood === "panic"
            ? "M86 107l25-7 M165 100l26 7"
            : "M87 100l25 8 M164 108l26-9"
        }
        stroke="#d5b9ea"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse
        cx="104"
        cy="125"
        rx="14"
        ry={mood === "happy" ? 5 : 15}
        fill="#f1e6d9"
      />
      <ellipse
        cx="175"
        cy="125"
        rx="14"
        ry={mood === "happy" ? 5 : 15}
        fill="#f1e6d9"
      />
      <circle className="mascot-pupil" cx="108" cy="127" r="6" fill="#201b27" />
      <circle className="mascot-pupil" cx="178" cy="127" r="6" fill="#201b27" />
      <path
        d={
          mood === "panic"
            ? "M131 157Q140 145 150 157Z"
            : "M125 154Q145 170 160 150"
        }
        fill={mood === "panic" ? "#201b27" : "none"}
        stroke="#d6b1dd"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M71 181Q140 211 208 181L196 207Q140 225 84 207Z"
        fill="url(#gold)"
      />
      <path
        d="M110 221H169"
        stroke="#aa8358"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <g fill="#d9ad79">
        <path d="M44 114l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" />
        <path d="M234 52l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />
      </g>
    </svg>
  );
}
export default function Thinknt({ reduced }: { reduced: boolean }) {
  const [game, dispatch] = useReducer(gameReducer, undefined, () => {
    try {
      return restoreGame(localStorage.getItem(GAME_KEY));
    } catch {
      return freshGame();
    }
  });
  const [expanded, setExpanded] = useState(false);
  const gameRoot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const changed = () => { if (!document.fullscreenElement) setExpanded(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setExpanded(false); };
    document.addEventListener("fullscreenchange", changed);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("fullscreenchange", changed); document.removeEventListener("keydown", escape); };
  }, []);
  async function toggleFullscreen() {
    if (expanded) { setExpanded(false); if (document.fullscreenElement === gameRoot.current) await document.exitFullscreen().catch(() => {}); }
    else { setExpanded(true); await gameRoot.current?.requestFullscreen?.().catch(() => {}); }
  }
  const [stage, setStage] = useState(0),
    [storageError, setStorageError] = useState(false);
  const audio = useRef<AudioContext | null>(null),
    questionRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem(GAME_KEY, JSON.stringify(game));
    } catch {
      setStorageError(true);
    }
  }, [game]);
  useEffect(() => {
    if (game.phase !== "thinking") return;
    setStage(0);
    if (reduced) {
      dispatch({ type: "reveal" });
      return;
    }
    let tick = 0;
    const timer = window.setInterval(() => {
      tick++;
      setStage(tick);
      if (tick === 3) {
        clearInterval(timer);
        dispatch({ type: "reveal" });
      }
    }, 350);
    return () => clearInterval(timer);
  }, [game.phase, reduced]);
  useEffect(() => {
    if (game.phase === "question")
      questionRef.current?.focus({ preventScroll: true });
  }, [game.history.length, game.phase]);
  useEffect(
    () => () => {
      void audio.current?.close().catch(() => {});
    },
    [],
  );
  function sound(kind: "click" | "wrong" | "win" = "click", force = false) {
    if (game.muted && !force) return;
    try {
      const ctx = audio.current ?? (audio.current = new AudioContext());
      void ctx.resume().catch(() => {});
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(
        kind === "win" ? 660 : kind === "wrong" ? 160 : 380,
        ctx.currentTime,
      );
      osc.frequency.exponentialRampToValueAtTime(
        kind === "win" ? 990 : kind === "wrong" ? 90 : 500,
        ctx.currentTime + 0.12,
      );
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      /* Sound is optional. */
    }
  }
  const q = nextQuestion(game.history);
  const progress = Math.min(100, (game.history.length / ROUND_LENGTH) * 100);
  return (
    <div ref={gameRoot} className={`thinknt page-content ${expanded ? "thinknt-fullscreen" : ""}`}>
      <div className="thinknt-toolbar">
        <button className="secondary-button" onClick={toggleFullscreen} aria-pressed={expanded}>{expanded ? <Minimize size={15}/> : <Maximize size={15}/>} {expanded ? "Exit full screen" : "Full screen"}</button>
        <span className="section-kicker">
          <Brain size={16} /> MIND READING. MINIMUM EFFORT.
        </span>
        <button
          className="secondary-button"
          onClick={() => {
            if (game.muted) sound("click", true);
            dispatch({ type: "mute" });
          }}
          aria-label={game.muted ? "Unmute game sounds" : "Mute game sounds"}
          aria-pressed={!game.muted}
        >
          {game.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span>{game.muted ? "Effects off" : "Effects on"}</span>
        </button>
      </div>
      <div className="thinknt-brand">
        <span>
          askinatot<span className="brand-ai">BETA</span>
        </span>
        <p>Think of someone. I’ll probably embarrass myself.</p>
      </div>
      {game.phase === "intro" ? (
        <section className="thinknt-intro">
          <div className="thinknt-orbit">
            <Mascot />
            <span className="orb-label">
              <span className="status-dot" /> ABSURDLY CONFIDENT
            </span>
          </div>
          <div className="thinknt-intro-copy">
            <span className="eyebrow">
              THINK OF A PERSON. DON’T TELL ME THE NAME.
            </span>
            <h1>
              Think of someone.
              <br />
              <em>I’ll guess. Badly.</em>
              <br />
              Obviously.
            </h1>
            <p>
              Pick a real person or a made-up character. Answer a few easy questions. Try not to judge me.
            </p>
            <button
              className="primary-button"
              onClick={() => {
                sound();
                dispatch({ type: "start" });
              }}
            >
              Let’s play <ArrowRight size={16} />
            </button>
            <small>
              A playful branching game. No real mind reading or person
              identification.
            </small>
          </div>
        </section>
      ) : (
        <section className="thinknt-play">
          <div className="game-utility">
            <span className="eyebrow">
              {game.phase === "question"
                ? `QUESTION ${game.history.length + 1} OF ${ROUND_LENGTH}`
                : `${game.history.length} QUESTIONS. SO MUCH CONFIDENCE.`}
            </span>
            <button
              onClick={() => {
                sound();
                dispatch({ type: "restart" });
              }}
              className="game-text-button"
            >
              <RotateCcw size={13} /> Restart round
            </button>
          </div>
          <div
            className="game-progress"
            aria-label="Round progress"
            role="progressbar"
            aria-valuenow={game.history.length}
            aria-valuemin={0}
            aria-valuemax={ROUND_LENGTH}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div
            className="game-stage"
            key={game.phase === "question" ? q?.id : game.phase}
          >
            <div className="game-mascot">
              <Mascot
                mood={
                  game.phase === "thinking"
                    ? "thinking"
                    : game.phase === "complete"
                      ? game.correct
                        ? "happy"
                        : "panic"
                      : game.wrong
                        ? "panic"
                        : "smug"
                }
              />
            </div>
            {game.phase === "question" && q ? (
              <>
                <p className="game-subtitle">
                  {game.history.length === 0 ? "Think of someone. Keep the name secret, bro." : ["Okay. My brain is making dial-up noises.", "Interesting. I have no idea what to do with that.", "Yes, yes. Pretending to understand.", "My last brain cell is sweating.", "Don’t rush me. I only have one brain cell."][game.history.length % 5]}
                </p>
                <h2 ref={questionRef} tabIndex={-1} className="game-question">
                  {q.text}
                </h2>
                <div className="game-answers">
                  {answers.map((answer, i) => (
                    <button
                      className={`answer-button answer-${i}`}
                      key={answer}
                      onClick={() => {
                        sound();
                        dispatch({ type: "answer", answer, questionId: q.id });
                      }}
                    >
                      {answer}
                      {i < 2 && (
                        <span>
                          {i === 0 ? <Check size={15} /> : <X size={15} />}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  className="game-text-button previous-question"
                  disabled={!game.history.length}
                  onClick={() => dispatch({ type: "back" })}
                >
                  <ArrowLeft size={13} /> Previous question
                </button>
              </>
            ) : game.phase === "thinking" ? (
              <div className="game-reveal" role="status" aria-live="polite">
                <span className="eyebrow">YOUR CHARACTER IS…</span>
                <h2>
                  {
                    [
                      "Knocking on your brain…",
                      "Calling your last brain cell…",
                      "Bro. It’s empty in here.",
                    ][Math.min(stage, 2)]
                  }
                </h2>
                <div className="typing-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <button
                  className="secondary-button"
                  onClick={() => dispatch({ type: "reveal" })}
                >
                  Skip to the terrible guess <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="game-result" aria-live="polite">
                <span className="eyebrow">I FOUND THEM. DON’T ASK HOW.</span>
                <RevealVideo key={game.round} round={game.round}/>
                <div className="result-buttons"><button className="primary-button" onClick={()=>dispatch({type:"restart"})}>Play Again <RotateCcw size={14}/></button></div>
              </div>
            )}
          </div>
        </section>
      )}
      <footer className="thinknt-footer">
        <span>
          <strong>{game.stats.rounds}</strong> rounds survived
        </span>
        <span>
          <strong>{game.stats.accepted}</strong> questionable victories
        </span>
        <span>
          <strong>0</strong> actual minds read
        </span>
      </footer>
      {storageError && (
        <p role="status" className="muted-note">
          This round works, but browser storage is unavailable. Progress won’t
          survive a reload.
        </p>
      )}
    </div>
  );
}
