// Filtering and sorting for Deal Beacon. Pure functions over the deals list
// so the UI (render.js) stays thin and the rules stay testable.

export function discountPct(deal) {
  if (!deal.was || deal.was <= deal.price) return 0;
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

export function saving(deal) {
  return Math.max(0, +(deal.was - deal.price).toFixed(2));
}

export function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

const VERDICT_LABEL = {
  "new-low": "New low",
  strong: "Strong price",
  routine: "Routine sale",
};

export function verdictLabel(v) {
  return VERDICT_LABEL[v] ?? v;
}

export function uniqueValues(list, key) {
  return [...new Set(list.map((d) => d[key]))].sort();
}

// criteria: { q, category, store, minDiscount, verdict, sort }
export function applyFilters(list, criteria) {
  const q = (criteria.q || "").trim().toLowerCase();
  let out = list.filter((d) => {
    if (q && !(d.title + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    if (criteria.category && d.category !== criteria.category) return false;
    if (criteria.store && d.store !== criteria.store) return false;
    if (criteria.minDiscount && discountPct(d) < criteria.minDiscount) return false;
    if (criteria.verdict && d.verdict !== criteria.verdict) return false;
    return true;
  });
  switch (criteria.sort) {
    case "discount":
      out = [...out].sort((a, b) => discountPct(b) - discountPct(a) || saving(b) - saving(a));
      break;
    case "price-asc":
      out = [...out].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out = [...out].sort((a, b) => b.price - a.price);
      break;
    case "name":
      out = [...out].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "saving":
    default:
      out = [...out].sort((a, b) => saving(b) - saving(a));
      break;
  }
  return out;
}

export function summaryStats(list) {
  const totalSaving = list.reduce((sum, d) => sum + saving(d), 0);
  const best = list.reduce((m, d) => Math.max(m, discountPct(d)), 0);
  return {
    count: list.length,
    stores: new Set(list.map((d) => d.store)).size,
    categories: new Set(list.map((d) => d.category)).size,
    totalSaving,
    bestDiscount: best,
  };
}
