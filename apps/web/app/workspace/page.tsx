"use client";

import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AppearanceControls, useAppearance } from "./appearance";
import { MoodFace, MoodPicker, moodLabels } from "./mood-picker";
import "./studio.css";

type Account = {
  id: string;
  email: string;
  consent_revision: number;
  storage_enabled: boolean;
};
type Entry = {
  id: string;
  sequence: number;
  source: string;
  locale: string;
  save_state: "saved" | "not_saved" | "deleted";
  text: string | null;
  recorded_at: string;
  screening?: Screening | null;
  mood: number | null;
  revision: number;
  updated_at: string | null;
};
type Screening = {
  status: "rule_only" | "uncertain" | "unavailable";
  action: string | null;
  reason: string;
  policy_version: string | null;
  policy_sha256: string | null;
  baseline_sha256: string | null;
  rule_ids: string[];
  evidence_spans: { rule_id: string; start: number; end: number }[];
  evidence_truncated: boolean;
};
type History = {
  owner_id?: string;
  events: Entry[];
  next_before: number | null;
};
type Moods = {
  owner_id?: string;
  points: { event_id: string; mood: number; recorded_at: string }[];
  truncated: boolean;
};
type View = "write" | "history" | "mood" | "privacy";
const errors: Record<string, string> = {
  LOGIN_BAD_CREDENTIALS: "That email and password did not match.",
  REGISTER_USER_ALREADY_EXISTS:
    "An account already uses that email. Try signing in.",
  INVALID_REQUEST: "Check the fields and try again.",
  CONSENT_CHANGED:
    "Your privacy choices changed. They have been refreshed; review them before submitting again.",
  SERVICE_UNAVAILABLE:
    "The service is unavailable. This request has not been confirmed. You can retry.",
  RATE_LIMITED: "Too many requests. Wait a minute and try again.",
  IDEMPOTENCY_CONFLICT:
    "This submission changed while retrying. Edit your entry and submit again.",
  ACCOUNT_CHANGED:
    "Your session changed in another tab. Sign in or reload to open the current account.",
  ENTRY_CHANGED:
    "This journal changed elsewhere. History has been refreshed; reopen it to edit the current version.",
  ENTRY_NOT_EDITABLE:
    "Only a saved journal can be edited. Refresh history to see its current status.",
};
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(errors[code] ?? "The request could not be completed. Try again.");
  }
}
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    ...options,
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      typeof body.detail === "string" ? body.detail : "INVALID_REQUEST",
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
const json = () => ({ "Content-Type": "application/json" });
const samples = [
  {
    name: "A busy day",
    text: "Sample: I have several assignments this week. Writing a short list helped me find a place to start.",
  },
  {
    name: "A small win",
    text: "Sample: I finished one task today and took a walk. I want to remember that small moment.",
  },
];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function moodWindow() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 13 + i);
    return date;
  });
  const end = new Date(today);
  end.setDate(end.getDate() + 1);
  return { days, start: days[0].toISOString(), end: end.toISOString() };
}

function MoodView({
  moods,
  saving,
  onWrite,
}: {
  moods: Moods;
  saving: boolean;
  onWrite: () => void;
}) {
  const { days } = moodWindow();
  const ratings = new Map(
    moods.points.map((point) => [
      dateKey(new Date(point.recorded_at)),
      point.mood,
    ]),
  );
  const ratedDays = days.filter((date) => ratings.has(dateKey(date)));
  const latest = ratedDays.at(-1);
  const latestRating = latest ? ratings.get(dateKey(latest))! : null;
  return (
    <div className="mood-view">
      <p className="quiet-label">A moment of perspective</p>
      <h2>Your days, in perspective.</h2>
      <p className="muted">
        Your latest self-reported rating each day, over the past two weeks. Days
        without a rating stay empty.
      </p>
      <div className="mood-overview">
        <div className="latest-mood" data-mood={latestRating ?? ""}>
          <MoodFace rating={latestRating} />
          <div>
            <span>
              {latest ? "Your latest check-in" : "Every feeling has a place"}
            </span>
            <h3>
              {latestRating
                ? moodLabels[latestRating - 1]
                : "Start wherever you are."}
            </h3>
            <p>
              {latest
                ? latest.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                : "A few words and a feeling. That’s enough."}
            </p>
          </div>
        </div>
        <div className="mood-day-count">
          <strong>
            {ratedDays.length}
            <span> / 14</span>
          </strong>
          <span>days with a rating</span>
        </div>
      </div>
      <div className="mood-calendar-heading">
        <h3>Your last two weeks</h3>
        <span>
          {days[0].toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}{" "}
          –{" "}
          {days[13].toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <ol className="mood-calendar" aria-label="Mood history">
        {days.map((date) => {
          const rating = ratings.get(dateKey(date));
          return (
            <li key={dateKey(date)} data-mood={rating ?? ""}>
              <time dateTime={dateKey(date)}>
                {date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <MoodFace rating={rating ?? null} />
              <span>{rating ? moodLabels[rating - 1] : "No entry"}</span>
            </li>
          );
        })}
      </ol>
      <div className="mood-invitation">
        <div>
          <h3>A moment to check in?</h3>
          <p>Notice a feeling. Give it a few words.</p>
        </div>
        <button className="secondary" onClick={onWrite}>
          Write a check-in
        </button>
      </div>
      <p className="field-help">
        Add a rating when writing a journal. It describes how you felt, and is
        separate from the entry check.
      </p>
      {!saving && (
        <p className="field-help">
          Turn saving on in Privacy to keep journal ratings in this view.
        </p>
      )}
      {moods.truncated && (
        <p role="status">
          The most recent 1,000 ratings are shown for this period.
        </p>
      )}
    </div>
  );
}

function NavIcon({ view }: { view: View }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {view === "write" ? (
        <>
          <path d="m15 4 5 5M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15z" />
          <path d="M12 20h8" />
        </>
      ) : view === "history" ? (
        <>
          <path d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h3" />
        </>
      ) : view === "mood" ? (
        <>
          <path d="M4 20h16M5 16v-4M10 16V8M15 16V5M20 16v-6" />
        </>
      ) : (
        <>
          <rect x="5" y="10" width="14" height="11" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
        </>
      )}
    </svg>
  );
}

function EntryCheck({ decision }: { decision: Screening }) {
  return (
    <section
      className="screening-card"
      data-state={decision.status}
      aria-label="Entry check"
    >
      <h3>Entry check</h3>
      <p>
        {decision.status === "unavailable"
          ? "The check is unavailable. No action was assigned."
          : decision.status === "uncertain"
            ? "The check could not resolve this wording."
            : decision.reason === "no_rule_match_not_assurance"
              ? "No matching pattern was found in this entry."
              : "A pattern matched in this entry. Open the details to see how it was identified."}
      </p>
      <details>
        <summary>Check details</summary>
        <dl>
          <div>
            <dt>Policy</dt>
            <dd>{decision.policy_version ?? "Unavailable"}</dd>
          </div>
          <div>
            <dt>Check status</dt>
            <dd>{decision.status}</dd>
          </div>
          <div>
            <dt>Rule action</dt>
            <dd>{decision.action ?? "None assigned"}</dd>
          </div>
          <div>
            <dt>Reason</dt>
            <dd>{decision.reason}</dd>
          </div>
          <div>
            <dt>Rule IDs</dt>
            <dd>{decision.rule_ids.join(", ") || "None"}</dd>
          </div>
          <div>
            <dt>Policy hash</dt>
            <dd>{decision.policy_sha256 ?? "Unavailable"}</dd>
          </div>
          <div>
            <dt>Baseline hash</dt>
            <dd>{decision.baseline_sha256 ?? "Unavailable"}</dd>
          </div>
        </dl>
        {decision.evidence_spans.length > 0 && (
          <p className="field-help">
            Evidence offsets use normalized Unicode codepoints, not positions in
            the original text.{" "}
            {decision.evidence_spans
              .map((span) => `${span.rule_id}: ${span.start}–${span.end}`)
              .join("; ")}
            {decision.evidence_truncated
              ? ". Only the first 50 spans are shown."
              : ""}
          </p>
        )}
      </details>
    </section>
  );
}

export default function Home() {
  const appearance = useAppearance();
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [signup, setSignup] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [demo, setDemo] = useState<{ email: string; password: string } | null>(
    null,
  );
  const demoRegistered = useRef(false);
  const authForm = useRef<HTMLFormElement>(null);
  const workspacePanel = useRef<HTMLElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("write");
  const [history, setHistory] = useState<History>({
    events: [],
    next_before: null,
  });
  const [text, setText] = useState("");
  const [locale, setLocale] = useState("en");
  const [source, setSource] = useState("journal");
  const [mood, setMood] = useState("");
  const [moods, setMoods] = useState<Moods>({ points: [], truncated: false });
  const [editing, setEditing] = useState<Entry | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [lastScreening, setLastScreening] = useState<Screening | null>(null);
  const pending = useRef<{ body: string; key: string } | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  const privacyEpoch = useRef(0);
  const operationEpoch = useRef(0);
  const entryInput = useRef<HTMLTextAreaElement>(null);
  const deleteAccountButton = useRef<HTMLButtonElement>(null);

  function navigate(next: View) {
    setView(next);
    setDeleteConfirmation(false);
    setLastScreening(null);
    setEditing(null);
    if (window.matchMedia("(max-width: 799px)").matches) {
      requestAnimationFrame(() =>
        document.getElementById("workspace-content")?.scrollIntoView({
          block: "start",
          behavior: "instant",
        }),
      );
    }
  }

  function invalidatePrivacyReads() {
    privacyEpoch.current += 1;
    // A privacy acknowledgement supersedes a pending focus read, including its loading state.
    setLoading(false);
    setLastScreening(null);
    setEditing(null);
    setMoods({ points: [], truncated: false });
  }

  function clearPrivateState() {
    privacyEpoch.current += 1;
    operationEpoch.current += 1;
    setLoading(false);
    setBusy(false);
    setUser(null);
    setText("");
    setMood("");
    setMoods({ points: [], truncated: false });
    setEditing(null);
    setHistory({ events: [], next_before: null });
    setMessage("");
    setDeleteConfirmation(false);
    setLastScreening(null);
    setShowPassword(false);
    demoRegistered.current = false;
    pending.current = null;
  }
  async function owned<T>(path: string, options?: RequestInit) {
    if (!user) throw new ApiError(401, "ACCOUNT_CHANGED");
    const headers = new Headers(options?.headers);
    headers.set("X-Lumen-Account", user.id);
    const epoch = privacyEpoch.current;
    const result = await api<T>(path, { ...options, headers });
    if (privacyEpoch.current !== epoch) {
      if (options?.method === "DELETE" || options?.method === "PATCH") {
        clearPrivateState();
        setError(
          "Your workspace changed while this request was running. Reload to continue.",
        );
      }
      throw new ApiError(409, "ACCOUNT_CHANGED");
    }
    return result;
  }

  async function refresh() {
    const epoch = privacyEpoch.current;
    const account = await api<Account>("me");
    if (user && account.id !== user.id)
      throw new ApiError(409, "ACCOUNT_CHANGED");
    const window = moodWindow();
    const headers = { "X-Lumen-Account": account.id };
    const [entries, ratings] = await Promise.all([
      api<History>("events", { headers }),
      api<Moods>(
        `moods?start=${encodeURIComponent(window.start)}&end=${encodeURIComponent(window.end)}`,
        { headers },
      ),
    ]);
    if (entries.owner_id !== account.id || ratings.owner_id !== account.id)
      throw new ApiError(409, "ACCOUNT_CHANGED");
    if (privacyEpoch.current !== epoch)
      throw new ApiError(409, "ACCOUNT_CHANGED");
    setUser(account);
    setHistory(entries);
    setMoods(ratings);
    return { account, entries };
  }
  useEffect(() => {
    setDemo({
      email: `demo-${crypto.randomUUID()}@example.com`,
      password: `Lumen-${crypto.randomUUID()}`,
    });
    setSignup(
      new URLSearchParams(window.location.search).get("mode") !== "signin",
    );
    refresh()
      .catch((failure) => {
        if (!(failure instanceof ApiError && failure.status === 401))
          setError(failure.message);
      })
      .finally(() => setLoading(false));
  }, []);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const form = authForm.current;
      if (!form) return;
      gsap.fromTo(
        Array.from(form.children),
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.045,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    });
    return () => media.revert();
  }, [signup, loading, user?.id]);
  useLayoutEffect(() => {
    if (loading) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".workspace-heading, .privacy-rail, .introduction > *, .auth-panel",
        {
          y: 22,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    });
    return () => media.revert();
  }, [loading, user?.id]);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const panel = workspacePanel.current;
      if (!panel) return;
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
          clearProps: "transform,opacity,willChange",
        },
      });
      timeline
        .fromTo(
          panel,
          {
            y: 24,
            scale: 0.985,
            opacity: 0.15,
            willChange: "transform,opacity",
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.72,
          },
        )
        .fromTo(
          panel.querySelectorAll(":scope > div > *, :scope > form > *"),
          {
            y: 14,
            opacity: 0,
          },
          { y: 0, opacity: 1, duration: 0.62, stagger: 0.045 },
          0.08,
        );
      const days = panel.querySelectorAll(
        ".mood-calendar li, .entry-list > li",
      );
      if (days.length)
        timeline.fromTo(
          days,
          { y: 18, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.025,
          },
          0.16,
        );
      // Stop moving the page as soon as someone begins editing a field.
      const settle = (event: FocusEvent) => {
        if (
          event.target instanceof Element &&
          event.target.matches("input, textarea, select")
        )
          timeline.progress(1);
      };
      panel.addEventListener("focusin", settle);
      return () => panel.removeEventListener("focusin", settle);
    });
    return () => media.revert();
  }, [view, loading, user?.id]);
  useLayoutEffect(() => {
    if (!error && !message) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (feedback.current)
        gsap.fromTo(
          feedback.current,
          { y: 18, scale: 0.96, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.55,
            ease: "back.out(1.2)",
            clearProps: "transform,opacity",
          },
        );
    });
    return () => media.revert();
  }, [error, message]);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const panels = workspacePanel.current?.querySelectorAll(
        ".journal-edit, .delete-form, .latest-check",
      );
      if (panels?.length)
        gsap.fromTo(
          panels,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.45,
            clearProps: "opacity",
          },
        );
    });
    return () => media.revert();
  }, [editing?.id, deleteConfirmation, lastScreening]);
  useEffect(() => {
    const broadcast = new BroadcastChannel("lumen-session");
    channel.current = broadcast;
    broadcast.onmessage = () => {
      clearPrivateState();
      setError(errors.ACCOUNT_CHANGED);
    };
    async function verifySession() {
      if (!user || document.visibilityState === "hidden") return;
      let epoch = privacyEpoch.current;
      // Hide private content while identity is being rechecked after switching tabs.
      setLoading(true);
      setLastScreening(null);
      setEditing(null);
      try {
        const current = await api<Account>("me");
        if (privacyEpoch.current !== epoch) return;
        if (current.id !== user.id) {
          clearPrivateState();
          setError(errors.ACCOUNT_CHANGED);
        } else {
          privacyEpoch.current += 1;
          operationEpoch.current += 1;
          epoch = privacyEpoch.current;
          setBusy(false);
          setHistory({ events: [], next_before: null });
          setUser(current);
          await refresh();
        }
      } catch {
        if (privacyEpoch.current === epoch) {
          clearPrivateState();
          setError("Your session could not be verified. Sign in or reload.");
        }
      } finally {
        if (privacyEpoch.current === epoch) setLoading(false);
      }
    }
    window.addEventListener("focus", verifySession);
    document.addEventListener("visibilitychange", verifySession);
    return () => {
      broadcast.close();
      window.removeEventListener("focus", verifySession);
      document.removeEventListener("visibilitychange", verifySession);
    };
  }, [user?.id, user?.consent_revision]);
  async function run(action: (confirm: () => void) => Promise<void>) {
    if (busy) return;
    const epoch = ++operationEpoch.current;
    setBusy(true);
    setError("");
    setMessage("");
    let confirmed = false;
    try {
      await action(() => {
        confirmed = true;
      });
    } catch (failure) {
      if (operationEpoch.current !== epoch) return;
      if (
        failure instanceof ApiError &&
        (failure.status === 401 || failure.code === "ACCOUNT_CHANGED")
      ) {
        clearPrivateState();
        setError(
          failure.code === "ACCOUNT_CHANGED"
            ? errors.ACCOUNT_CHANGED
            : "Your session ended. Sign in again.",
        );
      } else {
        setError(
          confirmed
            ? "Your change was confirmed. Reload to refresh the view."
            : failure instanceof Error
              ? failure.message
              : "The request could not be completed.",
        );
      }
      if (
        failure instanceof ApiError &&
        ["CONSENT_CHANGED", "ENTRY_CHANGED", "ENTRY_NOT_EDITABLE"].includes(
          failure.code,
        )
      ) {
        setEditing(null);
        setLastScreening(null);
        setHistory({ events: [], next_before: null });
        setMoods({ points: [], truncated: false });
        await refresh().catch(() => clearPrivateState());
      }
    } finally {
      if (operationEpoch.current === epoch) setBusy(false);
    }
  }
  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await run(async () => {
      const email = String(fields.get("email")),
        password = String(fields.get("password"));
      if (signup)
        await api("auth/register", {
          method: "POST",
          headers: json(),
          body: JSON.stringify({
            email,
            password,
            adult_confirmed: fields.get("adult") === "on",
            notice_accepted: fields.get("notice") === "on",
          }),
        });
      await signIn(email, password);
    });
  }
  async function signIn(email: string, password: string) {
    await api("auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password }),
    });
    await refresh();
    channel.current?.postMessage("session-changed");
    setView("write");
    requestAnimationFrame(() => {
      document.getElementById("main")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  async function exploreDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!demo || new FormData(event.currentTarget).get("demo-confirm") !== "on")
      return;
    await run(async () => {
      if (!demoRegistered.current) {
        try {
          await api("auth/register", {
            method: "POST",
            headers: json(),
            body: JSON.stringify({
              ...demo,
              adult_confirmed: true,
              notice_accepted: true,
            }),
          });
        } catch (failure) {
          // Registration may have completed before a lost response; the random password still authenticates it.
          if (!(
            failure instanceof ApiError &&
            failure.code === "REGISTER_USER_ALREADY_EXISTS"
          ))
            throw failure;
        }
        demoRegistered.current = true;
      }
      await signIn(demo.email, demo.password);
      setText(samples[0].text);
      setMessage(
        "Your demo is ready. Try the sample entry, then explore History, Mood and Privacy. Saving starts off.",
      );
    });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || !text.trim()) return;
    setLastScreening(null);
    const body = JSON.stringify({
      text,
      source,
      locale,
      expected_consent_revision: user.consent_revision,
      ...(source === "journal" && mood ? { mood: Number(mood) } : {}),
    });
    if (pending.current?.body !== body)
      pending.current = { body, key: crypto.randomUUID() };
    const request = pending.current;
    await run(async (confirm) => {
      const result = await owned<Entry>("events", {
        method: "POST",
        headers: { ...json(), "Idempotency-Key": request.key },
        body: request.body,
      });
      confirm();
      const fresh = await refresh();
      pending.current = null;
      const current = fresh.entries.events.find(
        (entry) => entry.id === result.id,
      );
      const consentChanged =
        fresh.account.consent_revision !== user.consent_revision;
      setLastScreening(
        !current || consentChanged || current.save_state === "deleted"
          ? null
          : current.save_state === "saved"
            ? (current.screening ?? null)
            : result.save_state === "not_saved"
              ? (result.screening ?? null)
              : null,
      );
      setText("");
      setMood("");
      setMessage(
        !current || consentChanged
          ? "Your workspace changed. Check history for the current submission status."
          : current.save_state === "saved"
            ? "Your entry is saved."
            : current.save_state === "deleted"
              ? "This earlier submission was deleted. Its content remains removed."
              : "Submission received. Its text was not saved because saving is off.",
      );
    });
  }
  async function editJournal(event: FormEvent) {
    event.preventDefault();
    if (!user || !editing?.text?.trim()) return;
    const draft = editing;
    await run(async (confirm) => {
      await owned<Entry>(`events/${draft.id}`, {
        method: "PATCH",
        headers: json(),
        body: JSON.stringify({
          text: draft.text,
          locale: draft.locale,
          mood: draft.mood,
          expected_revision: draft.revision,
          expected_consent_revision: user.consent_revision,
        }),
      });
      confirm();
      invalidatePrivacyReads();
      // Hide the superseded private version even if the follow-up read fails.
      setHistory((current) => ({
        ...current,
        events: current.events.filter((entry) => entry.id !== draft.id),
      }));
      channel.current?.postMessage("privacy-changed");
      const fresh = await refresh();
      const current = fresh.entries.events.find(
        (entry) => entry.id === draft.id,
      );
      setMessage(
        current?.save_state === "saved"
          ? "Your journal changes are saved."
          : "History has been refreshed with the current entry status.",
      );
    });
  }

  async function changeConsent() {
    if (!user) return;
    await run(async (confirm) => {
      const change = await owned<{
        consent_revision: number;
        storage_enabled: boolean;
      }>("consent", {
        method: "PATCH",
        headers: json(),
        body: JSON.stringify({
          expected_revision: user.consent_revision,
          storage_enabled: !user.storage_enabled,
        }),
      });
      confirm();
      invalidatePrivacyReads();
      setUser({ ...user, ...change });
      if (!change.storage_enabled)
        setHistory((current) => ({
          ...current,
          events: current.events.map((entry) =>
            entry.save_state === "saved"
              ? {
                  ...entry,
                  text: null,
                  screening: null,
                  mood: null,
                  save_state: "deleted",
                }
              : entry,
          ),
        }));
      channel.current?.postMessage("privacy-changed");
      await refresh();
      setMessage(
        user.storage_enabled
          ? "Saving is off. Previously saved entry text has been removed."
          : "Saving is on for future submissions.",
      );
    });
  }
  async function signout() {
    await run(async () => {
      await api("auth/logout", { method: "POST" });
      clearPrivateState();
      channel.current?.postMessage("session-changed");
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
    });
  }
  async function download() {
    await run(async () => {
      const data = await owned("export");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "lumen-export.json";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Your export was downloaded. Keep it somewhere private.");
    });
  }
  async function removeAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (new FormData(event.currentTarget).get("confirmation") !== "DELETE") {
      setError("Type DELETE to confirm.");
      return;
    }
    await run(async () => {
      await owned("account", { method: "DELETE" });
      clearPrivateState();
      channel.current?.postMessage("session-changed");
      setMessage("Your account, sessions and stored entries were deleted.");
    });
  }

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={`site-header ${user ? "signed-in" : ""}`}>
        <a className="brand" href="/" aria-label="Lumen home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Lumen</span>
        </a>
        {user && (
          <button className="text-button" onClick={signout} disabled={busy}>
            Sign out
          </button>
        )}
      </header>
      <main id="main" tabIndex={-1} className={user ? "workspace" : "welcome"}>
        {loading ? (
          <div className="loading" role="status">
            <span className="loading-mark" aria-hidden="true" />
            <p>Opening your workspace…</p>
            <div className="loading-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : !user ? (
          <>
            <section className="introduction">
              <div className="orbit-art" aria-hidden="true">
                <span />
                <span />
                <span />
                <i />
              </div>
              <p className="quiet-label">A little space to reflect</p>
              <h1>
                Put the day
                <br />
                into words.
              </h1>
              <p className="intro-copy">
                A moment to pause. A place for your thoughts.
                <br />
                Your choice about what stays.
              </p>
              <div className="welcome-note">
                <span aria-hidden="true">✧</span>
                <p>
                  One thought at a time.
                  <br />
                  <strong>Start wherever you are.</strong>
                </p>
              </div>
            </section>
            <section className="auth-panel" aria-label="Account access">
              <div className="auth-tabs">
                <button
                  aria-pressed={signup}
                  disabled={busy}
                  onClick={() => {
                    setSignup(true);
                    setShowPassword(false);
                    setError("");
                  }}
                >
                  Create account
                </button>
                <button
                  aria-pressed={!signup}
                  disabled={busy}
                  onClick={() => {
                    setSignup(false);
                    setShowPassword(false);
                    setError("");
                  }}
                >
                  Sign in
                </button>
              </div>
              <h2>{signup ? "Make room for yourself." : "Welcome back."}</h2>
              <p className="muted">
                {signup
                  ? "Saving starts off. You can change that later."
                  : "Return to your personal workspace."}
              </p>
              <form onSubmit={authenticate} ref={authForm}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={320}
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  disabled={busy}
                />
                <label htmlFor="password">Password</label>
                <div className="password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    aria-describedby={signup ? "password-help" : undefined}
                    autoComplete={signup ? "new-password" : "current-password"}
                    minLength={signup ? 12 : undefined}
                    maxLength={128}
                    required
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="password-reveal"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-controls="password"
                    aria-pressed={showPassword}
                    disabled={busy}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {signup && (
                  <>
                    <p className="field-help" id="password-help">
                      Use at least 12 characters for your password.
                    </p>
                    <label className="check">
                      <input
                        type="checkbox"
                        name="adult"
                        required
                        disabled={busy}
                      />
                      <span>I confirm I am 18 or older.</span>
                    </label>
                    <label className="check">
                      <input
                        type="checkbox"
                        name="notice"
                        required
                        disabled={busy}
                      />
                      <span>
                        I understand how Lumen processes entries and manages
                        saving, export and deletion.
                      </span>
                    </label>
                  </>
                )}
                <button className="primary" disabled={busy}>
                  {busy
                    ? "Please wait…"
                    : signup
                      ? "Create my workspace"
                      : "Sign in"}
                </button>
              </form>
              {!signup && demo && (
                <section className="demo-access" aria-labelledby="demo-heading">
                  <div className="demo-heading">
                    <span className="demo-symbol" aria-hidden="true">
                      ✧
                    </span>
                    <div>
                      <h3 id="demo-heading">Just looking around?</h3>
                      <p>Create your own demo and explore.</p>
                    </div>
                  </div>
                  <p className="field-help" id="demo-notice">
                    These are your demo credentials. The button creates a
                    separate account and signs you in. Saving starts off. Use
                    sample text; delete the account in Privacy when you’re done.
                  </p>
                  <dl className="demo-credentials">
                    <div>
                      <dt>Email</dt>
                      <dd data-testid="demo-email">{demo.email}</dd>
                    </div>
                    <div>
                      <dt>Password</dt>
                      <dd data-testid="demo-password">{demo.password}</dd>
                    </div>
                  </dl>
                  <form onSubmit={exploreDemo} aria-describedby="demo-notice">
                    <label className="check">
                      <input
                        type="checkbox"
                        name="demo-confirm"
                        required
                        disabled={busy}
                      />
                      <span>
                        I am 18 or older and understand the processing and
                        privacy choices above.
                      </span>
                    </label>
                    <button className="secondary demo-button" disabled={busy}>
                      {busy ? "Opening your demo…" : "Explore demo"}
                    </button>
                  </form>
                </section>
              )}
              <p className="privacy-footnote">
                Entries are processed when you submit them. Saving starts off;
                you can manage it in Privacy.
              </p>
            </section>
          </>
        ) : (
          <>
            <div className="workspace-heading">
              <div>
                <p className="quiet-label">Your space, at your pace</p>
                <h1>A moment for you.</h1>
              </div>
              <p className="account-email" title={user.email}>
                {user.email}
              </p>
            </div>
            <AppearanceControls {...appearance} />
            {user.email === demo?.email && (
              <p className="demo-banner">
                <strong>Your demo workspace</strong> Try sample text. Manage
                saving or delete this account in Privacy.
              </p>
            )}
            <nav
              className="workspace-tabs"
              aria-label="Workspace"
              data-view={view}
            >
              <button
                aria-current={view === "write" ? "page" : undefined}
                aria-controls="workspace-content"
                onClick={() => navigate("write")}
              >
                <NavIcon view="write" />
                <span>Write</span>
              </button>
              <button
                aria-current={view === "history" ? "page" : undefined}
                aria-controls="workspace-content"
                onClick={() => navigate("history")}
              >
                <NavIcon view="history" />
                <span>History</span>
              </button>
              <button
                aria-current={view === "mood" ? "page" : undefined}
                aria-controls="workspace-content"
                onClick={() => navigate("mood")}
              >
                <NavIcon view="mood" />
                <span>Mood</span>
              </button>
              <button
                aria-current={view === "privacy" ? "page" : undefined}
                aria-controls="workspace-content"
                onClick={() => navigate("privacy")}
              >
                <NavIcon view="privacy" />
                <span>Privacy</span>
              </button>
            </nav>
            <div className="workspace-grid">
              <section
                key={view}
                ref={workspacePanel}
                id="workspace-content"
                className="content-panel"
                aria-label={`${view} workspace`}
                aria-busy={busy}
              >
                {view === "write" && (
                  <form className="writing-form" onSubmit={submit}>
                    <div className="entry-heading">
                      <div>
                        <p className="quiet-label">A fresh page</p>
                        <h2>What’s on your mind?</h2>
                      </div>
                      <span className="save-indicator">
                        <i className={user.storage_enabled ? "on" : ""} />
                        Saving {user.storage_enabled ? "on" : "off"}
                      </span>
                    </div>
                    <p className="muted">
                      Start with a thought, or choose a prompt to get going.
                    </p>
                    <div className="sample-buttons" aria-label="Sample entries">
                      {samples.map((sample) => (
                        <button
                          key={sample.name}
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setLastScreening(null);
                            setText(sample.text);
                            entryInput.current?.focus();
                          }}
                        >
                          {sample.name}
                        </button>
                      ))}
                    </div>
                    <div className="journal-compose">
                      <div className="writing-page">
                        <label htmlFor="entry-text" className="sr-only">
                          Your entry
                        </label>
                        <textarea
                          id="entry-text"
                          ref={entryInput}
                          dir="auto"
                          aria-describedby="entry-retention entry-count"
                          value={text}
                          onChange={(event) => {
                            setLastScreening(null);
                            setText(event.target.value);
                          }}
                          placeholder="Start wherever you are…"
                          maxLength={10000}
                          rows={9}
                          required
                          disabled={busy}
                        />
                        <div className="entry-options">
                          <label>
                            Entry type
                            <select
                              value={source}
                              onChange={(event) => {
                                setLastScreening(null);
                                setSource(event.target.value);
                                if (event.target.value !== "journal")
                                  setMood("");
                              }}
                              disabled={busy}
                            >
                              <option value="journal">Journal</option>
                              <option value="chat">Chat input</option>
                            </select>
                          </label>
                          <label>
                            Language
                            <select
                              value={locale}
                              onChange={(event) => {
                                setLastScreening(null);
                                setLocale(event.target.value);
                              }}
                              disabled={busy}
                            >
                              <option value="en">English</option>
                              <option value="hi-Deva">हिन्दी</option>
                              <option value="mr-Deva">मराठी</option>
                              <option value="hi-Latn">Hindi · Romanized</option>
                              <option value="mr-Latn">
                                Marathi · Romanized
                              </option>
                            </select>
                          </label>
                          <span className="character-count" id="entry-count">
                            {text.length.toLocaleString()} / 10,000
                          </span>
                        </div>
                      </div>
                      {source === "journal" && (
                        <div className="mood-column">
                          <MoodPicker
                            value={mood ? Number(mood) : null}
                            onChange={(value) =>
                              setMood(value === null ? "" : String(value))
                            }
                            disabled={busy}
                          />
                          <p className="field-help">
                            Mood ratings are kept only when saving is on.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="submit-row">
                      <p id="entry-retention">
                        {user.storage_enabled
                          ? "This entry’s text will be saved to your account."
                          : "Its text will not be retained. A submission receipt will remain."}
                      </p>
                      <button
                        className="primary"
                        disabled={busy || !text.trim()}
                      >
                        {busy ? "Submitting…" : "Submit entry"}
                      </button>
                    </div>
                    <p className="field-help">
                      Entry checks run when you submit. Your writing stays
                      untouched while you type.
                    </p>
                    {lastScreening && (
                      <div className="latest-check" aria-live="polite">
                        <EntryCheck decision={lastScreening} />
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setLastScreening(null)}
                        >
                          Dismiss entry check
                        </button>
                      </div>
                    )}
                  </form>
                )}
                {view === "history" && (
                  <div className="history-view">
                    <div className="entry-heading">
                      <div>
                        <p className="quiet-label">Your journal</p>
                        <h2>Earlier moments.</h2>
                      </div>
                      <span className="muted">Recent submissions</span>
                    </div>
                    <p className="muted history-intro">
                      Little moments, kept in your own words. Saved writing
                      stays editable; unsaved submissions leave a receipt.
                    </p>
                    {history.events.length === 0 ? (
                      <div className="empty-state">
                        <span className="empty-journal" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        <h3>A fresh start.</h3>
                        <p>
                          Your submitted entries will appear here.
                          <br />
                          Only entries made with saving on retain their text.
                        </p>
                        <button
                          className="secondary"
                          onClick={() => navigate("write")}
                        >
                          Write an entry
                        </button>
                      </div>
                    ) : (
                      <ol className="entry-list">
                        {history.events.map((entry) => (
                          <li key={entry.id} data-save-state={entry.save_state}>
                            <div className="history-entry-top">
                              <span
                                className="entry-date-stamp"
                                aria-hidden="true"
                              >
                                <span>
                                  {new Date(
                                    entry.recorded_at,
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                  })}
                                </span>
                                <strong>
                                  {new Date(entry.recorded_at).getDate()}
                                </strong>
                              </span>
                              <div className="entry-meta">
                                <time dateTime={entry.recorded_at}>
                                  {new Date(entry.recorded_at).toLocaleString()}
                                </time>
                                <span>
                                  {entry.source === "journal"
                                    ? "Journal"
                                    : "Chat input"}{" "}
                                  ·{" "}
                                  {(
                                    {
                                      en: "English",
                                      "hi-Deva": "हिन्दी",
                                      "mr-Deva": "मराठी",
                                      "hi-Latn": "Hindi · Romanized",
                                      "mr-Latn": "Marathi · Romanized",
                                    } as Record<string, string>
                                  )[entry.locale] ?? entry.locale}
                                </span>
                              </div>
                              {entry.mood != null && (
                                <span
                                  className="entry-mood"
                                  data-mood={entry.mood}
                                >
                                  <MoodFace rating={entry.mood} />
                                  <span>{moodLabels[entry.mood - 1]}</span>
                                </span>
                              )}
                            </div>
                            {editing?.id === entry.id ? (
                              <form
                                className="journal-edit"
                                onSubmit={editJournal}
                              >
                                <label htmlFor={`edit-text-${entry.id}`}>
                                  Edit journal text
                                </label>
                                <textarea
                                  id={`edit-text-${entry.id}`}
                                  value={editing.text ?? ""}
                                  maxLength={10000}
                                  required
                                  autoFocus
                                  disabled={busy}
                                  dir="auto"
                                  onChange={(event) =>
                                    setEditing({
                                      ...editing,
                                      text: event.target.value,
                                    })
                                  }
                                />
                                <label>
                                  Edited entry language
                                  <select
                                    value={editing.locale}
                                    disabled={busy}
                                    onChange={(event) =>
                                      setEditing({
                                        ...editing,
                                        locale: event.target.value,
                                      })
                                    }
                                  >
                                    <option value="en">English</option>
                                    <option value="hi-Deva">हिन्दी</option>
                                    <option value="mr-Deva">मराठी</option>
                                    <option value="hi-Latn">
                                      Hindi · Romanized
                                    </option>
                                    <option value="mr-Latn">
                                      Marathi · Romanized
                                    </option>
                                  </select>
                                </label>
                                <MoodPicker
                                  label="Edit mood (optional)"
                                  value={editing.mood}
                                  disabled={busy}
                                  onChange={(value) =>
                                    setEditing({ ...editing, mood: value })
                                  }
                                />
                                <div className="edit-actions">
                                  <button
                                    className="primary"
                                    disabled={busy || !editing.text?.trim()}
                                  >
                                    Save changes
                                  </button>
                                  <button
                                    className="text-button"
                                    type="button"
                                    disabled={busy}
                                    onClick={() => {
                                      setEditing(null);
                                      requestAnimationFrame(() =>
                                        document
                                          .getElementById(`edit-${entry.id}`)
                                          ?.focus(),
                                      );
                                    }}
                                  >
                                    Cancel edit
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <p className="entry-body" dir="auto">
                                  {entry.text ??
                                    (entry.save_state === "deleted"
                                      ? "Entry text removed."
                                      : "Text was not saved.")}
                                </p>
                                {entry.screening && (
                                  <EntryCheck decision={entry.screening} />
                                )}
                                {entry.updated_at && (
                                  <p className="field-help">
                                    Edited{" "}
                                    <time dateTime={entry.updated_at}>
                                      {new Date(
                                        entry.updated_at,
                                      ).toLocaleString()}
                                    </time>
                                  </p>
                                )}
                              </>
                            )}
                            <div className="entry-bottom">
                              <span className="receipt-label">
                                Receipt {entry.sequence} ·{" "}
                                {entry.save_state.replace("_", " ")}
                              </span>
                              {entry.save_state === "saved" &&
                                entry.source === "journal" &&
                                editing?.id !== entry.id && (
                                  <button
                                    id={`edit-${entry.id}`}
                                    className="text-button"
                                    disabled={busy}
                                    onClick={() => setEditing({ ...entry })}
                                  >
                                    Edit journal
                                  </button>
                                )}
                              {entry.save_state === "saved" && (
                                <button
                                  className="text-button danger-text"
                                  disabled={busy}
                                  onClick={() =>
                                    run(async (confirm) => {
                                      await owned(`events/${entry.id}`, {
                                        method: "DELETE",
                                      });
                                      confirm();
                                      invalidatePrivacyReads();
                                      setHistory((current) => ({
                                        ...current,
                                        events: current.events.map((row) =>
                                          row.id === entry.id
                                            ? {
                                                ...row,
                                                text: null,
                                                screening: null,
                                                mood: null,
                                                save_state: "deleted",
                                              }
                                            : row,
                                        ),
                                      }));
                                      channel.current?.postMessage(
                                        "privacy-changed",
                                      );
                                      await refresh();
                                      setMessage(
                                        "Entry text deleted. Its receipt prevents a retry from restoring it.",
                                      );
                                    })
                                  }
                                >
                                  Delete entry
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                    {history.next_before && (
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            const next = await owned<History>(
                              `events?before=${history.next_before}`,
                            );
                            setHistory({
                              events: [...history.events, ...next.events],
                              next_before: next.next_before,
                            });
                          })
                        }
                      >
                        Load earlier entries
                      </button>
                    )}
                  </div>
                )}
                {view === "mood" && (
                  <MoodView
                    moods={moods}
                    saving={user.storage_enabled}
                    onWrite={() => navigate("write")}
                  />
                )}
                {view === "privacy" && (
                  <div className="privacy-view">
                    <p className="quiet-label">You decide what stays</p>
                    <h2>Your privacy choices.</h2>
                    <p className="muted">
                      Choose what Lumen keeps. Change your choices at any time.
                    </p>
                    <div className="privacy-choice">
                      <div>
                        <h3>Save entry text</h3>
                        <p>
                          Keep future entries, check details and optional mood
                          ratings in your history. Turning this off also removes
                          previously saved text, check details and mood ratings.
                        </p>
                      </div>
                      <button
                        className="toggle"
                        role="switch"
                        aria-label="Save entry text"
                        aria-checked={user.storage_enabled}
                        disabled={busy}
                        onClick={changeConsent}
                      >
                        <span />
                      </button>
                    </div>
                    <div className="privacy-explanation">
                      <h3>What is retained?</h3>
                      <p>
                        With saving off, the server keeps a receipt containing
                        an ID, ordering, entry type, language, time and consent
                        revision. It does not retain your entry text, check
                        details or mood ratings. Receipts prevent duplicate
                        requests and deleted content from being restored by a
                        retry.
                      </p>
                      <p>
                        You control what stays in your history. Turn saving off
                        to clear saved entry text, check details and mood
                        ratings, or download your current records before
                        deleting them.
                      </p>
                      <p>
                        Deleting an entry removes its text, check details and
                        mood rating from your account. Copies you download
                        remain yours to manage.
                      </p>
                    </div>
                    <div className="privacy-action">
                      <div>
                        <h3>Take a copy</h3>
                        <p>
                          Download your current entries, receipts and consent
                          history as JSON.
                        </p>
                      </div>
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={download}
                      >
                        Download my data
                      </button>
                    </div>
                    <div className="privacy-action account-delete">
                      <div>
                        <h3>Delete this account</h3>
                        <p>
                          Remove the account, its sessions, entries and receipts
                          from Lumen.
                        </p>
                      </div>
                      <button
                        className="text-button danger-text"
                        disabled={busy}
                        aria-expanded={deleteConfirmation}
                        aria-controls="account-deletion"
                        ref={deleteAccountButton}
                        onClick={() => setDeleteConfirmation(true)}
                      >
                        Delete account
                      </button>
                    </div>
                    {deleteConfirmation && (
                      <form
                        id="account-deletion"
                        className="delete-form"
                        onSubmit={removeAccount}
                      >
                        <label htmlFor="delete-confirm">
                          Type DELETE to confirm permanent account deletion.
                        </label>
                        <input
                          id="delete-confirm"
                          name="confirmation"
                          autoComplete="off"
                          autoFocus
                          required
                          disabled={busy}
                        />
                        <div>
                          <button className="danger" disabled={busy}>
                            Confirm deletion
                          </button>
                          <button
                            className="text-button"
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setDeleteConfirmation(false);
                              deleteAccountButton.current?.focus();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </section>
              <aside className="privacy-rail">
                <div className="journal-flower" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <i />
                </div>
                <h2>A page of your own.</h2>
                <p>There is no right way to begin. A sentence can be enough.</p>
                <hr />
                <h3>
                  {user.storage_enabled ? "Saving is on" : "Saving is off"}
                </h3>
                <p>
                  {user.storage_enabled
                    ? "Future entries will stay in your history until you delete them or turn saving off."
                    : "Your submitted text will not be retained. You can choose to save future entries."}
                </p>
                <button
                  className="text-button"
                  onClick={() => navigate("privacy")}
                >
                  Review privacy choices
                </button>
                <div className="rail-note">
                  A little space, just for you.
                  <br />
                  <strong>Your words. Your choices.</strong>
                </div>
              </aside>
            </div>
          </>
        )}
        {(error || message) && (
          <div
            ref={feedback}
            className={`feedback ${error ? "error" : ""} ${user ? "workspace-feedback" : ""}`}
            role={error ? "alert" : "status"}
          >
            {error || message}
            <button
              aria-label="Dismiss notification"
              onClick={() => {
                setError("");
                setMessage("");
              }}
            >
              ×
            </button>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <span>Lumen · A little space to reflect</span>
        <a className="text-button" href="/support">
          Find support
        </a>
        <details className="support-note">
          <summary>About Lumen</summary>
          <p>
            Write at your own pace, revisit the entries you choose to save, and
            manage your data from Privacy.
          </p>
        </details>
      </footer>
    </>
  );
}
