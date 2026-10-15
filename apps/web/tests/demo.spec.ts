import { expect, test } from "@playwright/test";

const owner = "7617ca49-460d-4c3c-b4da-9552c4dc31a5";

for (const outage of ["registration", "login"]) {
  test(`demo requires confirmation and recovers from a ${outage} outage`, async ({
    page,
  }) => {
    let registered = false,
      authenticated = false,
      registerCalls = 0,
      loginCalls = 0;
    let credentials: { email: string; password: string };
    await page.route("**/api/**", async (route) => {
      const endpoint = new URL(route.request().url()).pathname;
      if (endpoint === "/api/auth/register") {
        registerCalls++;
        expect(route.request().postDataJSON()).toEqual({
          ...credentials,
          adult_confirmed: true,
          notice_accepted: true,
        });
        if (registered)
          return route.fulfill({
            status: 400,
            json: { detail: "REGISTER_USER_ALREADY_EXISTS" },
          });
        registered = true;
        return route.fulfill(
          outage === "registration"
            ? { status: 503, json: { detail: "SERVICE_UNAVAILABLE" } }
            : { status: 201, json: { id: owner } },
        );
      }
      if (endpoint === "/api/auth/login") {
        loginCalls++;
        const fields = new URLSearchParams(route.request().postData()!);
        expect(fields.get("username")).toBe(credentials.email);
        expect(fields.get("password")).toBe(credentials.password);
        if (outage === "login" && loginCalls === 1)
          return route.fulfill({
            status: 503,
            json: { detail: "SERVICE_UNAVAILABLE" },
          });
        authenticated = true;
        return route.fulfill({ status: 204 });
      }
      if (endpoint === "/api/me")
        return route.fulfill({
          status: authenticated ? 200 : 401,
          json: authenticated
            ? {
                id: owner,
                email: credentials.email,
                consent_revision: 1,
                storage_enabled: false,
              }
            : { detail: "Unauthorized" },
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
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/workspace?mode=signin");
    credentials = {
      email: (await page.getByTestId("demo-email").textContent())!,
      password: (await page.getByTestId("demo-password").textContent())!,
    };
    expect(credentials.email).toMatch(/^demo-[\da-f-]+@example\.com$/);
    expect(credentials.password.length).toBeGreaterThanOrEqual(12);
    await page
      .getByRole("button", { name: "Explore demo", exact: true })
      .click();
    expect(registerCalls).toBe(0);
    expect(loginCalls).toBe(0);
    await page.getByRole("checkbox", { name: /I am 18 or older/ }).check();
    await page
      .getByRole("button", { name: "Explore demo", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "service is unavailable" }),
    ).toBeVisible();
    await expect(page.getByTestId("demo-email")).toHaveText(credentials.email);
    await page.getByRole("button", { name: "Dismiss notification" }).click();
    await page
      .getByRole("button", { name: "Explore demo", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "A moment for you." }),
    ).toBeVisible();
    await expect(page.getByLabel("Your entry")).toHaveValue(/Sample:/);
    await expect(page.getByText("Saving off", { exact: true })).toBeVisible();
    expect(registerCalls).toBe(outage === "registration" ? 2 : 1);
    expect(loginCalls).toBe(outage === "login" ? 2 : 1);
    expect(
      await page.evaluate(() => localStorage.length + sessionStorage.length),
    ).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("demo credentials are fresh on reload and never create accounts just by visiting", async ({
  page,
}) => {
  const writes: string[] = [];
  await page.route("**/api/**", (route) => {
    if (route.request().method() !== "GET") writes.push(route.request().url());
    return route.fulfill({ status: 401, json: { detail: "Unauthorized" } });
  });
  await page.goto("/workspace?mode=signin");
  const email = await page.getByTestId("demo-email").textContent();
  const password = await page.getByTestId("demo-password").textContent();
  await page.reload();
  await expect(page.getByTestId("demo-email")).not.toHaveText(email!);
  await expect(page.getByTestId("demo-password")).not.toHaveText(password!);
  expect(writes).toEqual([]);
});

test("scroll reveals run once and stop when reduced motion is requested", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  const features = page.locator('[data-reveal="stagger"]').filter({
    has: page.getByRole("heading", {
      name: "Choices that stay yours",
      exact: true,
    }),
  });
  const card = features.locator(":scope > div").filter({
    has: page.getByRole("heading", {
      name: "Choices that stay yours",
      exact: true,
    }),
  });
  await features.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  await expect
    .poll(() =>
      card.evaluate((element) => {
        const style = getComputedStyle(element);
        return style.transform !== "none" && Number(style.opacity) < 1;
      }),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      card.evaluate((element) => ({
        transform: (element as HTMLElement).style.transform,
        opacity: (element as HTMLElement).style.opacity,
        willChange: (element as HTMLElement).style.willChange,
      })),
    )
    .toEqual({ transform: "", opacity: "", willChange: "" });
  await expect(features).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("header").scrollIntoViewIfNeeded();
  const [returnFrames] = await Promise.all([
    card.evaluate(async (element) => {
      const frames: { transform: string; opacity: string }[] = [];
      for (let frame = 0; frame < 24; frame++) {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        const style = getComputedStyle(element);
        frames.push({ transform: style.transform, opacity: style.opacity });
      }
      return frames;
    }),
    features.scrollIntoViewIfNeeded(),
  ]);
  expect(
    returnFrames.every(
      (frame) => frame.transform === "none" && frame.opacity === "1",
    ),
  ).toBe(true);
});
