import { randomMeme, resetVideoOrder } from "./media";
import Thinknt from "./Thinknt";
import { GAME_KEY } from "./thinkntEngine";
import { actionWorkflow, actionRegistry, validAction } from "./comedy";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  Brain,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Coffee,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  achievements,
  chaosLevel,
  freshMetrics,
  freshState,
  generate,
  newlyUnlocked,
  topicOf,
} from "./engine";
import { loadState, STORAGE_KEY } from "./storage";
import type { AppState, Conversation, Workflow } from "./types";
import {
  BrandMark,
  Composer,
  CouncilWelcome,
  Message,
  Processing,
  Toast,
  Welcome,
} from "./components";
import Dashboard, { duration } from "./Dashboard";
import Settings from "./Settings";
type Screen =
  | "chat"
  | "thinknt"
  | "conversations"
  | "council"
  | "meeting"
  | "performance"
  | "settings";
interface Pending {
  conversationId: string;
  workflow: Workflow;
  step: number;
  started: number;
}
export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [screen, setScreen] = useState<Screen>("chat");
  const [active, setActive] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const busyRef = useRef(false);
  const [mobile, setMobile] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [narrow, setNarrow] = useState(
    () => window.matchMedia("(max-width: 640px)").matches,
  );
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<
    "certificate" | "finale" | "stats" | "history" | "all" | "about" | null
  >(null);
  const [search, setSearch] = useState("");
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const [finaleDismissed, setFinaleDismissed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => { mainRef.current?.scrollTo({top:0}); }, [screen]);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousUnlocks = useRef(state.unlocked);
  const storageWarned = useRef(false);
  const level = state.settings.chaos
    ? chaosLevel(state.sessionTasks, state.insistence)
    : 0;
  const current = state.conversations.find((c) => c.id === active);
  const kind =
    screen === "council"
      ? "council"
      : screen === "meeting"
        ? "meeting"
        : "chat";
  const reduced =
    state.settings.reducedMotion ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const change = () => setNarrow(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      if (!storageWarned.current) {
        setToast(
          "Browser storage is full or unavailable. This session is still usable, but changes may not persist.",
        );
        storageWarned.current = true;
      }
    }
  }, [state]);
  useEffect(() => {
    const added = state.unlocked.filter(
      (x) => !previousUnlocks.current.includes(x),
    );
    previousUnlocks.current = state.unlocked;
    if (added.length && ["council", "meeting", "performance"].includes(screen))
      setToast(
        `Achievement unlocked · ${added.map((id) => achievements.find((a) => a.id === id)?.name).join(" · ")}`,
      );
  }, [state.unlocked]);
  useEffect(() => {
    if (
      ["council", "meeting", "performance"].includes(screen) &&
      level === 5 &&
      !finaleDismissed &&
      !pending
    )
      setModal("finale");
  }, [level, finaleDismissed, pending, screen]);
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "end",
    });
  }, [current?.messages.length, pending?.step, screen, reduced]);
  useEffect(() => {
    if (!modal) return;
    const old = document.activeElement as HTMLElement | null;
    const dialog = modalRef.current;
    dialog?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setFinaleDismissed(true);
      }
      if (e.key === "Tab") {
        const els = dialog?.querySelectorAll<HTMLElement>(
          'button,[href],input,textarea,[tabindex="0"]',
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || document.activeElement === dialog)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      old?.focus();
    };
  }, [modal]);
  const finish = useCallback((job: Pending) => {
    busyRef.current = false;
    setPending(null);
    setState((s) => {
      const safe = job.workflow.intent === "sensitive";
      const metrics = {
        ...s.metrics,
        avoided: s.metrics.avoided + (safe ? 0 : 1),
        milliseconds:
          s.metrics.milliseconds + Math.max(0, Date.now() - job.started),
        council: s.metrics.council + (job.workflow.council ? 1 : 0),
        coding: s.metrics.coding + (job.workflow.intent === "coding" ? 1 : 0),
      };
      metrics.history = [
        ...metrics.history,
        { at: Date.now(), avoided: metrics.avoided },
      ].slice(-60);
      return {
        ...s,
        metrics,
        sessionTasks: s.sessionTasks + (safe ? 0 : 1),
        unlocked: [...s.unlocked, ...newlyUnlocked(metrics, s.unlocked)],
        conversations: s.conversations.map((c) =>
          c.id === job.conversationId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    at: Date.now(),
                    ...job.workflow,
                    text: job.workflow.text,
                    stages: job.workflow.stages,
                    council: job.workflow.council,
                    intent: job.workflow.intent,
                    status: job.workflow.status,
                  },
                ],
              }
            : c,
        ),
      };
    });
  }, []);
  useEffect(() => {
    if (!pending) return;
    const total =
      pending.workflow.stages.length + (pending.workflow.council?.length || 0);
    const t = window.setTimeout(
      () => {
        if (reduced || pending.step >= total) finish(pending);
        else setPending((p) => (p ? { ...p, step: p.step + 1 } : null));
      },
      reduced ? 80 : pending.step >= pending.workflow.stages.length ? 550 : 420,
    );
    return () => clearTimeout(t);
  }, [pending, reduced, finish]);
  function navigate(next: Screen) {
    if (["council", "meeting", "performance"].includes(next)) setMoreOpen(true);
    setScreen(next);
    setMobile(false);
    if (next === "chat" || next === "council" || next === "meeting") {
      const latest = state.conversations.find((c) => c.kind === next);
      setActive(latest?.id || null);
    }
  }
  function newChat(next: "chat" | "council" | "meeting" = "chat") {
    setScreen(next);
    setActive(null);
    setMobile(false);
  }
  function open(c: Conversation) {
    if (c.kind !== "chat") setMoreOpen(true);
    setActive(c.id);
    setScreen(c.kind);
    setMobile(false);
  }
  function submit(text: string, override?: Workflow) {
    if (busyRef.current || !text.trim()) return;
    busyRef.current = true;
    const conversationId =
      current?.kind === kind ? current.id : crypto.randomUUID();
    const workflow =
      override ??
      generate(
        text,
        state.metrics.received,
        level,
        kind !== "chat",
        kind === "meeting",
        current?.messages ?? [],
        state.settings.language,
      );
    if (kind === "chat" && workflow.intent !== "sensitive") workflow.memeKey = randomMeme(current?.messages.filter(m => m.role === "assistant").at(-1)?.memeKey);
    const message = {
      id: crypto.randomUUID(),
      role: "user" as const,
      text: text.trim().slice(0, 6000),
      at: Date.now(),
    };
    setState((s) => ({
      ...s,
      metrics: { ...s.metrics, received: s.metrics.received + 1 },
      insistence:
        s.insistence +
        (/stop|actually|do some work|seriously|finish|urgent/i.test(text)
          ? 1
          : 0),
      conversations: s.conversations.some((c) => c.id === conversationId)
        ? s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, message] }
              : c,
          )
        : [
            {
              id: conversationId,
              title: `${kind === "chat" ? "Operation" : kind === "council" ? "Council" : "Meeting"}: ${topicOf(text).slice(0, 42)}`,
              kind,
              messages: [message],
              created: Date.now(),
            },
            ...s.conversations,
          ],
    }));
    setActive(conversationId);
    setPending({ conversationId, workflow, step: 0, started: Date.now() });
  }
  function comedyAction(messageId: string, id: string) {
    if (busyRef.current) {
      setToast("One disaster at a time. Finish or skip the current sketch.");
      return;
    }
    const message = current?.messages.find((m) => m.id === messageId);
    if (
      !validAction(id) ||
      !message?.actions?.some((a) => a.id === id) ||
      message.usedActions?.includes(id)
    ) {
      setToast(
        "That opportunity has expired. Please request a fresh disaster.",
      );
      return;
    }
    if (id === "open_thinknt") {
      navigate("thinknt");
      return;
    }
    const workflow = actionWorkflow(id);
    if (!workflow) return;
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === active
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId
                  ? { ...m, usedActions: [...(m.usedActions ?? []), id] }
                  : m,
              ),
            }
          : c,
      ),
    }));
    submit(actionRegistry[id].label, workflow);
  }
  function remove(id: string) {
    if (pending?.conversationId === id) {
      setToast(
        "Finish or skip this conversation’s active workflow before deleting it.",
      );
      return;
    }
    setState((s) => ({
      ...s,
      conversations: s.conversations.filter((c) => c.id !== id),
    }));
    if (active === id) setActive(null);
  }
  function reset(action: "stats" | "history" | "all") {
    if (pending) {
      setToast(
        "Finish or skip the active workflow before resetting local data.",
      );
      setModal(null);
      return;
    }
    if (action === "all") {
      setState(freshState());
      resetVideoOrder();
      try {
        localStorage.removeItem(GAME_KEY);
      } catch {
        /* Storage may be disabled. */
      }
      setActive(null);
      setScreen("chat");
    } else if (action === "stats") {
      setState((s) => ({
        ...s,
        metrics: freshMetrics(),
        unlocked: [],
        sessionTasks: 0,
        insistence: 0,
      }));
    } else {
      setState((s) => ({ ...s, conversations: [] }));
      setActive(null);
    }
    setModal(null);
    setFinaleDismissed(false);
    setDismissedWarning(false);
    setToast(
      action === "all"
        ? "Demo reset. Ready to achieve nothing again."
        : "Local data updated.",
    );
  }
  const closeToast = useCallback(() => setToast(""), []);
  const closeModal = () => {
    setModal(null);
    setFinaleDismissed(true);
  };
  const chatView = ["chat", "council", "meeting"].includes(screen);
  return (
    <div className={`app ${reduced ? "reduce-motion" : ""} ${sidebarHidden ? "sidebar-hidden" : ""}`}>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="workspace-sidebar"
        className={`sidebar ${mobile ? "mobile-open" : ""}`}
        inert={(narrow ? !mobile : sidebarHidden) ? true : undefined}
      >
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            newChat();
          }}
        >
          <BrandMark small />
          <span>
            askinatot<span className="brand-ai">AI</span>
          </span>
          <span className="version">3.0</span>
        </a>
        <p className="brand-subtitle">The world’s most useless chatbot</p>
        <button className="new-chat" onClick={() => newChat()}>
          <Plus size={17} /> New conversation <span>↗</span>
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Primary navigation">
          {[
            {
              id: "chat" as const,
              icon: MessageSquare,
              label: "Chat",
              tag: "0% effort",
            },
            {
              id: "thinknt" as const,
              icon: Brain,
              label: "Mind Reader",
              tag: "Mind Reader",
            },
            {
              id: "conversations" as const,
              icon: LayersIcon,
              label: "Conversations",
            },
          ].map(({ id, icon: Icon, label, tag }) => (
            <button
              className={screen === id ? "active" : ""}
              key={id}
              onClick={() => navigate(id)}
            >
              <Icon size={17} />
              <span>{label}</span>
              {tag && <small>{tag}</small>}
            </button>
          ))}
        </nav>
        <button
          className="more-toggle"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(!moreOpen)}
        >
          <ChevronRight size={14} className={moreOpen ? "rotate" : ""} /> More{" "}
          <span>askinatot Labs</span>
        </button>
        {moreOpen && (
          <nav aria-label="More features">
            {[
              { id: "council" as const, icon: Users, label: "Agent Council" },
              {
                id: "performance" as const,
                icon: ChartNoAxesCombined,
                label: "Performance Center",
              },
              {
                id: "meeting" as const,
                icon: Coffee,
                label: "Meeting Simulator",
              },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={screen === id ? "active" : ""}
                onClick={() => navigate(id)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
        )}
        <div className="nav-label recent-label">
          RECENT CONVERSATIONS{" "}
          <span>{state.conversations.length.toString().padStart(2, "0")}</span>
        </div>
        <div className="recent-list">
          {state.conversations.length === 0 ? (
            <div className="recent-empty">
              <MessageSquare size={16} />
              <span>
                A clean record.
                <br />
                Let’s keep it unproductive.
              </span>
            </div>
          ) : (
            state.conversations.slice(0, 7).map((c) => (
              <div
                key={c.id}
                className={`recent-item ${active === c.id ? "selected" : ""}`}
              >
                <button onClick={() => open(c)}>
                  <MessageSquare size={13} />
                  <span>{c.title}</span>
                </button>
                <button
                  className="delete-chat"
                  aria-label={`Delete ${c.title}`}
                  onClick={() => remove(c.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="quota-card">
            <div>
              <span>Daily productivity</span>
              <span>0%</span>
            </div>
            <div className="quota-line" />
            <p>
              Well below expectations.
              <br />
              Exactly as intended.
            </p>
            <ArrowDownLeft size={17} />
          </div>
          <button
            className={`settings-nav ${screen === "settings" ? "active" : ""}`}
            onClick={() => navigate("settings")}
          >
            <Settings2 size={17} /> Settings
          </button>
          <button className="employee-status" onClick={() => setModal("about")}>
            <div className="employee-avatar">
              W<span />
            </div>
            <div>
              <strong>askinatot</strong>
              <span>Currently avoiding work</span>
            </div>
            <ChevronRight size={15} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <button className="sidebar-toggle icon-button" onClick={()=>setSidebarHidden(hidden=>!hidden)} aria-label={sidebarHidden ? "Show sidebar" : "Hide sidebar"} title={sidebarHidden ? "Show sidebar" : "Hide sidebar"} aria-expanded={!sidebarHidden} aria-controls="workspace-sidebar">{sidebarHidden ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}</button>
            <span className="breadcrumb">Workspace</span>
            <ChevronRight size={13} />
            <strong>
              {
                {
                  chat: "Chat",
                  thinknt: "askinatot · Mind Reader",
                  conversations: "Conversations",
                  council: "Agent Council",
                  performance: "Performance Center",
                  meeting: "Meeting Simulator",
                  settings: "Settings",
                }[screen]
              }
            </strong>
            {chatView && current && (
              <button
                className="header-new"
                onClick={() => newChat(kind)}
                title="New session"
              >
                <Plus size={15} />
              </button>
            )}
          </div>
          <div>
            {screen === "chat" && <label className="language-control"><span>Reply in</span><select aria-label="Chat response language" value={state.settings.language} onChange={e=>setState(s=>({...s,settings:{...s.settings,language:e.target.value === "ml" ? "ml" : "en"}}))}><option value="en">English</option><option value="ml">മലയാളം</option></select></label>}
            <span className="engine-label">
              <span className="status-dot" /> Demo Engine{" "}
              <ChevronDown size={12} />
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button help-button"
              aria-label="About askinatot"
              onClick={() => setModal("about")}
            >
              <CircleHelp size={17} />
            </button>
            <span className="user-avatar">YOU</span>
          </div>
        </header>
        {!["chat", "thinknt", "conversations"].includes(screen) && (
          <div className="status-strip">
            <div>
              <span className="status-dot" />
              <span>Unproductive mode active</span>
              <span className="strip-separator">/</span>
              <span>
                Efficiency <strong>0%</strong>
              </span>
            </div>
            <span>
              <span className="level-bars">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <i key={i} className={i <= level ? "lit" : ""} />
                ))}
              </span>{" "}
              {
                [
                  "Corporate professionalism",
                  "Suspicious intelligence",
                  "Bureaucratic overload",
                  "Productivity emergency",
                  "Executive intervention",
                  "Absolute nothing",
                ][level]
              }{" "}
              <span className="strip-separator">·</span> L{level}
            </span>
          </div>
        )}
        {["council", "meeting", "performance"].includes(screen) &&
          level >= 3 &&
          !dismissedWarning && (
            <div className="warning-banner">
              <Zap size={15} />
              <div>
                <strong>Productivity threat detected.</strong> Your request may
                result in measurable progress. Defensive measures activated.
              </div>
              <button
                aria-label="Dismiss productivity warning"
                onClick={() => setDismissedWarning(true)}
              >
                <X size={15} />
              </button>
            </div>
          )}
        <main ref={mainRef} className={chatView ? "chat-main" : "content-main"}>
          {chatView ? (
            <>
              <div className="chat-scroll">
                {!current?.messages.length ? (
                  kind === "chat" ? (
                    <Welcome
                      onSubmit={submit}
                      onThinknt={() => navigate("thinknt")}
                    />
                  ) : (
                    <CouncilWelcome meeting={kind === "meeting"} />
                  )
                ) : (
                  <div className="message-list">
                    {current.messages.map((m) => (
                      <Message
                        key={m.id}
                        message={m}
                        notify={setToast}
                        onAction={comedyAction}
                        busy={!!pending}
                        simple={kind === "chat"}
                      />
                    ))}
                    {pending?.conversationId === current.id &&
                      (kind === "chat" ? (
                        <div
                          className="chat-typing"
                          role="status"
                          aria-label="askinatot is typing"
                        >
                          <span className="typing-dots">
                            <i />
                            <i />
                            <i />
                          </span>
                        </div>
                      ) : (
                        <Processing
                          workflow={pending.workflow}
                          step={pending.step}
                          skip={() => finish(pending)}
                        />
                      ))}
                    <div ref={endRef} />
                  </div>
                )}
                {!current?.messages.length && kind !== "chat" && (
                  <div className="council-prompts">
                    {[
                      "Should I study for tomorrow’s exam?",
                      "Should I drink water?",
                    ].map((p) => (
                      <button
                        key={p}
                        disabled={!!pending}
                        onClick={() => submit(p)}
                      >
                        {p}
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {pending && pending.conversationId !== current?.id && (
                <button
                  className="background-job"
                  onClick={() => {
                    const c = state.conversations.find(
                      (c) => c.id === pending.conversationId,
                    );
                    if (c) open(c);
                  }}
                >
                  A fictional workflow is running in another conversation. View
                  progress <ChevronRight size={14} />
                </button>
              )}
              <Composer onSubmit={submit} busy={!!pending} kind={kind} />
            </>
          ) : screen === "thinknt" ? (
            <Thinknt reduced={reduced} />
          ) : screen === "performance" ? (
            <Dashboard
              state={state}
              certificate={() => setModal("certificate")}
            />
          ) : screen === "settings" ? (
            <Settings
              state={state}
              update={(settings) => setState((s) => ({ ...s, settings }))}
              confirm={setModal}
            />
          ) : (
            <div className="page-content conversations-page">
              <div className="section-kicker">
                <MessageSquare size={16} /> AN ARCHIVE OF AMBITIOUS INACTION
              </div>
              <div className="page-heading">
                <div>
                  <h1>Conversations</h1>
                  <p>Everything you asked. Nothing accomplished.</p>
                </div>
                <button className="secondary-button" onClick={() => newChat()}>
                  <Plus size={15} /> New conversation
                </button>
              </div>
              <label className="search-box">
                <Search size={17} />
                <input
                  placeholder="Search conversations…"
                  aria-label="Search conversations"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <div className="conversation-table">
                {state.conversations
                  .filter((c) =>
                    `${c.title} ${c.messages.map((m) => m.text).join(" ")}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((c) => (
                    <div className="conversation-row" key={c.id}>
                      <button onClick={() => open(c)}>
                        <MessageSquare size={20} />
                        <div>
                          <h3>{c.title}</h3>
                          <span>
                            {c.kind === "chat"
                              ? "Conversation"
                              : c.kind === "meeting"
                                ? "Meeting"
                                : "Agent Council"}{" "}
                            · {c.messages.length} messages ·{" "}
                            {new Date(c.created).toLocaleDateString()}
                          </span>
                        </div>
                        <ArrowUpRight size={16} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete ${c.title}`}
                        onClick={() => remove(c.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                {state.conversations.filter((c) =>
                  `${c.title} ${c.messages.map((m) => m.text).join(" ")}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                ).length === 0 && (
                  <div className="empty-history">
                    <MessageSquare size={30} />
                    <h3>
                      {search
                        ? "No matching conversations."
                        : "No unfinished business. Yet."}
                    </h3>
                    <p>
                      Start a conversation. We’ll take it from there.
                      Eventually.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {toast && <Toast text={toast} close={closeToast} />}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className={`modal ${modal === "finale" || modal === "certificate" ? "certificate-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="modal-close icon-button"
              aria-label="Close dialog"
              onClick={closeModal}
            >
              <X size={20} />
            </button>
            {modal === "about" ? (
              <>
                <BrandMark />
                <span className="section-kicker">
                  POWERED BY AI. DRIVEN BY NOTHING.
                </span>
                <h2 id="modal-title">
                  A remarkably capable
                  <br />
                  waste of your time.
                </h2>
                <p>
                  askinatot is a satirical AI workspace for FUNATHON 2026. The
                  contextual Demo Engine runs entirely in your browser. Its
                  employees, workflows, policies, awards, and executive metrics
                  are fictional.
                </p>
                <p>
                  The interface, local persistence, measured counters, and
                  dedication to avoiding your tasks are fully functional.
                </p>
                <button className="primary-button" onClick={closeModal}>
                  Back to not working <ArrowUpRight size={15} />
                </button>
              </>
            ) : modal === "certificate" || modal === "finale" ? (
              <>
                <div className="certificate-seal">
                  <Award size={46} />
                </div>
                <div className="eyebrow">
                  askinatot · DEPARTMENT OF STRATEGIC INACTION
                </div>
                <h2 id="modal-title">
                  {modal === "finale"
                    ? "Operation Nothing — Complete"
                    : "Employee of the Month"}
                </h2>
                <p className="certificate-subtitle">
                  {modal === "finale"
                    ? "After extraordinary computational effort, we have achieved precisely what we set out to achieve."
                    : "For consistently exceeding expectations in doing absolutely nothing."}
                </p>
                <div className="certificate-stats">
                  <span>
                    <strong>{state.metrics.avoided}</strong>Tasks avoided
                  </span>
                  <span>
                    <strong>{duration(state.metrics.milliseconds)}</strong>Time
                    spent
                  </span>
                  <span>
                    <strong>0</strong>Useful decisions
                  </span>
                </div>
                <p className="certificate-quote">
                  “You did it. You accomplished absolutely nothing.
                  <br />
                  We’re incredibly proud of you.”
                </p>
                <div className="certificate-signature">
                  The Management
                  <span>
                    Fictional executive board · Rating: Exceeds inaction
                  </span>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    setState((s) => ({ ...s, sessionTasks: 0, insistence: 0 }));
                    setFinaleDismissed(false);
                    setDismissedWarning(false);
                    setModal(null);
                    newChat();
                  }}
                >
                  Start another productive-looking session{" "}
                  <ArrowUpRight size={15} />
                </button>
                {!state.unlocked.includes("employee") && (
                  <small className="muted-note">
                    Operation complete. Employee of the Month unlocks at 12
                    avoided tasks.
                  </small>
                )}
              </>
            ) : (
              <>
                <div className="danger-icon">
                  <Trash2 size={22} />
                </div>
                <h2 id="modal-title">
                  {modal === "all"
                    ? "Reset the demonstration?"
                    : modal === "history"
                      ? "Clear conversation history?"
                      : "Reset performance statistics?"}
                </h2>
                <p>
                  {modal === "all"
                    ? "This removes all saved conversations, statistics, achievements, and settings from this browser."
                    : modal === "history"
                      ? "This permanently deletes all conversations saved in this browser. Your statistics and achievements remain."
                      : "This resets statistics, achievements, and chaos progression. Saved conversations remain."}
                </p>
                <div className="modal-actions">
                  <button className="secondary-button" onClick={closeModal}>
                    Keep my nothing
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => reset(modal)}
                  >
                    Confirm reset
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function LayersIcon({ size = 17 }: { size?: number }) {
  return <MessageSquare size={size} />;
}
