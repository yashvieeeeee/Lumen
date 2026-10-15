import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

// Serial synthetic journeys share the private API's loopback mutation budget.
let lastJourneyStart = 0;
test.beforeEach(async () => {
  const delay = Math.max(0, lastJourneyStart + 15000 - Date.now());
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  lastJourneyStart = Date.now();
});

test("journal editing and optional mood survive reload and disappear on withdrawal", async ({
  page,
}) => {
  await signup(page);
  const account = await (await page.request.get("/api/me")).json();
  try {
    await page.getByRole("button", { name: "Privacy", exact: true }).click();
    await page.getByRole("switch", { name: "Save entry text" }).click();
    await expect(page.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await page.getByRole("button", { name: "Write", exact: true }).click();
    await page
      .getByLabel("Your entry")
      .fill("Fictional journal before editing.");
    await expect(page.getByLabel("Your mood (optional)")).toBeVisible();
    await page.getByLabel("Your mood (optional)").selectOption("4");
    await page.getByRole("button", { name: "Submit entry" }).click();
    await expect(page.getByRole("status")).toContainText("entry is saved");
    await page.getByRole("button", { name: "History", exact: true }).click();
    await page
      .getByRole("button", { name: "Edit journal", exact: true })
      .click();
    await page
      .getByLabel("Edit journal text")
      .fill("Fictional revised journal.");
    await page.getByLabel("Edit mood (optional)").selectOption("5");
    // Server commits, but the client loses the response; retry must not overwrite/rescreen.
    let edits = 0;
    await page.route("**/api/events/*", async (route) => {
      if (route.request().method() === "PATCH" && edits++ === 0) {
        await route.fetch();
        return route.fulfill({
          status: 503,
          json: { detail: "SERVICE_UNAVAILABLE" },
        });
      }
      return route.continue();
    });
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "service is unavailable" }),
    ).toBeVisible();
    await expect(page.getByLabel("Edit journal text")).toHaveValue(
      "Fictional revised journal.",
    );
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(
      page.getByText("Fictional revised journal.", { exact: true }),
    ).toBeVisible();
    const entries = (
      await (
        await page.request.get("/api/events", {
          headers: { "X-Lumen-Account": account.id },
        })
      ).json()
    ).events;
    expect(entries[0]).toMatchObject({ revision: 2, mood: 5 });
    await page.reload();
    await page.getByRole("button", { name: "Mood", exact: true }).click();
    const calendar = page.getByRole("list", { name: "Mood history" });
    await expect(calendar.getByRole("listitem")).toHaveCount(14);
    await expect(calendar.getByText("Great", { exact: true })).toHaveCount(1);
    await expect(calendar.getByText("No entry", { exact: true })).toHaveCount(
      13,
    );
    await page.getByRole("button", { name: "Privacy", exact: true }).click();
    await page.getByRole("switch").click();
    await expect(page.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await page.getByRole("button", { name: "Mood", exact: true }).click();
    await expect(calendar.getByText("No entry", { exact: true })).toHaveCount(
      14,
    );
    await expect(calendar.getByText("Great", { exact: true })).toHaveCount(0);
    expect(
      (
        await (
          await page.request.get("/api/export", {
            headers: { "X-Lumen-Account": account.id },
          })
        ).json()
      ).events[0].mood,
    ).toBeNull();
  } finally {
    await page.request.delete("/api/account", {
      headers: {
        origin: "http://localhost:3180",
        "X-Lumen-Account": account.id,
      },
    });
  }
});

async function signup(page: Page) {
  await page.goto("/workspace");
  await page
    .getByLabel("Email address")
    .fill(`browser-${crypto.randomUUID()}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("browser-synthetic-password");
  await page.getByLabel("I confirm I am 18 or older.").check();
  await page
    .getByLabel("I understand how Lumen processes entries", {
      exact: false,
    })
    .check();
  await page.getByRole("button", { name: "Create my workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "A moment for you." }),
  ).toBeVisible();
}

test("real account, save states, withdrawal, export and deletion", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await signup(page);
  const cookies = await page.context().cookies();
  expect(
    cookies.find((cookie) => cookie.name === "lumen_session"),
  ).toMatchObject({ httpOnly: true, sameSite: "Strict" });
  await page.getByRole("button", { name: "A busy day" }).click();
  await page.getByRole("button", { name: "Submit entry" }).click();
  await expect(page.getByRole("status")).toContainText("text was not saved");
  await expect(page.getByRole("region", { name: "Entry check" })).toContainText(
    "No matching pattern was found",
  );
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByText("Text was not saved.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Entry check" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  await page.getByRole("switch", { name: "Save entry text" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("button", { name: "Write", exact: true }).click();
  await page.getByRole("button", { name: "A small win" }).click();
  await page.getByRole("button", { name: "Submit entry" }).click();
  await expect(page.getByRole("status")).toContainText("entry is saved");
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByText("Sample: I finished one task today and took a walk.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Entry check" })).toBeVisible();
  const output = path.resolve("../../artifacts/runs/phase2-browser");
  await fs.mkdir(output, { recursive: true });
  await page.screenshot({
    path: path.join(output, "history-desktop.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my data" }).click();
  const download = await downloadPromise;
  await download.saveAs(path.join(output, "synthetic-export.json"));
  const exported = JSON.parse(
    await fs.readFile(path.join(output, "synthetic-export.json"), "utf8"),
  );
  expect(exported.events).toHaveLength(2);
  expect(
    exported.events.some((event: { text: string | null }) =>
      event.text?.includes("Sample:"),
    ),
  ).toBe(true);
  await page.getByRole("switch", { name: "Save entry text" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByText("Entry text removed.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Entry check" })).toHaveCount(
    0,
  );
  await expect(
    page.getByText("Sample: I finished one task today", { exact: false }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete account", exact: true })
    .click();
  await page
    .getByLabel("Type DELETE to confirm permanent account deletion.")
    .fill("DELETE");
  await page.getByRole("button", { name: "Confirm deletion" }).click();
  await expect(
    page.getByRole("heading", { name: "Make room for yourself." }),
  ).toBeVisible();
  expect(failures).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test("mobile layout and browser isolation", async ({ page, browser }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/workspace");
  const output = path.resolve("../../artifacts/runs/phase2-browser");
  await fs.mkdir(output, { recursive: true });
  await page.screenshot({
    path: path.join(output, "welcome-mobile.png"),
    fullPage: true,
  });
  await signup(page);
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  await page.getByRole("switch", { name: "Save entry text" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("button", { name: "Write", exact: true }).click();
  await page
    .getByLabel("Your entry")
    .fill("Synthetic private marker for browser owner A.");
  await page.getByRole("button", { name: "Submit entry" }).click();
  await expect(page.getByRole("status")).toContainText("entry is saved");
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByText("Synthetic private marker for browser owner A.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: path.join(output, "history-mobile.png"),
    fullPage: true,
  });
  const context = await browser.newContext();
  const second = await context.newPage();
  await signup(second);
  await second.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    second.getByRole("heading", { name: "A fresh start." }),
  ).toBeVisible();
  await expect(
    second.getByText("Synthetic private marker for browser owner A.", {
      exact: true,
    }),
  ).toHaveCount(0);
  for (const current of [page, second]) {
    await current.getByRole("button", { name: "Privacy", exact: true }).click();
    await current
      .getByRole("button", { name: "Delete account", exact: true })
      .click();
    await current
      .getByLabel("Type DELETE to confirm permanent account deletion.")
      .fill("DELETE");
    await current.getByRole("button", { name: "Confirm deletion" }).click();
    await expect(
      current.getByRole("heading", { name: "Make room for yourself." }),
    ).toBeVisible();
  }
  await context.close();
});

test("web boundary rejects foreign origin, unknown proxy routes and oversized bodies", async ({
  request,
}) => {
  expect(
    (
      await request.post("/api/auth/login", {
        headers: { origin: "https://foreign.example" },
      })
    ).status(),
  ).toBe(403);
  expect((await request.get("/api/review/events")).status()).toBe(404);
  expect((await request.get("/api/events?user_id=another")).status()).toBe(422);
  expect(
    (
      await request.post("/api/events", {
        headers: { origin: "http://localhost:3180" },
        data: "x".repeat(65537),
      })
    ).status(),
  ).toBe(413);
});

for (const action of [
  "withdrawal",
  "entry deletion",
  "journal edit",
] as const) {
  test(`${action} clears visible text even if the follow-up read fails`, async ({
    page,
  }) => {
    await signup(page);
    const account = await (await page.request.get("/api/me")).json();
    try {
      await page.getByRole("button", { name: "Privacy", exact: true }).click();
      await page.getByRole("switch").click();
      await expect(page.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "true",
      );
      await page.getByRole("button", { name: "Write", exact: true }).click();
      await page
        .getByLabel("Your entry")
        .fill("Synthetic marker that must disappear after deletion.");
      await page.getByLabel("Your mood (optional)").selectOption("3");
      await page.getByRole("button", { name: "Submit entry" }).click();
      await expect(page.getByRole("status")).toContainText("entry is saved");
      await page.route("**/api/events", (route) =>
        route.request().method() === "GET"
          ? route.fulfill({
              status: 503,
              json: { detail: "SERVICE_UNAVAILABLE" },
            })
          : route.continue(),
      );
      if (action === "withdrawal") {
        await page
          .getByRole("button", { name: "Privacy", exact: true })
          .click();
        await page.getByRole("switch").click();
        await expect(page.getByRole("switch")).toHaveAttribute(
          "aria-checked",
          "false",
        );
        await page
          .getByRole("button", { name: "History", exact: true })
          .click();
      } else {
        await page
          .getByRole("button", { name: "History", exact: true })
          .click();
        if (action === "journal edit") {
          await page
            .getByRole("button", { name: "Edit journal", exact: true })
            .click();
          await page
            .getByLabel("Edit journal text")
            .fill("Fictional edited marker.");
          await page
            .getByRole("button", { name: "Save changes", exact: true })
            .click();
        } else {
          await page
            .getByRole("button", { name: "Delete entry", exact: true })
            .click();
        }
      }
      await expect(
        page.getByRole("alert").filter({
          hasText: "Your change was confirmed. Reload to refresh the view.",
        }),
      ).toBeVisible();
      await expect(
        page.getByText("Synthetic marker that must disappear after deletion.", {
          exact: true,
        }),
      ).toHaveCount(0);
      if (action === "journal edit") {
        await expect(page.getByLabel("Edit journal text")).toHaveCount(0);
        await expect(
          page.getByText("Fictional edited marker.", { exact: true }),
        ).toHaveCount(0);
      } else {
        await expect(
          page.getByText("Entry text removed.", { exact: true }),
        ).toBeVisible();
      }
      await page.getByRole("button", { name: "Mood", exact: true }).click();
      await expect(
        page
          .getByRole("list", { name: "Mood history" })
          .getByText("No entry", { exact: true }),
      ).toHaveCount(14);
    } finally {
      await page.request.delete("/api/account", {
        headers: {
          origin: "http://localhost:3180",
          "X-Lumen-Account": account.id,
        },
      });
    }
  });
}

test("a session change in another tab invalidates old account content", async ({
  page,
  context,
}) => {
  await signup(page);
  const account = await (await page.request.get("/api/me")).json();
  await page
    .getByLabel("Your entry")
    .fill("Unsaved synthetic draft belonging to the earlier account.");
  const other = await context.newPage();
  await other.goto("/workspace");
  await expect(
    other.getByRole("heading", { name: "A moment for you." }),
  ).toBeVisible();
  await other.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.bringToFront();
  await expect(
    page.getByRole("heading", { name: "A moment for you." }),
  ).toHaveCount(0);
  await expect(page.getByText(account.email, { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Your entry")).toHaveCount(0);
  await expect(
    page.getByRole("alert").filter({ hasText: "Your session" }),
  ).toBeVisible();
  // Cleanup uses a fresh library-issued session, not a mock cookie.
  await page.request.post("/api/auth/login", {
    headers: { origin: "http://localhost:3180" },
    form: { username: account.email, password: "browser-synthetic-password" },
  });
  await page.request.delete("/api/account", {
    headers: { origin: "http://localhost:3180", "X-Lumen-Account": account.id },
  });
});

test("a delayed history response cannot restore content after another tab signs out", async ({
  page,
  context,
}) => {
  await signup(page);
  const account = await (await page.request.get("/api/me")).json();
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  await page.getByRole("switch").click();
  await expect(page.getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("button", { name: "Write", exact: true }).click();
  let releaseRead!: () => void;
  let readCaptured!: () => void;
  const release = new Promise<void>((resolve) => {
    releaseRead = resolve;
  });
  const captured = new Promise<void>((resolve) => {
    readCaptured = resolve;
  });
  await page.route("**/api/events", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    const response = await route.fetch();
    readCaptured();
    await release;
    await route.fulfill({ response });
  });
  await page.getByLabel("Your entry").fill("Synthetic stale response marker.");
  await page.getByRole("button", { name: "Submit entry" }).click();
  await captured;
  const other = await context.newPage();
  await other.goto("/workspace");
  await expect(
    other.getByRole("heading", { name: "A moment for you." }),
  ).toBeVisible();
  await other.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A moment for you." }),
  ).toHaveCount(0);
  releaseRead();
  await expect(
    page.getByRole("button", { name: "Create my workspace" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("heading", { name: "A moment for you." }),
  ).toHaveCount(0);
  await expect(page.getByText(account.email, { exact: true })).toHaveCount(0);
  await page.request.post("/api/auth/login", {
    headers: { origin: "http://localhost:3180" },
    form: { username: account.email, password: "browser-synthetic-password" },
  });
  await page.request.delete("/api/account", {
    headers: { origin: "http://localhost:3180", "X-Lumen-Account": account.id },
  });
});

test("focus reconciles deletion performed outside this browser tab", async ({
  page,
}) => {
  await signup(page);
  const account = await (await page.request.get("/api/me")).json();
  const headers = {
    origin: "http://localhost:3180",
    "X-Lumen-Account": account.id,
  };
  try {
    await page.getByRole("button", { name: "Privacy", exact: true }).click();
    await page.getByRole("switch").click();
    await expect(page.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await page.getByRole("button", { name: "Write", exact: true }).click();
    await page
      .getByLabel("Your entry")
      .fill("Synthetic marker deleted from a different client.");
    await page.getByRole("button", { name: "Submit entry" }).click();
    await expect(page.getByRole("status")).toContainText("entry is saved");
    await page.getByRole("button", { name: "History", exact: true }).click();
    const rows = await (
      await page.request.get("/api/events", { headers })
    ).json();
    expect(
      (
        await page.request.delete(`/api/events/${rows.events[0].id}`, {
          headers,
        })
      ).status(),
    ).toBe(204);
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(
      page.getByText("Entry text removed.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Synthetic marker deleted from a different client.", {
        exact: true,
      }),
    ).toHaveCount(0);
    expect(
      (
        await page.request.patch("/api/consent", {
          headers,
          data: { expected_revision: 2, storage_enabled: false },
        })
      ).status(),
    ).toBe(200);
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.getByRole("button", { name: "Privacy", exact: true }).click();
    await expect(page.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await expect(page.getByRole("switch")).toBeEnabled();
  } finally {
    await page.request.delete("/api/account", { headers });
  }
});

for (const action of ["deletion", "withdrawal"] as const) {
  test(`focus during delayed ${action} cannot retain removed text`, async ({
    page,
  }) => {
    await signup(page);
    const account = await (await page.request.get("/api/me")).json();
    const headers = {
      origin: "http://localhost:3180",
      "X-Lumen-Account": account.id,
    };
    let releaseMutation!: () => void;
    let mutationCaptured!: () => void;
    const release = new Promise<void>((resolve) => {
      releaseMutation = resolve;
    });
    const captured = new Promise<void>((resolve) => {
      mutationCaptured = resolve;
    });
    try {
      await page.getByRole("button", { name: "Privacy", exact: true }).click();
      await page.getByRole("switch").click();
      await expect(page.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "true",
      );
      await page.getByRole("button", { name: "Write", exact: true }).click();
      await page
        .getByLabel("Your entry")
        .fill("Synthetic pending deletion marker.");
      await page.getByRole("button", { name: "Submit entry" }).click();
      await expect(page.getByRole("status")).toContainText("entry is saved");
      const target =
        action === "deletion" ? "**/api/events/*" : "**/api/consent";
      await page.route(target, async (route) => {
        if (
          route.request().method() !==
          (action === "deletion" ? "DELETE" : "PATCH")
        )
          return route.continue();
        mutationCaptured();
        await release;
        await route.continue();
      });
      await page
        .getByRole("button", {
          name: action === "deletion" ? "History" : "Privacy",
          exact: true,
        })
        .click();
      await page
        .getByRole(
          action === "deletion" ? "button" : "switch",
          action === "deletion" ? { name: "Delete entry", exact: true } : {},
        )
        .click();
      await captured;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(
        page.getByRole("heading", { name: "A moment for you." }),
      ).toBeVisible();
      releaseMutation();
      await expect(
        page.getByRole("heading", { name: "A moment for you." }),
      ).toHaveCount(0);
      await expect(
        page.getByText("Synthetic pending deletion marker.", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("alert").filter({ hasText: "workspace changed" }),
      ).toBeVisible();
    } finally {
      releaseMutation?.();
      await page.request.delete("/api/account", { headers });
    }
  });
}
