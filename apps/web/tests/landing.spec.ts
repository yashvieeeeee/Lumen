import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import {
  activeResources,
  resources,
  resourceState,
} from "../app/support/resources";

const output = path.resolve("../../artifacts/runs/landing-page");

test("support is independent of accounts, region-selected and expires dated contacts", async ({
  page,
}) => {
  expect(activeResources(new Date("2026-10-08T00:00:00Z"))).toHaveLength(2);
  expect(activeResources(new Date("2026-10-07T23:59:59Z"))).toEqual([]);
  expect(activeResources(new Date("2026-11-08T00:00:00Z"))).toEqual([]);
  expect(activeResources(new Date("invalid"))).toEqual([]);
  expect(
    activeResources(new Date("2026-11-30T00:00:00Z"), [
      { ...resources[0], reviewDue: "2026-11-31T00:00:00Z" },
    ]),
  ).toEqual([]);
  expect(
    resourceState(
      {
        ...resources[0],
        verifiedAt: "2026-02-30T00:00:00Z",
        reviewDue: "2026-03-08T00:00:00Z",
      },
      new Date("2026-03-03T00:00:00Z"),
    ),
  ).toBeNull();
  expect(
    resourceState(
      { ...resources[0], enabled: false },
      new Date("2026-11-09T00:00:00Z"),
    ),
  ).toBeNull();
  expect(
    resourceState(resources[0], new Date("2026-10-07T00:00:00Z")),
  ).toBeNull();
  expect(resourceState(resources[0], new Date("2026-11-08T00:00:00Z"))).toBe(
    "expired",
  );
  expect(
    activeResources(
      new Date("2026-10-08T00:00:00Z"),
      resources.map((item) => ({ ...item, enabled: false })),
    ),
  ).toEqual([]);
  const apiRequests: string[] = [];
  await page.route("**/api/**", async (route) => {
    apiRequests.push(route.request().url());
    await route.fulfill({ status: 503, json: { detail: "MOCKED" } });
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/support");
  const skip = page.getByRole("link", { name: "Skip to content" });
  expect(
    await skip.evaluate((element) => getComputedStyle(element).position),
  ).toBe("fixed");
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Support, at your pace." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 14416" })).toBeHidden();
  const region = page.getByText("India", { exact: true });
  await region.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Call 14416" })).toHaveAttribute(
    "href",
    "tel:14416",
  );
  await expect(page.getByRole("link", { name: "Call 112" })).toHaveAttribute(
    "href",
    "tel:112",
  );
  const sources = page.getByRole("link", { name: /Official .* information/ });
  await expect(sources).toHaveCount(2);
  for (const source of await sources.all()) {
    await expect(source).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(new URL((await source.getAttribute("href"))!).search).toBe("");
  }
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await fs.mkdir(output, { recursive: true });
    await page.screenshot({
      path: path.join(output, `support-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  expect(apiRequests).toEqual([]);
});

for (const width of [320, 390, 1440]) {
  test(`landing page is readable and navigable at ${width}px`, async ({
    page,
  }, testInfo) => {
    const apiRequests: string[] = [];
    // No landing-page check may read or write an application account.
    await page.route("**/api/**", async (route) => {
      apiRequests.push(route.request().url());
      await route.fulfill({ status: 503, json: { detail: "MOCKED" } });
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "A little space to find your words.",
      }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /local research prototype|limitations|still ahead/i,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const primary = page
      .getByRole("link", { name: "Open the workspace", exact: true })
      .first();
    await expect(primary).toHaveAttribute("href", "/workspace");
    const primaryBox = await primary.boundingBox();
    expect(Math.round(primaryBox!.height)).toBeGreaterThanOrEqual(44);
    const signIn = page.getByRole("link", { name: "Sign in", exact: true });
    await expect(signIn).toHaveAttribute("href", "/workspace?mode=signin");
    expect(
      Math.round((await signIn.boundingBox())!.height),
    ).toBeGreaterThanOrEqual(44);
    const faq = page.getByText("Where can I find my entries?", {
      exact: true,
    });
    await faq.click();
    await expect(
      page.getByText(/Open History in your workspace/),
    ).toBeVisible();
    await faq.click();
    await expect(page.getByText(/Open History in your workspace/)).toBeHidden();
    await expect(
      page.getByRole("heading", {
        name: "Choices that stay yours",
        exact: true,
      }),
    ).toBeVisible();
    expect(apiRequests).toEqual([]);
    await fs.mkdir(output, { recursive: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: path.join(output, `${testInfo.project.name}-${width}-hero.png`),
      animations: "disabled",
    });
    await page.screenshot({
      path: path.join(output, `${testInfo.project.name}-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  });
}

test("landing supports keyboard, reduced motion and a direct workspace link", async ({
  page,
  browserName,
}) => {
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 401, json: { detail: "Unauthorized" } }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const skip = page.getByRole("link", { name: "Skip to content" });
  // WebKit's link traversal depends on platform keyboard preferences.
  if (browserName === "webkit") await skip.focus();
  else await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  expect(
    await page
      .locator("figure > svg")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  const question = page.getByText("How do I begin?", {
    exact: true,
  });
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText(/Create your account, open your workspace/),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/workspace\?mode=signin$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }).first(),
  ).toHaveAttribute("aria-pressed", "true");
});
