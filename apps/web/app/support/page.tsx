import type { Metadata } from "next";
import { activeResources, resources, resourceState } from "./resources";

export const metadata: Metadata = {
  title: "Find support · Lumen",
  description:
    "Public support services, with contact information from official sources.",
};
// Check contact deadlines on every request, including after a long-running deployment.
export const dynamic = "force-dynamic";

export default function SupportPage() {
  const now = new Date();
  const current = activeResources(now);
  const expired = resources.filter(
    (item) => resourceState(item, now) === "expired",
  );
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Lumen home">
          <span className="brand-mark" aria-hidden="true" />
          Lumen
        </a>
        <a className="text-button" href="/workspace">
          Open workspace
        </a>
      </header>
      <main id="main" className="resource-page" tabIndex={-1}>
        <p className="eyebrow">Find support</p>
        <h1>Support, at your pace.</h1>
        <p className="resource-intro">
          Choose a region to see public services. You decide whether to call or
          visit a service's website.
        </p>
        <details className="resource-region">
          <summary>India</summary>
          <div className="resource-grid">
            {current.map((item) => (
              <article className="resource-card" key={item.id}>
                <p className="eyebrow">{item.purpose}</p>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <a className="primary resource-call" href={`tel:${item.phone}`}>
                  Call {item.phone}
                </a>
                <a
                  href={item.source}
                  referrerPolicy="no-referrer"
                  rel="noreferrer"
                >
                  Official {item.name} information
                </a>
                <p className="field-help">
                  Source checked{" "}
                  {new Date(item.verifiedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}{" "}
                  · Next review{" "}
                  {new Date(item.reviewDue).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              </article>
            ))}
            {current.length === 0 && (
              <div className="resource-card">
                <h2>Current service information</h2>
                <p>
                  {expired.length
                    ? "Contact details are being refreshed. Visit the official pages for current information."
                    : "Service information is being updated."}
                </p>
                {expired.map((item) => (
                  <a
                    key={item.id}
                    href={item.source}
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                  >
                    Official {item.name} information
                  </a>
                ))}
              </div>
            )}
          </div>
        </details>
      </main>
      <footer className="site-footer">
        <a href="/">Lumen · A little space to reflect</a>
      </footer>
    </>
  );
}
