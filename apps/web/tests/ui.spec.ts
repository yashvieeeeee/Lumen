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

test("appearance choices persist without storing writing or mood", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await workspace(page);
  await page
    .getByLabel("Your entry")
    .fill("Private synthetic draft that must stay out of browser storage.");
  await page
    .getByRole("button", { name: "Set mood to Great", exact: true })
    .click();
  await page.getByText("Make it yours", { exact: true }).click();
  await page.getByRole("button", { name: /^Bloom Soft/ }).click();
  await page.getByRole("button", { name: "Handwritten", exact: true }).click();
  await page.getByRole("slider", { name: /Text size/ }).press("End");
  await expect(page.locator("body")).toHaveAttribute("data-theme", "bloom");
  await expect(page.locator("body")).toHaveAttribute(
    "data-font",
    "handwritten",
  );
  expect(
    await page
      .getByLabel("Your entry")
      .evaluate((element) => getComputedStyle(element).fontSize),
  ).toBe("24px");
  expect(
    await page
      .getByLabel("Your entry")
      .evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain("Segoe Print");
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("lumen-appearance")!),
    ),
  ).toEqual({ theme: "bloom", font: "handwritten", size: 24 });
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([
    "lumen-appearance",
  ]);
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "bloom");
  await page.reload();
  await expect(page.getByLabel("Your entry")).toHaveValue("");
  await expect(page.getByLabel("Your mood (optional)")).toHaveAttribute(
    "aria-valuetext",
    "No rating selected",
  );
  await expect(page.locator("body")).toHaveAttribute("data-theme", "bloom");
  await expect(page.locator("body")).toHaveAttribute(
    "data-font",
    "handwritten",
  );
  await noOverflow(page);
});

test("mood slider is optional, keyboard accessible, clearable and resets for chat", async ({
  page,
}) => {
  await workspace(page);
  const slider = page.getByRole("slider", {
    name: "Your mood (optional)",
    exact: true,
  });
  await expect(slider).toHaveAttribute("aria-valuetext", "No rating selected");
  await slider.focus();
  await page.keyboard.press("End");
  await expect(slider).toHaveAttribute("aria-valuetext", "Great");
  await expect(
    page.getByRole("button", { name: "Set mood to Great", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Clear rating", exact: true }).click();
  await expect(slider).toHaveAttribute("aria-valuetext", "No rating selected");
  await slider.press("Enter");
  await expect(slider).toHaveAttribute("aria-valuetext", "Okay");
  await page
    .getByRole("combobox", { name: "Entry type", exact: true })
    .selectOption("chat");
  await expect(slider).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Entry type", exact: true })
    .selectOption("journal");
  await expect(slider).toHaveAttribute("aria-valuetext", "No rating selected");
  await page
    .getByRole("button", { name: "Set mood to Good", exact: true })
    .click();
  await page
    .getByLabel("Your entry")
    .fill("Synthetic check-in using the visual mood control.");
  let submitted: Record<string, unknown> | undefined;
  await page.route("**/api/events", async (route) => {
    if (route.request().method() === "POST") {
      submitted = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        json: { id: owner, save_state: "not_saved", screening: null },
      });
    }
    return route.fulfill({
      json: { owner_id: owner, events: [], next_before: null },
    });
  });
  await page.getByRole("button", { name: "Submit entry", exact: true }).click();
  await expect.poll(() => submitted?.mood).toBe(4);
  await expect(slider).toHaveAttribute("aria-valuetext", "No rating selected");
});

for (const state of ["invalid", "blocked"]) {
  test(`appearance remains usable with ${state} browser storage`, async ({
    page,
  }) => {
    await page.addInitScript((mode) => {
      if (mode === "invalid")
        localStorage.setItem(
          "lumen-appearance",
          JSON.stringify({
            theme: "unknown",
            font: "url(external)",
            size: 999,
          }),
        );
      else {
        for (const method of ["getItem", "setItem"])
          Object.defineProperty(Storage.prototype, method, {
            value: () => {
              throw new DOMException("Storage blocked", "SecurityError");
            },
          });
      }
    }, state);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await workspace(page);
    await expect(page.locator("body")).toHaveAttribute("data-theme", "cloud");
    await expect(page.locator("body")).toHaveAttribute("data-font", "book");
    await page.getByText("Make it yours", { exact: true }).click();
    await page.getByRole("button", { name: /^Grove Grounded/ }).click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "grove");
    expect(errors).toEqual([]);
  });
}

for (const theme of ["Cloud", "Midnight", "Bloom", "Grove"]) {
  test(`${theme} theme fits a short phone at the largest writing size`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await workspace(page);
    await page.getByText("Make it yours", { exact: true }).click();
    await page.getByRole("button", { name: new RegExp(`^${theme} `) }).click();
    await page
      .getByRole("button", { name: "Handwritten", exact: true })
      .click();
    await page.getByRole("slider", { name: /Text size/ }).press("End");
    await noOverflow(page);
    await page.getByText("Make it yours", { exact: true }).click();
    await page
      .getByRole("button", { name: "A small win", exact: true })
      .click();
    for (const button of await page
      .getByRole("group", { name: "Choose a mood", exact: true })
      .getByRole("button")
      .all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    for (const view of ["History", "Mood", "Privacy", "Write"]) {
      await page.getByRole("button", { name: view, exact: true }).click();
      await noOverflow(page);
    }
    await expect(page.getByLabel("Your entry")).toHaveValue(/Sample:/);
    await fs.mkdir(output, { recursive: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: path.join(
        output,
        `${testInfo.project.name}-${theme.toLowerCase()}-320.png`,
      ),
      fullPage: true,
      animations: "disabled",
    });
  });
}

test("history cards and mood overview show saved ratings without inventing empty-day values", async ({
  page,
}) => {
  await workspace(page);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const earlierToday = new Date(today);
  earlierToday.setHours(0, 0, 0, 0);
  const entry = {
    id: owner,
    sequence: 1,
    source: "journal",
    locale: "en",
    save_state: "saved",
    text: "Synthetic saved journal for the history card.",
    recorded_at: today.toISOString(),
    mood: 4,
    revision: 1,
    updated_at: null,
    screening: null,
  };
  await page.route("**/api/events", (route) =>
    route.fulfill({
      json: { owner_id: owner, events: [entry], next_before: null },
    }),
  );
  await page.route("**/api/moods**", (route) =>
    route.fulfill({
      json: {
        owner_id: owner,
        points: [
          { event_id: owner, mood: 2, recorded_at: yesterday.toISOString() },
          { event_id: owner, mood: 1, recorded_at: earlierToday.toISOString() },
          { event_id: owner, mood: 4, recorded_at: today.toISOString() },
        ],
        truncated: false,
      },
    }),
  );
  await page.reload();
  await expect(page.getByLabel("Your entry")).toBeVisible();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.locator(".entry-body")).toHaveText(entry.text);
  await expect(page.locator(".entry-mood")).toContainText("Good");
  await expect(
    page.getByRole("button", { name: "Edit journal", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mood", exact: true }).click();
  await expect(page.locator(".mood-day-count")).toContainText("2 / 14");
  const calendar = page.getByRole("list", { name: "Mood history" });
  await expect(calendar.getByRole("listitem")).toHaveCount(14);
  await expect(calendar.getByText("No entry", { exact: true })).toHaveCount(12);
  await expect(calendar.getByText("Good", { exact: true })).toHaveCount(1);
  await expect(calendar.getByText("Very low", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Write a check-in", exact: true })
    .click();
  await expect(page.getByLabel("Your entry")).toBeVisible();
});

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
    ).toBe(width < 800 ? "fixed" : "relative");
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
