import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const output = path.resolve("../../artifacts/runs/ui-refinement");
const owner = "7617ca49-460d-4c3c-b4da-9552c4dc31a5";

test("a privacy acknowledgement completes a held focus check without leaving loading stuck", async ({
  page,
}) => {
  await workspace(page);
  let releasePatch!: () => void,
    patchCaptured!: () => void,
    releaseFocus!: () => void,
    focusCaptured!: () => void;
  const patchGate = new Promise<void>((resolve) => {
    releasePatch = resolve;
  });
  const patchSeen = new Promise<void>((resolve) => {
    patchCaptured = resolve;
  });
  const focusGate = new Promise<void>((resolve) => {
    releaseFocus = resolve;
  });
  const focusSeen = new Promise<void>((resolve) => {
    focusCaptured = resolve;
  });
  let holdFocus = true,
    saved = false;
  await page.route("**/api/consent", async (route) => {
    patchCaptured();
    await patchGate;
    saved = true;
    await route.fulfill({
      json: { consent_revision: 2, storage_enabled: true },
    });
  });
  await page.route("**/api/me", async (route) => {
    if (holdFocus) {
      holdFocus = false;
      focusCaptured();
      await focusGate;
    }
    await route.fulfill({
      json: {
        id: owner,
        email: "synthetic-layout@example.com",
        consent_revision: saved ? 2 : 1,
        storage_enabled: saved,
      },
    });
  });
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  await page.getByRole("switch").click();
  await patchSeen;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await focusSeen;
  const refreshed = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/events",
  );
  releasePatch();
  await refreshed;
  releaseFocus();
  await expect(
    page.getByRole("heading", { name: "Your privacy choices." }),
  ).toBeVisible();
  await expect(page.getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

// Every API request is intercepted: these layout checks create no server records.
async function workspace(page: Page, authenticated = true) {
  await page.route("**/api/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname;
    if (endpoint === "/api/me") {
      await route.fulfill({
        status: authenticated ? 200 : 401,
        json: authenticated
          ? {
              id: owner,
              email: "synthetic-layout@example.com",
              consent_revision: 1,
              storage_enabled: false,
            }
          : { detail: "Unauthorized" },
      });
    } else if (endpoint === "/api/events") {
      await route.fulfill({
        json: { owner_id: owner, events: [], next_before: null },
      });
    } else if (endpoint === "/api/moods") {
      await route.fulfill({
        json: { owner_id: owner, points: [], truncated: false },
      });
    } else {
      await route.fulfill({
        status: 503,
        json: { detail: "SERVICE_UNAVAILABLE" },
      });
    }
  });
  await page.goto("/workspace");
  await expect(page.locator("body")).not.toContainText(
    /local research prototype|development workspace|sample content only/i,
  );
  await expect(
    page.getByRole("heading", {
      name: authenticated ? "A moment for you." : "Make room for yourself.",
    }),
  ).toBeVisible();
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

for (const width of [320, 390, 768, 1440]) {
  test(`responsive writing, history and privacy at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await workspace(page);
    await fs.mkdir(output, { recursive: true });
    await page
      .getByRole("button", { name: "A small win", exact: true })
      .click();
    await expect(page.getByLabel("Your entry")).toBeFocused();
    await expect(page.getByLabel("Your entry")).toHaveValue(/Sample:/);
    await noOverflow(page);
    const nav = page.getByRole("navigation", { name: "Workspace" });
    expect(
      await nav.evaluate((element) => getComputedStyle(element).position),
    ).toBe(width < 800 ? "fixed" : "static");
    for (const button of await nav.getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(Math.round(box!.height)).toBeGreaterThanOrEqual(44);
      expect(Math.round(box!.width)).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({
      path: path.join(output, `${testInfo.project.name}-write-${width}.png`),
      fullPage: width >= 800,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "History", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "A fresh start." }),
    ).toBeVisible();
    await noOverflow(page);
    await page.getByRole("button", { name: "Mood", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Your days, in perspective." }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Mood history" }).getByRole("listitem"),
    ).toHaveCount(14);
    await noOverflow(page);
    await page.screenshot({
      path: path.join(output, `${testInfo.project.name}-mood-${width}.png`),
      animations: "disabled",
      fullPage: width >= 800,
    });
    await page.getByRole("button", { name: "Privacy", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Your privacy choices." }),
    ).toBeVisible();
    await noOverflow(page);
    const toggle = await page.getByRole("switch").boundingBox();
    expect(Math.round(toggle!.height)).toBeGreaterThanOrEqual(44);
    await page.screenshot({
      path: path.join(output, `${testInfo.project.name}-privacy-${width}.png`),
      fullPage: width >= 800,
      animations: "disabled",
    });
    // An export failure remains dismissible and does not cover the phone navigation.
    await page.getByRole("button", { name: "Download my data" }).click();
    const alert = page
      .getByRole("alert")
      .filter({ hasText: "service is unavailable" });
    await expect(alert).toBeVisible();
    if (width < 800) {
      const notice = await alert.boundingBox();
      const navigation = await nav.boundingBox();
      expect(notice!.y + notice!.height).toBeLessThanOrEqual(navigation!.y);
    }
    await page.getByRole("button", { name: "Dismiss notification" }).click();
    await expect(alert).toHaveCount(0);
    await page
      .getByRole("button", { name: "Delete account", exact: true })
      .click();
    await expect(
      page.getByLabel("Type DELETE to confirm permanent account deletion."),
    ).toBeFocused();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Delete account", exact: true }),
    ).toBeFocused();
    await expect(
      page.getByLabel("Type DELETE to confirm permanent account deletion."),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Write", exact: true }).click();
    await expect(page.getByLabel("Your entry")).toHaveValue(/Sample:/);
    if (width < 800) {
      await expect
        .poll(
          async () => (await page.locator(".content-panel").boundingBox())!.y,
        )
        .toBeGreaterThanOrEqual(0);
      await expect
        .poll(
          async () => (await page.locator(".content-panel").boundingBox())!.y,
        )
        .toBeLessThan(40);
    }
  });
}

test("password visibility, compact welcome and keyboard access", async ({
  page,
  browserName,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await workspace(page, false);
  await page
    .getByLabel("Password", { exact: true })
    .fill("synthetic-ui-password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await noOverflow(page);
  await fs.mkdir(output, { recursive: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: path.join(output, `${testInfo.project.name}-welcome-320.png`),
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Show password" }).click();
  await page
    .getByRole("button", { name: "Sign in", exact: true })
    .first()
    .click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Make room for yourself." }),
  ).toBeVisible();
  // WebKit's link traversal depends on platform keyboard preferences.
  if (browserName === "webkit")
    await page.getByRole("link", { name: "Skip to content" }).focus();
  else await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("reduced motion and keyboard navigation keep the draft", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await workspace(page);
  await page
    .getByLabel("Your entry")
    .fill("Fictional draft for keyboard navigation.");
  const history = page.getByRole("button", { name: "History", exact: true });
  await history.focus();
  await page.keyboard.press("Enter");
  await expect(history).toBeFocused();
  await expect(history).toHaveAttribute("aria-current", "page");
  expect(
    await page
      .locator(".content-panel")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Mood", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Privacy", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Write", exact: true }).click();
  await expect(page.getByLabel("Your entry")).toHaveValue(
    "Fictional draft for keyboard navigation.",
  );
});

for (const status of ["rule_only", "unavailable"] as const) {
  test(`a ${status} check is dismissed on editing and stays absent after an outage`, async ({
    page,
  }) => {
    await workspace(page);
    let submissions = 0;
    await page.route("**/api/events", async (route) => {
      if (route.request().method() !== "POST")
        return route.fulfill({
          json: {
            owner_id: owner,
            events: submissions
              ? [
                  {
                    id: owner,
                    sequence: 1,
                    source: "journal",
                    locale: "en",
                    save_state: "not_saved",
                    text: null,
                    recorded_at: "2026-10-08T10:00:00Z",
                    screening: null,
                  },
                ]
              : [],
            next_before: null,
          },
        });
      if (submissions++ > 0)
        return route.fulfill({
          status: 503,
          json: { detail: "SERVICE_UNAVAILABLE" },
        });
      await route.fulfill({
        status: 201,
        json: {
          id: owner,
          sequence: 1,
          source: "journal",
          locale: "en",
          save_state: "not_saved",
          text: null,
          recorded_at: "2026-10-08T10:00:00Z",
          screening: {
            status,
            action: status === "unavailable" ? null : "Low",
            reason:
              status === "unavailable"
                ? "screening_unavailable"
                : "no_rule_match_not_assurance",
            policy_version: "synthetic-draft",
            policy_sha256: "0".repeat(64),
            baseline_sha256: "1".repeat(64),
            rule_ids: [],
            evidence_spans: [],
            evidence_truncated: false,
          },
        },
      });
    });
    await page.getByLabel("Your entry").fill("First fictional sample.");
    await page.getByRole("button", { name: "Submit entry" }).click();
    const card = page.getByRole("region", { name: "Entry check" });
    await expect(card).toBeVisible();
    await expect(card).toContainText(
      status === "unavailable"
        ? "No action was assigned"
        : "No matching pattern was found",
    );
    await page.getByLabel("Your entry").fill("A different fictional sample.");
    await expect(card).toHaveCount(0);
    await page.getByRole("button", { name: "Submit entry" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "service is unavailable" }),
    ).toBeVisible();
    await expect(card).toHaveCount(0);
  });
}

for (const change of ["deleted", "missing", "consent_changed"] as const) {
  test(`a fresh ${change} receipt prevents a stale submission check`, async ({
    page,
  }) => {
    await workspace(page);
    let submitted = false;
    const receipt = {
      id: owner,
      sequence: 1,
      source: "journal",
      locale: "en",
      save_state: "saved",
      text: "Fictional retained entry.",
      recorded_at: "2026-10-08T10:00:00Z",
      screening: {
        status: "rule_only",
        action: "Moderate",
        reason: "matched_distress",
        policy_version: "synthetic-draft",
        policy_sha256: "0".repeat(64),
        baseline_sha256: "1".repeat(64),
        rule_ids: [],
        evidence_spans: [],
        evidence_truncated: false,
      },
    };
    await page.route("**/api/me", (route) =>
      route.fulfill({
        json: {
          id: owner,
          email: "synthetic-layout@example.com",
          consent_revision: submitted && change === "consent_changed" ? 2 : 1,
          storage_enabled: true,
        },
      }),
    );
    await page.route("**/api/events", async (route) => {
      if (route.request().method() === "POST") {
        submitted = true;
        return route.fulfill({ status: 201, json: receipt });
      }
      await route.fulfill({
        json: {
          owner_id: owner,
          events:
            !submitted || change === "missing"
              ? []
              : [
                  change === "deleted"
                    ? {
                        ...receipt,
                        save_state: "deleted",
                        text: null,
                        screening: null,
                      }
                    : receipt,
                ],
          next_before: null,
        },
      });
    });
    await page.getByLabel("Your entry").fill(receipt.text);
    await page.getByRole("button", { name: "Submit entry" }).click();
    await expect(page.getByLabel("Your entry")).toHaveValue("");
    await expect(page.getByRole("region", { name: "Entry check" })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("status").filter({ hasText: "entry is saved" }),
    ).toHaveCount(0);
  });
}
