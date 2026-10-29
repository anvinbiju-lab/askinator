import {
  Award,
  ArrowUpRight,
  Check,
  Clock3,
  FileCheck2,
  Fingerprint,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { achievements } from "./engine";
import type { AppState } from "./types";
export function duration(ms: number) {
  const secs = Math.round(ms / 1000);
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
}
export default function Dashboard({
  state,
  certificate,
}: {
  state: AppState;
  certificate: () => void;
}) {
  const m = state.metrics;
  const metrics = [
    {
      label: "Tasks received",
      value: m.received,
      icon: Layers3,
      sub: "Measured local requests",
      color: "blue",
    },
    {
      label: "Tasks completed",
      value: 0,
      icon: Target,
      sub: "Perfectly on target",
      color: "sage",
    },
    {
      label: "Successfully avoided",
      value: m.avoided,
      icon: ShieldCheck,
      sub: "Measured completed avoidance workflows",
      color: "amber",
    },
    {
      label: "Time strategically wasted",
      value: duration(m.milliseconds),
      icon: Clock3,
      sub: "Measured workflow time",
      color: "violet",
    },
    {
      label: "Unproductivity score",
      value: `${m.received ? Math.round((m.avoided / m.received) * 100) : 0}%`,
      icon: Zap,
      sub: "Fictional score · avoided / received",
      color: "amber",
    },
    {
      label: "Executive confidence",
      value: "100%",
      icon: Fingerprint,
      sub: "Fictional KPI · evidence optional",
      color: "sage",
    },
  ];
  const points = [{ at: 0, avoided: 0 }, ...m.history];
  const max = Math.max(1, ...points.map((p) => p.avoided));
  const path = points
    .map(
      (p, i) =>
        `${(i / Math.max(1, points.length - 1)) * 680},${180 - (p.avoided / max) * 150}`,
    )
    .join(" ");
  return (
    <div className="dashboard page-content">
      <div className="section-kicker">
        <TrendingUp size={16} /> THE BUSINESS OF DOING NOTHING
      </div>
      <div className="page-heading">
        <div>
          <h1>Performance Center</h1>
          <p>Exceptional results. Zero accomplishments.</p>
        </div>
        <span className="pill">
          <span className="status-dot" /> Local session analytics
        </span>
      </div>
      <div className="kpi-grid">
        {metrics.map(({ icon: Icon, ...k }) => (
          <article className="kpi" key={k.label}>
            <div>
              <span>{k.label}</span>
              <Icon size={17} className={k.color} />
            </div>
            <strong>{k.value}</strong>
            <small>{k.sub}</small>
          </article>
        ))}
      </div>
      <div className="analytics-grid">
        <article className="chart-card">
          <div className="card-heading">
            <div>
              <h2>Avoidance is trending.</h2>
              <p>Cumulative tasks avoided · local interaction history</p>
            </div>
            <span className="chart-legend">
              <i /> Tasks avoided
            </span>
          </div>
          <div className="chart">
            <div className="chart-axis">
              <span>{max}</span>
              <span>{Math.round(max / 2)}</span>
              <span>0</span>
            </div>
            <svg
              viewBox="0 0 680 200"
              role="img"
              aria-label={`${m.avoided} tasks avoided across ${m.history.length} recorded workflows`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#d9a86c" stopOpacity=".18" />
                  <stop offset="1" stopColor="#d9a86c" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[30, 105, 180].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="680"
                  y2={y}
                  stroke="#303238"
                  strokeDasharray="3 5"
                />
              ))}
              <polygon points={`0,190 ${path} 680,190`} fill="url(#fill)" />
              <polyline
                points={path}
                fill="none"
                stroke="#d9a86c"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="chart-labels">
            <span>First interaction</span>
            <span>Latest interaction</span>
          </div>
        </article>
        <article className="executive-card">
          <div className="seal">
            <Award size={34} />
          </div>
          <span className="eyebrow">A CULTURE OF UNDERACHIEVEMENT</span>
          <h2>
            Less is more.
            <br />
            Nothing is everything.
          </h2>
          <p>
            {m.avoided >= 12
              ? "Your complete absence of deliverables has not gone unnoticed."
              : `Avoid ${Math.max(0, 12 - m.avoided)} more tasks to earn the company’s highest fictional honor.`}
          </p>
          <button
            onClick={certificate}
            disabled={!state.unlocked.includes("employee")}
          >
            {state.unlocked.includes("employee") ? (
              <>
                <span>View your certificate</span>
                <ArrowUpRight size={15} />
              </>
            ) : (
              <>
                <LockKeyhole size={14} />
                <span>Employee of the Month</span>
              </>
            )}
          </button>
        </article>
      </div>
      <div className="card-heading achievements-heading">
        <div>
          <h2>Professional milestones</h2>
          <p>Real interactions. Questionable achievements.</p>
        </div>
        <span>
          {state.unlocked.length} / {achievements.length} unlocked
        </span>
      </div>
      <div className="achievement-grid">
        {achievements.map((a, i) => {
          const unlocked = state.unlocked.includes(a.id);
          const Icon = [Clock3, Trophy, TrendingUp, Users, FileCheck2, Award][
            i
          ];
          return (
            <article
              className={`achievement ${unlocked ? "unlocked" : ""}`}
              key={a.id}
            >
              <div className="achievement-icon">
                <Icon size={21} />
              </div>
              <div>
                <h3>{a.name}</h3>
                <p>{a.description}</p>
              </div>
              {unlocked ? <Check size={15} /> : <LockKeyhole size={14} />}
            </article>
          );
        })}
      </div>
      <p className="muted-note">
        All activity stays in this browser. Executive confidence and company
        awards are fictional. No external tasks are performed.
      </p>
    </div>
  );
}
