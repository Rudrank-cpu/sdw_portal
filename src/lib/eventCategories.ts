export const EVENT_CATEGORY_TABS = [
  { value: "All", label: "All" },
  { value: "Technical", label: "Technical" },
  { value: "Workshop", label: "Workshop" },
  { value: "Cultural", label: "Cultural" },
  { value: "Sports", label: "Sports" },
] as const;

export function categoryForEvent(category?: string) {
  if (!category) return "All";
  const normalized = category.trim().toLowerCase();
  const match = EVENT_CATEGORY_TABS.find(
    (tab) => tab.value !== "All" && tab.value.toLowerCase() === normalized,
  );
  return match?.value ?? category;
}
