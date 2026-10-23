import type { Metadata } from "next";
import ThemeToggle from "./theme-toggle";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Lumen · A little space to find your words",
  description:
    "A thoughtful space to write, reflect and revisit your words. Optional saving, a personal history and privacy choices in your hands.",
};

/* PROTECTED: Lumen logo/symbol asset. Kept exactly as is: read-only. */
function Orbit({
  className,
  motion,
}: {
  className?: string;
  motion?: "hero" | "closing";
}) {
  return (
    <svg
      className={className}
      data-motion-orbit={motion}
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx="160"
        cy="160"
        rx="145"
        ry="75"
        transform="rotate(-35 160 160)"
      />
      <ellipse
        cx="160"
        cy="160"
        rx="145"
        ry="75"
        transform="rotate(35 160 160)"
      />
      <ellipse
        cx="160"
        cy="160"
        rx="145"
        ry="75"
        transform="rotate(90 160 160)"
      />
      <circle cx="258" cy="87" r="7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* Thin-line custom feature icons matching orbit stroke weight */
function WordsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.featureIcon}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ChoicesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.featureIcon}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m11 12 8-8" />
      <path d="m16 4 3 3" />
      <path d="m14 6 2 2" />
    </svg>
  );
}

function RhythmIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.featureIcon}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 12h4l3-7 6 14 3-7h4" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.featureIcon}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/* Faint decorative background linework (separate shapes, not the logo) */
function BackgroundDecoOrbit({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 300"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx="300"
        cy="150"
        rx="280"
        ry="110"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="6 8"
      />
      <circle cx="480" cy="110" r="3" fill="currentColor" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <a className="skip" href="#main">
        Skip to content
      </a>

      {/* Sticky Header with Logo & Wordmark, Links, Outlined 'Find support', Theme Toggle, and Quick Exit */}
      <header className={styles.header} data-motion-header>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="/" aria-label="Lumen home">
            <Orbit className={styles.brandOrbit} />
            Lumen
          </a>

          <nav className={styles.navigation} aria-label="Main">
            <a className={styles.sectionLink} href="#how-it-works">
              How it works
            </a>
            <a className={styles.sectionLink} href="#privacy">
              Your privacy
            </a>
            <a className={styles.signIn} href="/workspace?mode=signin">
              Sign in
            </a>
            <a className={styles.outlinedSupport} href="/support">
              Find support
            </a>
            <ThemeToggle />
            <a
              className={styles.quickExit}
              href="https://www.google.com"
              rel="nofollow noopener noreferrer"
              aria-label="Quick exit to search"
              title="Quickly leave this page"
            >
              Quick exit
            </a>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {/* Hero Section */}
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow} data-motion-hero-item>
              A little space. Just for you.
            </p>
            <h1 id="hero-heading">
              <span data-motion-hero-item>Find</span>{" "}
              <span data-motion-hero-item className={styles.irisWord}>
                your
              </span>{" "}
              <span data-motion-hero-item>words.</span>
            </h1>
            <p className={styles.heroDescription} data-motion-hero-item>
              Unpack your day, notice how you feel, and keep the moments that
              matter. A quiet journal, with you in control.
            </p>
            <div className={styles.heroActions} data-motion-hero-item>
              <a className={styles.primary} href="/workspace">
                Open the workspace
              </a>
              <a className={styles.outlinedSupportHero} href="/support">
                Find support
              </a>
            </div>
            <a
              className={styles.takeCloserLook}
              href="#how-it-works"
              data-motion-hero-item
            >
              Take a closer look
            </a>
            <p className={styles.heroNote} data-motion-hero-item>
              Begin with a moment. Keep what matters. For adults 18+.
            </p>
          </div>

          <figure
            className={styles.journalArt}
            data-motion-hero-art
            aria-label="Illustrative journal with a sample entry and saving turned off"
          >
            <Orbit className={styles.heroOrbit} motion="hero" />
            <div className={styles.paperBehind} />
            <div className={styles.journalPaper} data-motion-journal>
              <div className={styles.paperTop}>
                <span>Space to reflect</span>
                <span className={styles.paperMark} aria-hidden="true" />
              </div>
              <p className={styles.sampleTitle}>A small moment.</p>
              <p className={styles.sampleEntry}>
                Sample: Today was busy, but I took a short walk. I noticed the
                breeze and gave myself a moment to pause.
              </p>
              <div className={styles.paperLines} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p className={styles.paperChoice}>
                <span aria-hidden="true" />
                Saving is off
              </p>
            </div>
            <figcaption>Illustration with sample text</figcaption>
          </figure>
        </section>

        {/* Trust Strip under Hero */}
        <section className={styles.trustSection} aria-label="Key guarantees">
          <div className={styles.trustStrip} data-reveal>
            <div className={styles.trustItem}>
              <svg
                className={styles.trustIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Saving off by default</span>
            </div>
            <div className={styles.trustDivider} aria-hidden="true" />
            <div className={styles.trustItem}>
              <svg
                className={styles.trustIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Screened for your safety</span>
            </div>
            <div className={styles.trustDivider} aria-hidden="true" />
            <div className={styles.trustItem}>
              <svg
                className={styles.trustIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 7V4h16v3M9 20h6M12 4v16" />
              </svg>
              <span>English, Hindi & Marathi</span>
            </div>
            <div className={styles.trustDivider} aria-hidden="true" />
            <div className={styles.trustItem}>
              <svg
                className={styles.trustIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>You hold your data</span>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section
          id="how-it-works"
          className={styles.reflection}
          aria-labelledby="reflection-heading"
        >
          <BackgroundDecoOrbit className={styles.decoOrbitReflection} />
          <div className={styles.sectionIntro} data-reveal>
            <p className={styles.eyebrow}>Reflection</p>
            <h2 id="reflection-heading">
              Begin with one <span className={styles.irisWord}>moment</span>.
            </h2>
            <p>
              You do not need a perfect sentence. The workspace gives you a
              simple place to start.
            </p>
          </div>
          <ol className={styles.steps} data-reveal="stagger">
            <li>
              <span className={styles.stepNumber} aria-hidden="true">
                1
              </span>
              <div>
                <h3>Make room to write</h3>
                <p>
                  Start with a prompt, a thought, or a moment from your day.
                  Write in the language that feels natural to you.
                </p>
              </div>
            </li>
            <li>
              <span className={styles.stepNumber} aria-hidden="true">
                2
              </span>
              <div>
                <h3>Choose what stays</h3>
                <p>
                  Saving starts off. Turn it on in Privacy if you want to keep
                  your entries and revisit your words.
                </p>
              </div>
            </li>
            <li>
              <span className={styles.stepNumber} aria-hidden="true">
                3
              </span>
              <div>
                <h3>Keep your choices open</h3>
                <p>
                  Explore your history, download your data, or delete an entry
                  or account from the workspace.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Light 'Support, within reach' band styled like Privacy panel */}
        <section
          className={styles.supportBand}
          data-reveal
          aria-labelledby="support-heading"
        >
          <div className={styles.supportVisual} aria-hidden="true">
            <div className={styles.supportRings}>
              <span />
              <span />
            </div>
            <p>
              Here for you.
              <br />
              Always free.
            </p>
          </div>
          <div className={styles.supportCopy}>
            <p className={styles.eyebrow}>Assistance & Care</p>
            <h2 id="support-heading">
              Support, within <span className={styles.irisWord}>reach</span>.
            </h2>
            <p>
              If you or someone close to you is carrying a heavy burden, you do
              not have to walk through it alone. Free, confidential, 24/7 care is
              available across India with no account or sign-in needed.
            </p>

            <div className={styles.helplineList}>
              <div className={styles.helplineItem}>
                <div className={styles.helplineDetails}>
                  <strong>Tele-MANAS</strong>
                  <span>Toll-free 24/7 National Mental Health Helpline</span>
                </div>
                <a
                  className={styles.callButton}
                  href="tel:14416"
                  aria-label="Call Tele-MANAS at 14416"
                >
                  Call 14416
                </a>
              </div>

              <div className={styles.helplineItem}>
                <div className={styles.helplineDetails}>
                  <strong>Kiran</strong>
                  <span>24/7 Mental Health Rehabilitation Helpline</span>
                </div>
                <a
                  className={styles.callButton}
                  href="tel:18005990019"
                  aria-label="Call Kiran at 1800-599-0019"
                >
                  Call 1800-599-0019
                </a>
              </div>
            </div>

            <a className={styles.understated} href="/support">
              Find support
            </a>
          </div>
        </section>

        {/* Privacy Section */}
        <section
          id="privacy"
          className={styles.privacy}
          data-reveal
          aria-labelledby="privacy-heading"
        >
          <div className={styles.privacyVisual} aria-hidden="true">
            <div className={styles.privacyRings} data-motion-rings>
              <span />
              <span />
              <span />
            </div>
            <p>
              Your words.
              <br />
              Your choices.
            </p>
          </div>
          <div className={styles.privacyCopy}>
            <p className={styles.eyebrow}>Privacy & Control</p>
            <h2 id="privacy-heading">
              Privacy is part of the{" "}
              <span className={styles.irisWord}>experience</span>.
            </h2>
            <p>
              Saving is optional. With saving off, submitted text and check
              details are not retained; a minimal submission receipt remains.
            </p>
            <p>
              Turning saving off also clears previously saved text and check
              details from live records. You can export your current data and
              delete your account.
            </p>
            <a className={styles.understated} href="/workspace">
              Explore the privacy controls
            </a>
          </div>
        </section>

        {/* Progress / Everyday Section */}
        <section className={styles.progress} aria-labelledby="progress-heading">
          <BackgroundDecoOrbit className={styles.decoOrbitEveryday} />
          <div className={styles.sectionIntro} data-reveal>
            <p className={styles.eyebrow}>Capabilities</p>
            <h2 id="progress-heading">
              Built around your{" "}
              <span className={styles.irisWord}>everyday</span>.
            </h2>
            <p>
              A calm place to write, with thoughtful details that keep your
              words and choices close.
            </p>
          </div>
          <div className={styles.progressColumns} data-reveal="stagger">
            <div className={styles.available}>
              <WordsIcon />
              <h3>Room for your words</h3>
              <ul>
                <li>A personal workspace to return to</li>
                <li>Prompts when you need a starting point</li>
                <li>English, Hindi and Marathi input choices</li>
                <li>A clear receipt for every submission</li>
              </ul>
            </div>
            <div className={styles.planned}>
              <ChoicesIcon />
              <h3>Choices that stay yours</h3>
              <ul>
                <li>Optional saving, starting off</li>
                <li>History for the entries you choose to keep</li>
                <li>Download your current data</li>
                <li>Delete entries or your account at any time</li>
              </ul>
            </div>
            <div className={styles.available}>
              <RhythmIcon />
              <h3>A rhythm you can see</h3>
              <p>
                Add an optional mood rating to a saved journal. Revisit the past
                two weeks, with space for the days you skip.
              </p>
              <a className={styles.understated} href="/workspace">
                Explore your workspace
              </a>
            </div>
            <div className={styles.planned}>
              <SupportIcon />
              <h3>Support within reach</h3>
              <p>
                Find public support services and their official contact
                information. No account needed.
              </p>
              <a className={styles.understated} href="/support">
                Find support
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faq} aria-labelledby="faq-heading">
          <div data-reveal>
            <p className={styles.eyebrow}>Common Questions</p>
            <h2 id="faq-heading">
              Make yourself at <span className={styles.irisWord}>home</span>.
            </h2>
          </div>
          <div className={styles.questions} data-reveal="stagger">
            <details data-motion-disclosure>
              <summary>How do I begin?</summary>
              <p>
                Create your account, open your workspace and start with a few
                words. You can choose a prompt or begin with a moment from your
                day. Saving starts off, and you can change it in Privacy.
              </p>
            </details>
            <details data-motion-disclosure>
              <summary>Where can I find my entries?</summary>
              <p>
                Open History in your workspace to see your submission receipts.
                Entries submitted with saving on also include your writing and
                their check details, ready to revisit whenever you choose.
              </p>
            </details>
            <details data-motion-disclosure>
              <summary>What happens when saving is off?</summary>
              <p>
                Your submitted text and check details are not retained. A
                minimal receipt remains, including submission timing and save
                status. Turning saving off removes previously saved text and
                check details from your account.
              </p>
            </details>
            <details data-motion-disclosure>
              <summary>Can I write in my own language?</summary>
              <p>
                Choose English, Hindi, Marathi, Romanized Hindi or Romanized
                Marathi in the writing form. Your original words and script are
                preserved when you save an entry.
              </p>
            </details>
            <details data-motion-disclosure>
              <summary>Are my writings screened, and what happens next?</summary>
              <p>
                Every submission is screened in real time by an independent
                safety check for signs of severe distress or crisis. We believe
                in total honesty: if distress is noticed, we gently surface
                verified crisis support contacts. You always remain in complete
                control of what you do next, whether to reach out, continue
                writing, or keep your thoughts private.
              </p>
            </details>
          </div>
        </section>

        {/* Closing CTA */}
        <section className={styles.closing} aria-labelledby="closing-heading">
          <Orbit className={styles.closingOrbit} motion="closing" />
          <div data-reveal="stagger">
            <h2 id="closing-heading">
              Start with a little <span className={styles.irisWord}>space</span>.
            </h2>
            <p>A thought. A moment. A page that belongs to you.</p>
            <a className={styles.primary} href="/workspace">
              Open the workspace
            </a>
          </div>
        </section>
      </main>

      {/* Fuller Footer with Emergency Crisis Notice */}
      <footer className={styles.footer} data-reveal="stagger">
        <div className={styles.footerEmergency}>
          <p className={styles.emergencyLabel}>Immediate crisis support</p>
          <p className={styles.emergencyText}>
            If you or someone you know is in immediate danger or experiencing a
            crisis, free and confidential support is available 24/7 across India.
            Reach out directly to{" "}
            <a href="tel:14416" className={styles.emergencyLink}>
              Tele-MANAS (14416)
            </a>{" "}
            or{" "}
            <a href="tel:18005990019" className={styles.emergencyLink}>
              Kiran (1800-599-0019)
            </a>
            .
          </p>
        </div>

        <div className={styles.footerMain}>
          <div className={styles.footerBrandBlock}>
            <a className={styles.footerBrand} href="/" aria-label="Lumen home">
              Lumen
            </a>
            <p className={styles.footerTagline}>
              A thoughtful space to write, reflect and revisit your words, with
              privacy choices in your hands.
            </p>
          </div>

          <nav className={styles.footerNav} aria-label="Footer links">
            <a href="#how-it-works">How it works</a>
            <a href="#privacy">Your privacy</a>
            <a href="/support">Find support</a>
            <a href="#faq-heading">Frequently asked questions</a>
            <a href="/workspace">Open the workspace</a>
          </nav>
        </div>

        <div className={styles.footerBottom}>
          <p>© Lumen. Private, local-first reflection for adults 18+.</p>
        </div>
      </footer>
    </div>
  );
}
