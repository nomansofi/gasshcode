import { useEffect, useMemo, useRef, useState } from "react";

/**
 * GasshCode Academy — Hall of Fame / Selections
 * React + Tailwind CSS (v3 or v4). No other dependencies.
 *
 * Usage:  <HallOfFame />            (uses the built-in list below)
 *         <HallOfFame students={myList} logoSrc="/assets/logo.png" />
 *
 * Each student: { id, name, category, quota? }
 * category must be one of: "Open Merit" | "Reserved Quotas" | "Self-Finance"
 * quota is an optional small tag such as "RBA" or "Sports".
 */

export const CATEGORIES = ["All", "Open Merit", "Reserved Quotas", "Self-Finance"];

export const DEFAULT_STUDENTS = [
  { id: 1, name: "Malik Sadaf Khurshid", category: "Open Merit" },
  { id: 2, name: "Mohammad Altaf Dar", category: "Open Merit" },
  { id: 3, name: "Mohammad Obaid", category: "Open Merit" },
  { id: 4, name: "Soliva Reyaz", category: "Open Merit" },
  { id: 5, name: "Yasmeena Mehraj", category: "Reserved Quotas", quota: "RBA" },
  { id: 6, name: "Aamir Bashir Sofi", category: "Open Merit" },
  { id: 7, name: "Salik Hamid", category: "Reserved Quotas", quota: "Sports" },
  { id: 8, name: "Azaan Mir", category: "Self-Finance" },
  { id: 9, name: "Zainab Farheen", category: "Self-Finance" },
  { id: 10, name: "Sheikh Shamuss", category: "Self-Finance" },
];

const BADGE_STYLES = {
  "Open Merit": "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  "Reserved Quotas": "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  "Self-Finance": "bg-violet-400/15 text-violet-300 ring-violet-400/30",
};

const AVATAR_STYLES = {
  "Open Merit": "from-sky-500 to-blue-600",
  "Reserved Quotas": "from-amber-400 to-orange-500",
  "Self-Finance": "from-violet-500 to-fuchsia-600",
};

const FADE_MS = 200;

function initials(name) {
  const parts = name.replace(/\[.*?\]/g, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function StudentCard({ student, index }) {
  return (
    <li
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-white/[0.07] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ transitionDelay: `${Math.min(index, 8) * 25}ms` }}
    >
      <div
        aria-hidden="true"
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br ${AVATAR_STYLES[student.category]} text-lg font-extrabold text-white shadow-inner`}
      >
        {initials(student.name)}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-base font-bold text-white">{student.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGE_STYLES[student.category]}`}
          >
            {student.category}
          </span>
          {student.quota && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-200 ring-1 ring-inset ring-white/15">
              {student.quota}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default function HallOfFame({
  students = DEFAULT_STUDENTS,
  logoSrc = "/assets/logo.png",
}) {
  const [active, setActive] = useState("All");
  const [shown, setShown] = useState("All"); // filter currently rendered
  const [visible, setVisible] = useState(true); // drives fade in/out
  const timer = useRef(null);

  // Fade the grid out, swap the list, fade back in.
  useEffect(() => {
    if (active === shown) return undefined;
    setVisible(false);
    timer.current = setTimeout(() => {
      setShown(active);
      setVisible(true);
    }, FADE_MS);
    return () => clearTimeout(timer.current);
  }, [active, shown]);

  const counts = useMemo(() => {
    const c = { All: students.length };
    students.forEach((s) => {
      c[s.category] = (c[s.category] ?? 0) + 1;
    });
    return c;
  }, [students]);

  const list = useMemo(
    () => (shown === "All" ? students : students.filter((s) => s.category === shown)),
    [students, shown]
  );

  return (
    <section
      aria-labelledby="hof-title"
      className="min-h-screen bg-gradient-to-b from-[#0a192f] to-[#0f172a] px-5 py-16 text-slate-100"
    >
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <img
            src={logoSrc}
            alt="GasshCode Academy logo"
            width={72}
            height={72}
            className="mx-auto mb-5 h-[72px] w-[72px] rounded-2xl object-cover ring-1 ring-white/15"
          />
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-300">
            Hall of Fame
          </p>
          <h1
            id="hof-title"
            className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Our Selections
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Students from GasshCode Academy who made it. Light through logic.
          </p>
        </header>

        {/* Filter buttons */}
        <div
          role="group"
          aria-label="Filter selections by category"
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(cat)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] motion-reduce:transition-none ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/30"
                    : "border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                    isActive ? "bg-white/25" : "bg-white/10"
                  }`}
                >
                  {counts[cat] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Student grid */}
        <ul
          aria-live="polite"
          className={`mt-10 grid gap-4 transition duration-200 ease-out motion-reduce:transition-none sm:grid-cols-2 ${
            visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0"
          }`}
        >
          {list.map((student, i) => (
            <StudentCard key={student.id} student={student} index={i} />
          ))}
        </ul>

        {list.length === 0 && visible && (
          <p className="mt-10 text-center text-slate-400">No selections in this category yet.</p>
        )}
      </div>
    </section>
  );
}
