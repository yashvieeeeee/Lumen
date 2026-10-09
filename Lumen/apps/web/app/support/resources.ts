// Official-source facts checked on 8 October 2026; refresh before the review deadline.
export const resources = [
  {
    id: "tele-manas",
    name: "Tele-MANAS",
    purpose: "Mental health support",
    description:
      "India's national tele-mental health service. The Ministry of Health lists toll-free, 24-hour access.",
    phone: "14416",
    source: "https://dghs.mohfw.gov.in/national-mental-health-programme.php",
    verifiedAt: "2026-10-08T00:00:00Z",
    reviewDue: "2026-11-08T00:00:00Z",
    enabled: true,
  },
  {
    id: "erss-112",
    name: "Emergency Response Support System",
    purpose: "Emergency services",
    description:
      "India's national emergency number for police, health and fire services, listed by the Ministry of Home Affairs.",
    phone: "112",
    source:
      "https://www.mha.gov.in/en/commoncontent/emergency-response-support-system-erss",
    verifiedAt: "2026-10-08T00:00:00Z",
    reviewDue: "2026-11-08T00:00:00Z",
    enabled: true,
  },
];

function strictTime(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) &&
    new Date(time).toISOString().replace(".000Z", "Z") === value
    ? time
    : NaN;
}

export function resourceState(
  item: (typeof resources)[number],
  now = new Date(),
) {
  const start = strictTime(item.verifiedAt),
    end = strictTime(item.reviewDue),
    time = now.getTime();
  if (
    !item.enabled ||
    !Number.isFinite(time) ||
    !(end > start && time >= start)
  )
    return null;
  return time < end ? "active" : "expired";
}

export function activeResources(now = new Date(), records = resources) {
  return records.filter((item) => resourceState(item, now) === "active");
}
