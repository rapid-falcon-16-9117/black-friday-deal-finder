// Rendering for Deal Beacon: builds the deal cards, the stats strip and the
// category chips from the data, and nothing else. All text comes from
// deals.js, so the page never shows a placeholder.

import { CHECKED_LABEL } from "./deals.js";
import { discountPct, money, saving, verdictLabel } from "./filters.js";

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

export function renderStats(container, stats) {
  container.replaceChildren();
  const items = [
    [String(stats.count), "verified deals"],
    [String(stats.stores), "stores"],
    [money(stats.totalSaving), "total savings if you bought one of each"],
    [stats.bestDiscount + "%", "biggest single discount"],
  ];
  for (const [value, label] of items) {
    const box = el("div", "stat");
    box.append(el("b", null, value), el("span", null, label));
    container.append(box);
  }
}

export function renderCategoryChips(container, categories, active, onPick) {
  container.replaceChildren();
  const all = el("button", "chip", "All categories");
  all.type = "button";
  all.setAttribute("aria-pressed", active === "" ? "true" : "false");
  all.addEventListener("click", () => onPick(""));
  container.append(all);
  for (const cat of categories) {
    const chip = el("button", "chip", cat);
    chip.type = "button";
    chip.setAttribute("aria-pressed", active === cat ? "true" : "false");
    chip.addEventListener("click", () => onPick(cat));
    container.append(chip);
  }
}

function dealCard(deal) {
  const pct = discountPct(deal);
  const card = el("article", "deal");

  const top = el("div", "deal-top");
  top.append(el("span", "deal-cat", deal.category));
  const badge = el("span", "badge badge-" + deal.verdict, verdictLabel(deal.verdict));
  top.append(badge);
  card.append(top);

  card.append(el("h2", null, deal.title));
  card.append(el("p", "deal-store", deal.store));

  const prices = el("div", "price-row");
  prices.append(el("span", "price", money(deal.price)));
  prices.append(el("span", "was", money(deal.was)));
  prices.append(el("span", "off", pct + "% off"));
  card.append(prices);
  card.append(el("p", "save-line", "You save " + money(saving(deal))));

  const toggle = el("button", "evidence-toggle", "Why it's a deal ▸");
  toggle.type = "button";
  const evidence = el("div", "evidence");
  evidence.hidden = true;
  evidence.append(el("p", null, deal.evidence));
  const src = el("p", "src", "Source: " + deal.source);
  evidence.append(src);
  toggle.addEventListener("click", () => {
    evidence.hidden = !evidence.hidden;
    toggle.textContent = evidence.hidden ? "Why it's a deal ▸" : "Why it's a deal ▾";
  });
  card.append(toggle, evidence);

  const link = el("a", "store-link", "View at " + deal.store + " ↗");
  link.href = deal.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  card.append(link);

  card.append(el("p", "checked", "Price checked " + CHECKED_LABEL));
  return card;
}

export function renderDeals(grid, emptyState, list) {
  grid.replaceChildren();
  for (const deal of list) grid.append(dealCard(deal));
  emptyState.hidden = list.length !== 0;
}
