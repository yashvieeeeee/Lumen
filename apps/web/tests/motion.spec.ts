import { expect, test, type Locator, type Page } from "@playwright/test";

const owner = "7617ca49-460d-4c3c-b4da-9552c4dc31a5";

// Motion journeys are synthetic and never create or change server records.
async function workspace(page: Page) {
  await page.route("**/api/**", (route) => {
    const endpoint = new URL(route.request().url()).pathname;
    if (endpoint === "/api/me")
      return route.fulfill({
        json: {
          id: owner,
          email: "synthetic-motion@example.com",
          consent_revision: 1,
          storage_enabled: false,
        },
      });
    if (endpoint === "/api/events")
      return route.fulfill({
        json: { owner_id: owner, events: [], next_before: null },
      });
    if (endpoint === "/api/moods")
      return route.fulfill({
        json: { owner_id: owner, points: [], truncated: false },
      });
    return route.fulfill({
      status: 503,
      json: { detail: "SERVICE_UNAVAILABLE" },
    });
  });
  await page.goto("/workspace");
  await expect(page.getByLabel("Your entry")).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
}

async function settled(element: Locator) {
  await expect
    .poll(() =>
      element.evaluate((node) => ({
        transform: (node as HTMLElement).style.transform,
        opacity: (node as HTMLElement).style.opacity,
        willChange: (node as HTMLElement).style.willChange,
      })),
    )
    .toEqual({ transform: "", opacity: "", willChange: "" });
  await expect(element).toHaveCSS("opacity", "1");
  await expect(element).toHaveCSS("transform", "none");
}

async function visiblyMoving(element: Locator) {
  await expect
    .poll(
      () =>
        element.evaluate((node) => {
          const style = getComputedStyle(node);
          return style.transform !== "none" && Number(style.opacity) < 1;
        }),
      { intervals: [16, 32, 50] },
    )
    .toBe(true);
  const frames = await element.evaluate(async (node) => {
    const values: string[] = [];
    for (let frame = 0; frame < 5; frame++) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const style = getComputedStyle(node);
      values.push(`${style.transform}:${style.opacity}`);
    }
    return values;
  });
  expect(new Set(frames).size).toBeGreaterThan(1);
}

async function smoothToggle(details: Locator) {
  const summary = details.locator(":scope > summary");
  await summary.focus();
  const [heights] = await Promise.all([
    details.evaluate(async (element) => {
      const values = [element.getBoundingClientRect().height];
      for (let frame = 0; frame < 36; frame++) {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        values.push(element.getBoundingClientRect().height);
      }
      return values;
    }),
    summary.press("Enter"),
  ]);
  expect(
    new Set(heights.map((height) => Math.round(height))).size,
  ).toBeGreaterThan(3);
  await expect(summary).toBeFocused();
  await expect
    .poll(() => details.evaluate((node) => (node as HTMLElement).style.height))
    .toBe("");
}

test("workspace panels visibly animate, settle, and preserve the writing draft", async ({
  page,
}) => {
  await workspace(page);
  const draft =
    "Synthetic draft retained while the animated workspace changes views.";
  await settled(page.locator("#workspace-content"));
  await page.getByLabel("Your entry").fill(draft);
  for (const view of ["History", "Mood", "Privacy", "Write"]) {
    const button = page.getByRole("button", { name: view, exact: true });
    await button.focus();
    await button.press("Enter");
    const panel = page.locator("#workspace-content");
    await visiblyMoving(panel);
    await settled(panel);
    await expect(panel).toHaveAttribute(
      "aria-label",
      `${view.toLowerCase()} workspace`,
    );
    await expect(button).toBeFocused();
  }
  await expect(page.getByLabel("Your entry")).toHaveValue(draft);
});

test("initial reduced motion leaves workspace, mood, and appearance controls immediately usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await workspace(page);
  await settled(page.locator("#workspace-content"));
  await page
    .getByRole("button", { name: "Set mood to Great", exact: true })
    .click();
  await settled(page.locator(".mood-preview"));
  await expect(page.getByLabel("Your mood (optional)")).toHaveAttribute(
    "aria-valuetext",
    "Great",
  );
  const appearance = page.locator("details.appearance-controls");
  await appearance.locator("summary").press("Enter");
  await expect(appearance).toHaveAttribute("open", "");
  expect(
    await appearance.evaluate((node) => (node as HTMLElement).style.height),
  ).toBe("");
  await page.getByRole("button", { name: /^Bloom Soft/ }).click();
  await page.getByRole("button", { name: "Handwritten", exact: true }).click();
  await page.getByRole("slider", { name: /Text size/ }).press("End");
  await expect(page.locator("body")).toHaveAttribute("data-theme", "bloom");
  await expect(page.locator("body")).toHaveAttribute(
    "data-font",
    "handwritten",
  );
  await expect(page.getByLabel("Your entry")).toHaveCSS("font-size", "24px");
  await page.getByRole("button", { name: "Mood", exact: true }).click();
  await settled(page.locator("#workspace-content"));
  await expect(
    page.getByRole("list", { name: "Mood history" }).getByRole("listitem"),
  ).toHaveCount(14);
});

test("a live reduced-motion preference cancels panel and drawer animations cleanly", async ({
  page,
}) => {
  await workspace(page);
  await settled(page.locator("#workspace-content"));
  await page.getByRole("button", { name: "History", exact: true }).click();
  await visiblyMoving(page.locator("#workspace-content"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await settled(page.locator("#workspace-content"));
  await expect(
    page.getByRole("heading", { name: "A fresh start." }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const appearance = page.locator("details.appearance-controls");
  await appearance.locator("summary").press("Enter");
  await expect
    .poll(() =>
      appearance.evaluate((node) => (node as HTMLElement).style.height),
    )
    .not.toBe("");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      appearance.evaluate((node) => (node as HTMLElement).style.height),
    )
    .toBe("");
  await expect(
    page.getByRole("button", { name: /^Grove Grounded/ }),
  ).toBeVisible();
  await appearance.locator("summary").press("Enter");
  await expect(appearance).not.toHaveAttribute("open");
  await expect(
    page.getByRole("button", { name: /^Grove Grounded/ }),
  ).toBeHidden();
});

test("rapid keyboard tab switches and drawer reversals keep the final view and focus correct", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await workspace(page);
  await page
    .getByLabel("Your entry")
    .fill("Synthetic draft survives interrupted transitions.");
  for (const view of ["History", "Mood", "Privacy", "History", "Write"]) {
    const button = page.getByRole("button", { name: view, exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
  }
  await settled(page.locator("#workspace-content"));
  await expect(page.locator("#workspace-content")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Write", exact: true }),
  ).toBeFocused();
  await expect(page.getByLabel("Your entry")).toHaveValue(
    "Synthetic draft survives interrupted transitions.",
  );
  const appearance = page.locator("details.appearance-controls");
  const summary = appearance.locator("summary");
  await summary.focus();
  for (let toggle = 0; toggle < 3; toggle++) await page.keyboard.press("Enter");
  await expect(appearance).toHaveAttribute("open", "");
  await expect
    .poll(() =>
      appearance.evaluate((node) => (node as HTMLElement).style.height),
    )
    .toBe("");
  await expect(
    page.getByRole("button", { name: /^Midnight Bold/ }),
  ).toBeVisible();
  await expect(summary).toBeFocused();
  await summary.press("Enter");
  await expect(appearance).not.toHaveAttribute("open");
  await expect(summary).toBeFocused();
  await page
    .getByRole("button", { name: "Set mood to Low", exact: true })
    .click();
  await expect(page.getByLabel("Your mood (optional)")).toHaveAttribute(
    "aria-valuetext",
    "Low",
  );
  await settled(page.locator(".mood-preview"));
  expect(errors).toEqual([]);
});

test("phone navigation stays viewport anchored while panels animate without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await workspace(page);
  await settled(page.locator("#workspace-content"));
  const navigation = page.getByRole("navigation", { name: "Workspace" });
  const baseline = (await navigation.boundingBox())!;
  for (const view of ["History", "Mood", "Privacy", "Write"]) {
    await page.getByRole("button", { name: view, exact: true }).click();
    await visiblyMoving(page.locator("#workspace-content"));
    const box = (await navigation.boundingBox())!;
    expect(Math.abs(box.y - baseline.y)).toBeLessThan(1);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(640);
    expect(
      await navigation.evaluate((node) => getComputedStyle(node).position),
    ).toBe("fixed");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await settled(page.locator("#workspace-content"));
  }
});

test("pointer and field-focus micro-interactions restore their styles when motion is reduced", async ({
  page,
}) => {
  await workspace(page);
  test.skip(
    !(await page.evaluate(
      () => matchMedia("(hover: hover) and (pointer: fine)").matches,
    )),
    "Hover feedback applies to a fine mouse pointer.",
  );
  const button = page.getByRole("button", { name: "A small win", exact: true });
  const resting = await button.evaluate((node) => {
    const style = getComputedStyle(node);
    return [style.transform, style.scale, style.translate];
  });
  await button.hover();
  await expect
    .poll(() =>
      button.evaluate((node) => {
        const style = getComputedStyle(node);
        return [style.transform, style.scale, style.translate];
      }),
    )
    .not.toEqual(resting);
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      button.evaluate((node) => {
        const style = getComputedStyle(node);
        return [style.transform, style.scale, style.translate];
      }),
    )
    .toEqual(resting);
  await button.hover();
  const entry = page.getByLabel("Your entry");
  await entry.focus();
  await expect
    .poll(() =>
      entry.evaluate((node) =>
        Number(getComputedStyle(node).getPropertyValue("--motion-focus-glow")),
      ),
    )
    .toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      button.evaluate((node) => {
        const style = getComputedStyle(node);
        return [style.transform, style.scale, style.translate];
      }),
    )
    .toEqual(resting);
  expect(
    await entry.evaluate((node) =>
      (node as HTMLElement).style.getPropertyValue("--motion-focus-glow"),
    ),
  ).toBe("");
  await expect(entry).toBeFocused();
});

test("landing questions and support regions open and close smoothly with the keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  const question = page.locator("details").filter({
    has: page.getByText("How do I begin?", { exact: true }),
  });
  await question.scrollIntoViewIfNeeded();
  await smoothToggle(question);
  await expect(
    page.getByText(/Create your account, open your workspace/),
  ).toBeVisible();
  await smoothToggle(question);
  await expect(
    page.getByText(/Create your account, open your workspace/),
  ).toBeHidden();
  await page.goto("/support");
  await expect(page.locator("body")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  const region = page.locator("details.resource-region");
  await smoothToggle(region);
  await expect(region).toHaveAttribute("open", "");
  await expect(region.locator(".resource-grid")).toBeVisible();
  await smoothToggle(region);
  await expect(region).not.toHaveAttribute("open");
});
