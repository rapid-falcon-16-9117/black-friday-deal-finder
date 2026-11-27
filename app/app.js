// Deal Beacon boot: wires the controls to the filter/render modules and
// paints the first view (biggest saving first, all categories).

import { deals } from "./deals.js";
import { applyFilters, summaryStats, uniqueValues } from "./filters.js";
import { renderCategoryChips, renderDeals, renderStats } from "./render.js";

const state = { q: "", category: "", store: "", minDiscount: 0, verdict: "", sort: "saving" };

const grid = document.getElementById("dealGrid");
const emptyState = document.getElementById("emptyState");
const resultLine = document.getElementById("resultLine");
const statsBox = document.getElementById("stats");
const chipsBox = document.getElementById("categoryChips");

const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const storeSelect = document.getElementById("store");
const discountSelect = document.getElementById("minDiscount");
const verdictSelect = document.getElementById("verdict");

for (const store of uniqueValues(deals, "store")) {
  const opt = document.createElement("option");
  opt.value = store;
  opt.textContent = store;
  storeSelect.append(opt);
}

function paint() {
  const shown = applyFilters(deals, state);
  renderDeals(grid, emptyState, shown);
  resultLine.textContent =
    shown.length === deals.length
      ? `Showing all ${deals.length} deals — sorted by ${sortSelect.options[sortSelect.selectedIndex].text.toLowerCase()}.`
      : `Showing ${shown.length} of ${deals.length} deals.`;
  renderCategoryChips(chipsBox, uniqueValues(deals, "category"), state.category, (cat) => {
    state.category = cat;
    paint();
  });
}

searchInput.addEventListener("input", () => { state.q = searchInput.value; paint(); });
sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; paint(); });
storeSelect.addEventListener("change", () => { state.store = storeSelect.value; paint(); });
discountSelect.addEventListener("change", () => { state.minDiscount = Number(discountSelect.value); paint(); });
verdictSelect.addEventListener("change", () => { state.verdict = verdictSelect.value; paint(); });

renderStats(statsBox, summaryStats(deals));
paint();
