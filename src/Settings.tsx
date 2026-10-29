import {
  Database,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import type { AppState } from "./types";
export default function Settings({
  state,
  update,
  confirm,
}: {
  state: AppState;
  update: (settings: AppState["settings"]) => void;
  confirm: (action: "stats" | "history" | "all") => void;
}) {
  return (
    <div className="settings page-content">
      <div className="section-kicker">
        <SlidersHorizontal size={16} /> WORKSPACE PREFERENCES
      </div>
      <h1>Settings</h1>
      <p className="page-subtitle">Fine-tune the art of not doing things.</p>
      <section className="settings-section">
        <h2>Intelligence, allegedly.</h2>
        <div className="setting-row">
          <div>
            <h3>askinatot Demo Engine</h3>
            <p>
              Contextual, rule-based comedy. No network. No credentials. No
              initiative.
            </p>
          </div>
          <span className="pill">
            <span className="status-dot" /> Active
          </span>
        </div>
        <div className="engine-note">
          <ShieldCheck size={18} />
          <p>
            The chatbot, mind reader, and Labs are scripted local demos. Live AI
            is not configured in this version. Your conversations are saved only
            in this browser.
          </p>
        </div>
      </section>
      <section className="settings-section">
        <h2>The experience</h2>
        {[
          {
            key: "reducedMotion" as const,
            title: "Reduced animation",
            text: "Skip game reveals and minimize interface motion.",
          },
          {
            key: "chaos" as const,
            title: "Progressive chaos",
            text: "Let the old chaos effects escalate inside askinatot Labs.",
          },
        ].map((s) => (
          <div className="setting-row" key={s.key}>
            <div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
            <button
              className={`switch ${state.settings[s.key] ? "on" : ""}`}
              role="switch"
              aria-checked={state.settings[s.key]}
              aria-label={s.title}
              onClick={() =>
                update({ ...state.settings, [s.key]: !state.settings[s.key] })
              }
            >
              <span />
            </button>
          </div>
        ))}
      </section>
      <section className="settings-section">
        <h2>Local data</h2>
        {[
          {
            action: "stats" as const,
            title: "Reset performance statistics",
            text: "Reset metrics, achievements, and chaos progression. Keep conversations.",
            icon: RotateCcw,
            label: "Reset statistics",
          },
          {
            action: "history" as const,
            title: "Clear conversation history",
            text: "Delete saved conversations. Keep your outstanding record of nothing.",
            icon: Trash2,
            label: "Clear history",
          },
          {
            action: "all" as const,
            title: "Reset demonstration",
            text: "A clean slate for the judges. Remove all local data and preferences.",
            icon: Database,
            label: "Reset demo",
          },
        ].map(({ icon: Icon, ...s }) => (
          <div className="setting-row" key={s.action}>
            <div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => confirm(s.action)}
            >
              <Icon size={14} />
              {s.label}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
