# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> support is independent of accounts, region-selected and expires dated contacts
- Location: tests\landing.spec.ts:8:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 13

- Array []
+ Array [
+   Object {
+     "description": "India's national tele-mental health service. The Ministry of Health lists toll-free, 24-hour access.",
+     "enabled": true,
+     "id": "tele-manas",
+     "name": "Tele-MANAS",
+     "phone": "14416",
+     "purpose": "Mental health support",
+     "reviewDue": "2026-11-31T00:00:00Z",
+     "source": "https://dghs.mohfw.gov.in/national-mental-health-programme.php",
+     "verifiedAt": "2026-10-08T00:00:00Z",
+   },
+ ]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import fs from "node:fs/promises";
  3   | import path from "node:path";
  4   | import { activeResources, resources, resourceState } from "../app/support/resources";
  5   | 
  6   | const output = path.resolve("../../artifacts/runs/landing-page");
  7   | 
  8   | test("support is independent of accounts, region-selected and expires dated contacts", async ({
  9   |   page,
  10  | }) => {
  11  |   expect(activeResources(new Date("2026-10-08T00:00:00Z"))).toHaveLength(2);
  12  |   expect(activeResources(new Date("2026-10-07T23:59:59Z"))).toEqual([]);
  13  |   expect(activeResources(new Date("2026-11-08T00:00:00Z"))).toEqual([]);
  14  |   expect(activeResources(new Date("invalid"))).toEqual([]);
> 15  |   expect(activeResources(new Date("2026-11-30T00:00:00Z"), [{ ...resources[0], reviewDue: "2026-11-31T00:00:00Z" }])).toEqual([]);
      |                                                                                                                       ^ Error: expect(received).toEqual(expected) // deep equality
  16  |   expect(resourceState({ ...resources[0], verifiedAt: "2026-02-30T00:00:00Z", reviewDue: "2026-03-08T00:00:00Z" }, new Date("2026-03-03T00:00:00Z"))).toBeNull();
  17  |   expect(resourceState({ ...resources[0], enabled: false }, new Date("2026-11-09T00:00:00Z"))).toBeNull();
  18  |   expect(resourceState(resources[0], new Date("2026-10-07T00:00:00Z"))).toBeNull();
  19  |   expect(resourceState(resources[0], new Date("2026-11-08T00:00:00Z"))).toBe("expired");
  20  |   expect(
  21  |     activeResources(
  22  |       new Date("2026-10-08T00:00:00Z"),
  23  |       resources.map((item) => ({ ...item, enabled: false })),
  24  |     ),
  25  |   ).toEqual([]);
  26  |   const apiRequests: string[] = [];
  27  |   await page.route("**/api/**", async (route) => {
  28  |     apiRequests.push(route.request().url());
  29  |     await route.fulfill({ status: 503, json: { detail: "MOCKED" } });
  30  |   });
  31  |   await page.setViewportSize({ width: 320, height: 900 });
  32  |   await page.goto("/support");
  33  |   await expect(
  34  |     page.getByRole("heading", { name: "Support, at your pace." }),
  35  |   ).toBeVisible();
  36  |   await expect(page.getByRole("link", { name: "Call 14416" })).toBeHidden();
  37  |   const region = page.getByText("India", { exact: true });
  38  |   await region.focus();
  39  |   await page.keyboard.press("Enter");
  40  |   await expect(page.getByRole("link", { name: "Call 14416" })).toHaveAttribute(
  41  |     "href",
  42  |     "tel:14416",
  43  |   );
  44  |   await expect(page.getByRole("link", { name: "Call 112" })).toHaveAttribute(
  45  |     "href",
  46  |     "tel:112",
  47  |   );
  48  |   const sources = page.getByRole("link", { name: /Official .* information/ });
  49  |   await expect(sources).toHaveCount(2);
  50  |   for (const source of await sources.all()) {
  51  |     await expect(source).toHaveAttribute("referrerpolicy", "no-referrer");
  52  |     expect(new URL((await source.getAttribute("href"))!).search).toBe("");
  53  |   }
  54  |   for (const width of [320, 1440]) {
  55  |     await page.setViewportSize({ width, height: 900 });
  56  |     expect(
  57  |       await page.evaluate(
  58  |         () => document.documentElement.scrollWidth <= innerWidth,
  59  |       ),
  60  |     ).toBe(true);
  61  |     await fs.mkdir(output, { recursive: true });
  62  |     await page.screenshot({
  63  |       path: path.join(output, `support-${width}.png`),
  64  |       fullPage: true,
  65  |       animations: "disabled",
  66  |     });
  67  |   }
  68  |   expect(apiRequests).toEqual([]);
  69  | });
  70  | 
  71  | for (const width of [320, 390, 1440]) {
  72  |   test(`landing page is readable and navigable at ${width}px`, async ({
  73  |     page,
  74  |   }, testInfo) => {
  75  |     const apiRequests: string[] = [];
  76  |     // No landing-page check may read or write an application account.
  77  |     await page.route("**/api/**", async (route) => {
  78  |       apiRequests.push(route.request().url());
  79  |       await route.fulfill({ status: 503, json: { detail: "MOCKED" } });
  80  |     });
  81  |     await page.setViewportSize({ width, height: 900 });
  82  |     await page.goto("/");
  83  |     await expect(
  84  |       page.getByRole("heading", {
  85  |         level: 1,
  86  |         name: "A little space to find your words.",
  87  |       }),
  88  |     ).toBeVisible();
  89  |     await expect(page.locator("body")).not.toContainText(
  90  |       /local research prototype|limitations|still ahead/i,
  91  |     );
  92  |     expect(
  93  |       await page.evaluate(
  94  |         () => document.documentElement.scrollWidth <= innerWidth,
  95  |       ),
  96  |     ).toBe(true);
  97  |     const primary = page
  98  |       .getByRole("link", { name: "Open the workspace", exact: true })
  99  |       .first();
  100 |     await expect(primary).toHaveAttribute("href", "/workspace");
  101 |     const primaryBox = await primary.boundingBox();
  102 |     expect(Math.round(primaryBox!.height)).toBeGreaterThanOrEqual(44);
  103 |     const signIn = page.getByRole("link", { name: "Sign in", exact: true });
  104 |     await expect(signIn).toHaveAttribute("href", "/workspace?mode=signin");
  105 |     expect(
  106 |       Math.round((await signIn.boundingBox())!.height),
  107 |     ).toBeGreaterThanOrEqual(44);
  108 |     const faq = page.getByText("Where can I find my entries?", {
  109 |       exact: true,
  110 |     });
  111 |     await faq.click();
  112 |     await expect(
  113 |       page.getByText(/Open History in your workspace/),
  114 |     ).toBeVisible();
  115 |     await faq.click();
```