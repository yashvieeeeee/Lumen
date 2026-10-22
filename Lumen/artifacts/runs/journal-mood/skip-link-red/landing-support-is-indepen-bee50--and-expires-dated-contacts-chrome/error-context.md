# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> support is independent of accounts, region-selected and expires dated contacts
- Location: tests\landing.spec.ts:12:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "fixed"
Received: "static"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - link "Lumen home" [ref=e4] [cursor=pointer]:
      - /url: /
      - text: Lumen
    - link "Open workspace" [ref=e6] [cursor=pointer]:
      - /url: /workspace
  - main [ref=e7]:
    - paragraph [ref=e8]: Find support
    - heading "Support, at your pace." [level=1] [ref=e9]
    - paragraph [ref=e10]: Choose a region to see public services. You decide whether to call or visit a service's website.
    - group [ref=e11]:
      - generic "India" [ref=e12] [cursor=pointer]
  - contentinfo [ref=e13]:
    - link "Lumen · A little space to reflect" [ref=e14] [cursor=pointer]:
      - /url: /
  - alert [ref=e15]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import fs from "node:fs/promises";
  3   | import path from "node:path";
  4   | import {
  5   |   activeResources,
  6   |   resources,
  7   |   resourceState,
  8   | } from "../app/support/resources";
  9   | 
  10  | const output = path.resolve("../../artifacts/runs/landing-page");
  11  | 
  12  | test("support is independent of accounts, region-selected and expires dated contacts", async ({
  13  |   page,
  14  | }) => {
  15  |   expect(activeResources(new Date("2026-10-08T00:00:00Z"))).toHaveLength(2);
  16  |   expect(activeResources(new Date("2026-10-07T23:59:59Z"))).toEqual([]);
  17  |   expect(activeResources(new Date("2026-11-08T00:00:00Z"))).toEqual([]);
  18  |   expect(activeResources(new Date("invalid"))).toEqual([]);
  19  |   expect(
  20  |     activeResources(new Date("2026-11-30T00:00:00Z"), [
  21  |       { ...resources[0], reviewDue: "2026-11-31T00:00:00Z" },
  22  |     ]),
  23  |   ).toEqual([]);
  24  |   expect(
  25  |     resourceState(
  26  |       {
  27  |         ...resources[0],
  28  |         verifiedAt: "2026-02-30T00:00:00Z",
  29  |         reviewDue: "2026-03-08T00:00:00Z",
  30  |       },
  31  |       new Date("2026-03-03T00:00:00Z"),
  32  |     ),
  33  |   ).toBeNull();
  34  |   expect(
  35  |     resourceState(
  36  |       { ...resources[0], enabled: false },
  37  |       new Date("2026-11-09T00:00:00Z"),
  38  |     ),
  39  |   ).toBeNull();
  40  |   expect(
  41  |     resourceState(resources[0], new Date("2026-10-07T00:00:00Z")),
  42  |   ).toBeNull();
  43  |   expect(resourceState(resources[0], new Date("2026-11-08T00:00:00Z"))).toBe(
  44  |     "expired",
  45  |   );
  46  |   expect(
  47  |     activeResources(
  48  |       new Date("2026-10-08T00:00:00Z"),
  49  |       resources.map((item) => ({ ...item, enabled: false })),
  50  |     ),
  51  |   ).toEqual([]);
  52  |   const apiRequests: string[] = [];
  53  |   await page.route("**/api/**", async (route) => {
  54  |     apiRequests.push(route.request().url());
  55  |     await route.fulfill({ status: 503, json: { detail: "MOCKED" } });
  56  |   });
  57  |   await page.setViewportSize({ width: 320, height: 900 });
  58  |   await page.goto("/support");
  59  |   const skip = page.getByRole("link", { name: "Skip to content" });
> 60  |   expect(await skip.evaluate((element) => getComputedStyle(element).position)).toBe("fixed");
      |                                                                                ^ Error: expect(received).toBe(expected) // Object.is equality
  61  |   await skip.focus();
  62  |   await page.keyboard.press("Enter");
  63  |   await expect(page.getByRole("main")).toBeFocused();
  64  |   await expect(
  65  |     page.getByRole("heading", { name: "Support, at your pace." }),
  66  |   ).toBeVisible();
  67  |   await expect(page.getByRole("link", { name: "Call 14416" })).toBeHidden();
  68  |   const region = page.getByText("India", { exact: true });
  69  |   await region.focus();
  70  |   await page.keyboard.press("Enter");
  71  |   await expect(page.getByRole("link", { name: "Call 14416" })).toHaveAttribute(
  72  |     "href",
  73  |     "tel:14416",
  74  |   );
  75  |   await expect(page.getByRole("link", { name: "Call 112" })).toHaveAttribute(
  76  |     "href",
  77  |     "tel:112",
  78  |   );
  79  |   const sources = page.getByRole("link", { name: /Official .* information/ });
  80  |   await expect(sources).toHaveCount(2);
  81  |   for (const source of await sources.all()) {
  82  |     await expect(source).toHaveAttribute("referrerpolicy", "no-referrer");
  83  |     expect(new URL((await source.getAttribute("href"))!).search).toBe("");
  84  |   }
  85  |   for (const width of [320, 1440]) {
  86  |     await page.setViewportSize({ width, height: 900 });
  87  |     expect(
  88  |       await page.evaluate(
  89  |         () => document.documentElement.scrollWidth <= innerWidth,
  90  |       ),
  91  |     ).toBe(true);
  92  |     await fs.mkdir(output, { recursive: true });
  93  |     await page.screenshot({
  94  |       path: path.join(output, `support-${width}.png`),
  95  |       fullPage: true,
  96  |       animations: "disabled",
  97  |     });
  98  |   }
  99  |   expect(apiRequests).toEqual([]);
  100 | });
  101 | 
  102 | for (const width of [320, 390, 1440]) {
  103 |   test(`landing page is readable and navigable at ${width}px`, async ({
  104 |     page,
  105 |   }, testInfo) => {
  106 |     const apiRequests: string[] = [];
  107 |     // No landing-page check may read or write an application account.
  108 |     await page.route("**/api/**", async (route) => {
  109 |       apiRequests.push(route.request().url());
  110 |       await route.fulfill({ status: 503, json: { detail: "MOCKED" } });
  111 |     });
  112 |     await page.setViewportSize({ width, height: 900 });
  113 |     await page.goto("/");
  114 |     await expect(
  115 |       page.getByRole("heading", {
  116 |         level: 1,
  117 |         name: "A little space to find your words.",
  118 |       }),
  119 |     ).toBeVisible();
  120 |     await expect(page.locator("body")).not.toContainText(
  121 |       /local research prototype|limitations|still ahead/i,
  122 |     );
  123 |     expect(
  124 |       await page.evaluate(
  125 |         () => document.documentElement.scrollWidth <= innerWidth,
  126 |       ),
  127 |     ).toBe(true);
  128 |     const primary = page
  129 |       .getByRole("link", { name: "Open the workspace", exact: true })
  130 |       .first();
  131 |     await expect(primary).toHaveAttribute("href", "/workspace");
  132 |     const primaryBox = await primary.boundingBox();
  133 |     expect(Math.round(primaryBox!.height)).toBeGreaterThanOrEqual(44);
  134 |     const signIn = page.getByRole("link", { name: "Sign in", exact: true });
  135 |     await expect(signIn).toHaveAttribute("href", "/workspace?mode=signin");
  136 |     expect(
  137 |       Math.round((await signIn.boundingBox())!.height),
  138 |     ).toBeGreaterThanOrEqual(44);
  139 |     const faq = page.getByText("Where can I find my entries?", {
  140 |       exact: true,
  141 |     });
  142 |     await faq.click();
  143 |     await expect(
  144 |       page.getByText(/Open History in your workspace/),
  145 |     ).toBeVisible();
  146 |     await faq.click();
  147 |     await expect(page.getByText(/Open History in your workspace/)).toBeHidden();
  148 |     await expect(
  149 |       page.getByRole("heading", {
  150 |         name: "Choices that stay yours",
  151 |         exact: true,
  152 |       }),
  153 |     ).toBeVisible();
  154 |     expect(apiRequests).toEqual([]);
  155 |     await fs.mkdir(output, { recursive: true });
  156 |     await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  157 |     await page.screenshot({
  158 |       path: path.join(output, `${testInfo.project.name}-${width}-hero.png`),
  159 |       animations: "disabled",
  160 |     });
```