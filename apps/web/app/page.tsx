import type { Metadata } from "next";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Lumen · A little space to find your words",
  description:
    "A thoughtful space to write, reflect and revisit your words. Optional saving, a personal history and privacy choices in your hands.",
};

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

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={styles.header} data-motion-header>
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
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow} data-motion-hero-item>
              A little space. Just for you.
            </p>
            <h1 id="hero-heading">
              <span data-motion-hero-item>Find</span>{" "}
              <span data-motion-hero-item>your words.</span>
            </h1>
            <p className={styles.heroDescription} data-motion-hero-item>
              Unpack your day, notice how you feel, and keep the moments that
              matter. A quiet journal, with you in control.
            </p>
            <div className={styles.heroActions} data-motion-hero-item>
              <a className={styles.primary} href="/workspace">
                Open the workspace
              </a>
              <a className={styles.understated} href="#how-it-works">
                Take a closer look
              </a>
            </div>
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
                <span className={styles.paperMark} aria-hidden="true">
                  ✧
                </span>
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

        <section
          id="how-it-works"
          className={styles.reflection}
          aria-labelledby="reflection-heading"
        >
          <div className={styles.sectionIntro} data-reveal>
            <h2 id="reflection-heading">Begin with one moment.</h2>
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
            <h2 id="privacy-heading">Privacy is part of the experience.</h2>
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

        <section className={styles.progress} aria-labelledby="progress-heading">
          <div className={styles.sectionIntro} data-reveal>
            <h2 id="progress-heading">Built around your everyday.</h2>
            <p>
              A calm place to write, with thoughtful details that keep your
              words and choices close.
            </p>
          </div>
          <div className={styles.progressColumns} data-reveal="stagger">
            <div className={styles.available}>
              <span className={styles.featureSymbol} aria-hidden="true">
                ✎
              </span>
              <h3>Room for your words</h3>
              <ul>
                <li>A personal workspace to return to</li>
                <li>Prompts when you need a starting point</li>
                <li>English, Hindi and Marathi input choices</li>
                <li>A clear receipt for every submission</li>
              </ul>
            </div>
            <div className={styles.planned}>
              <span className={styles.featureSymbol} aria-hidden="true">
                ◇
              </span>
              <h3>Choices that stay yours</h3>
              <ul>
                <li>Optional saving, starting off</li>
                <li>History for the entries you choose to keep</li>
                <li>Download your current data</li>
                <li>Delete entries or your account at any time</li>
              </ul>
            </div>
            <div className={styles.available}>
              <span className={styles.featureSymbol} aria-hidden="true">
                ◒
              </span>
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
              <span className={styles.featureSymbol} aria-hidden="true">
                ✧
              </span>
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

        <section className={styles.faq} aria-labelledby="faq-heading">
          <h2 id="faq-heading" data-reveal>
            Make yourself at home.
          </h2>
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
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="closing-heading">
          <Orbit className={styles.closingOrbit} motion="closing" />
          <div data-reveal="stagger">
            <h2 id="closing-heading">Start with a little space.</h2>
            <p>A thought. A moment. A page that belongs to you.</p>
            <a className={styles.primary} href="/workspace">
              Open the workspace
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer} data-reveal="stagger">
        <a className={styles.footerBrand} href="/" aria-label="Lumen home">
          Lumen
        </a>
        <p>A little space to reflect.</p>
        <a href="/support">Find support</a>
        <a href="#faq-heading">Frequently asked questions</a>
      </footer>
    </div>
  );
}
