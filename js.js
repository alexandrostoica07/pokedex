let typeTranslations = {};
let pk = [];
const abilityCache = {};
const itemCache = {};

const LEGGENDARI = new Set([144, 145, 146, 150]);
const MISTERIOSI = new Set([151]);

// ── Binding engine ────────────────────────────────────────
//
// bind(root, data) — popola tutti gli elementi dentro `root`
// che hanno attributi di binding:
//
//   data-field="key"          → el.textContent = data[key]
//   data-style="prop:key"     → el.style[prop] = data[key]
//   data-attr="attr:key"      → el.setAttribute(attr, data[key])
//   data-attr2="attr:key"     → idem (secondo attributo sullo stesso elemento)
//   data-show-if="key"        → rimuove .hidden se data[key] è truthy

function bind(root, data) {
  root.querySelectorAll("[data-field]").forEach((el) => {
    el.textContent = data[el.dataset.field] ?? "";
  });
  root.querySelectorAll("[data-style]").forEach((el) => {
    const [prop, key] = el.dataset.style.split(":");
    el.style[prop] = data[key] ?? "";
  });
  ["attr", "attr2"].forEach((attrKey) => {
    root.querySelectorAll(`[data-${attrKey}]`).forEach((el) => {
      const [attr, key] = el.dataset[attrKey].split(":");
      el.setAttribute(attr, data[key] ?? "");
    });
  });
  root.querySelectorAll("[data-show-if]").forEach((el) => {
    const key = el.dataset.showIf;
    el.classList.toggle("hidden", !data[key]);
  });
}

// ── Template engine ───────────────────────────────────────
//
// renderList(containerId, templateId, items) — per ogni item
// clona il template, chiama bind(), e appende al container.

function renderList(containerId, templateId, items) {
  const container = document.getElementById(containerId);
  const tpl = document.getElementById(templateId);
  for (const item of items) {
    const frag = tpl.content.cloneNode(true);
    bind(frag, item);
    container.appendChild(frag);
  }
}

// ── Visibility helpers ────────────────────────────────────

function show(id) {
  document.getElementById(id).classList.remove("hidden");
}
function hide(id) {
  document.getElementById(id).classList.add("hidden");
}

// ── Data loading ──────────────────────────────────────────

async function loadData() {
  const [resTypes, resPokemon] = await Promise.all([
    fetch("tipi_ita.json"),
    fetch("evolines.json"),
  ]);
  typeTranslations = await resTypes.json();
  pk = await resPokemon.json();
}

// ── Search helpers ────────────────────────────────────────

function findPokemon(query) {
  return pk.find((line) =>
    line.some((p) => p.nome.toLowerCase() === query || String(p.id) === query),
  );
}

function findInLine(line, query) {
  return line.find(
    (p) => p.nome.toLowerCase() === query || String(p.id) === query,
  );
}

async function fetchPokemonDetails(id) {
  return (await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)).json();
}

async function getAbilityName(name, url) {
  if (abilityCache[name]) return abilityCache[name];
  const data = await (await fetch(url)).json();
  const it = data.names.find((n) => n.language.name === "it");
  abilityCache[name] = it?.name ?? name;
  return abilityCache[name];
}

async function getItemName(name, url) {
  if (itemCache[name]) return itemCache[name];
  const data = await (await fetch(url)).json();
  const it = data.names.find((n) => n.language.name === "it");
  itemCache[name] = it?.name ?? name;
  return itemCache[name];
}

// ── UI: clear ─────────────────────────────────────────────

function clearUI() {
  ["nome", "cry", "info", "tabs", "sprite", "shiny"].forEach(hide);
  [
    "panel-stats",
    "abilities-list",
    "items-list",
    "sprite-list",
    "shiny-list",
  ].forEach((id) => {
    document.getElementById(id).innerHTML = "";
  });
  ["abilities-empty", "items-empty"].forEach(hide);
  document.getElementById("tab-stats").checked = true;
}

// ── UI: info ──────────────────────────────────────────────

function showInfo(data) {
  bind(document.getElementById("nome"), {
    nome: data.name.charAt(0).toUpperCase() + data.name.slice(1),
  });
  show("nome");

  const cryUrl =
    data.cries?.latest ??
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`;
  document.getElementById("cry-btn").onclick = () => new Audio(cryUrl).play();
  show("cry");

  bind(document.getElementById("info"), {
    altezza: `${data.height / 10} m`,
    peso: `${data.weight / 10} kg`,
    tipo: data.types.map((t) => typeTranslations[t.type.name]).join(", "),
  });
  show("info");
}

// ── UI: stats ─────────────────────────────────────────────

function showStats(data, isLegendary, isMisterioso) {
  const statNames = {
    hp: "HP",
    attack: "Attacco",
    defense: "Difesa",
    "special-attack": "Att. Speciale",
    "special-defense": "Dif. Speciale",
    speed: "Velocità",
  };

  const star = isLegendary ? "⭐" : isMisterioso ? "🌟" : "";

  renderList(
    "panel-stats",
    "tpl-stat-row",
    data.stats.map((s) => ({
      name: statNames[s.stat.name] ?? s.stat.name,
      value: String(s.base_stat),
      percent: `${Math.min((s.base_stat / 255) * 100, 100)}%`,
      star,
    })),
  );
}

// ── UI: abilities ─────────────────────────────────────────

async function showAbilities(data) {
  if (data.abilities.length === 0) {
    show("abilities-empty");
    return;
  }

  const items = await Promise.all(
    data.abilities.map(async (a) => ({
      name: await getAbilityName(a.ability.name, a.ability.url),
      hidden: a.is_hidden,
    })),
  );
  renderList("abilities-list", "tpl-ability", items);
}

// ── UI: held items ────────────────────────────────────────

async function showHeldItems(data) {
  if (data.held_items.length === 0) {
    show("items-empty");
    return;
  }

  const items = await Promise.all(
    data.held_items.map(async (i) => ({
      name: await getItemName(i.item.name, i.item.url),
    })),
  );
  renderList("items-list", "tpl-item", items);
}

// ── UI: sprites ───────────────────────────────────────────

function showSprites(line) {
  const baseUrl =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

  renderList(
    "sprite-list",
    "tpl-pokemon-card",
    line.map((p) => ({
      id: `#${String(p.id).padStart(3, "0")}`,
      src: `${baseUrl}/${p.id}.png`,
      alt: p.nome,
      name: p.nome,
    })),
  );

  renderList(
    "shiny-list",
    "tpl-pokemon-card",
    line.map((p) => ({
      id: `#${String(p.id).padStart(3, "0")} ✨`,
      src: `${baseUrl}/shiny/${p.id}.png`,
      alt: `${p.nome} shiny`,
      name: `${p.nome} ✨`,
    })),
  );

  show("sprite");
  show("shiny");
}

// ── Search ────────────────────────────────────────────────

async function search(event) {
  event.preventDefault();
  clearUI();

  const query = document.getElementById("pokemon").value.toLowerCase().trim();
  const foundLine = findPokemon(query);

  if (!foundLine) {
    bind(document.getElementById("nome"), {
      nome: "Pokémon non trovato. Prova con un altro nome o id.",
    });
    show("nome");
    return;
  }

  const foundPokemon = findInLine(foundLine, query);
  const data = await fetchPokemonDetails(foundPokemon.id);

  showInfo(data);
  showStats(
    data,
    LEGGENDARI.has(foundPokemon.id),
    MISTERIOSI.has(foundPokemon.id),
  );
  await showAbilities(data);
  await showHeldItems(data);
  show("tabs");
  showSprites(foundLine);
}

// ── Init ──────────────────────────────────────────────────

loadData();
document.getElementById("form").addEventListener("submit", search);
