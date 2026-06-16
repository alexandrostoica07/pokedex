// ── Costanti ──────────────────────────────────────────────

const LEGGENDARI = new Set([144, 145, 146, 150]);
const MISTERIOSI = new Set([151]);
const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const STAT_NAMES = {
  hp: "HP",
  attack: "Attacco",
  defense: "Difesa",
  "special-attack": "Att. Speciale",
  "special-defense": "Dif. Speciale",
  speed: "Velocità",
};

// ── Stato ─────────────────────────────────────────────────

let typeTranslations = {};
let evolutionLines = [];
const abilityCache = {};
const itemCache = {};

// ── API ───────────────────────────────────────────────────

async function fetchJSON(url) {
  return (await fetch(url)).json();
}

async function fetchPokemonDetails(id) {
  return fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`);
}

async function fetchAbilityName(name, url) {
  if (abilityCache[name]) return abilityCache[name];
  const data = await fetchJSON(url);
  const it = data.names.find((n) => n.language.name === "it");
  return (abilityCache[name] = it?.name ?? name);
}

async function fetchItemName(name, url) {
  if (itemCache[name]) return itemCache[name];
  const data = await fetchJSON(url);
  const it = data.names.find((n) => n.language.name === "it");
  return (itemCache[name] = it?.name ?? name);
}

// ── Ricerca dati ──────────────────────────────────────────

function findEvolutionLine(query) {
  return evolutionLines.find((line) =>
    line.some((p) => p.nome.toLowerCase() === query || String(p.id) === query),
  );
}

function findPokemonInLine(line, query) {
  return line.find(
    (p) => p.nome.toLowerCase() === query || String(p.id) === query,
  );
}

// ── DOM helpers ───────────────────────────────────────────

const el = (id) => document.getElementById(id);
const show = (id) => el(id).classList.remove("hidden");
const hide = (id) => el(id).classList.add("hidden");

function clearElement(id) {
  el(id).innerHTML = "";
}

function cloneTemplate(templateId) {
  return el(templateId).content.cloneNode(true);
}

// ── Render sezioni ────────────────────────────────────────

function renderName(name) {
  el("nome").textContent = name.charAt(0).toUpperCase() + name.slice(1);
  show("nome");
}

function renderCry(data) {
  const url =
    data.cries?.latest ??
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`;
  el("cry-btn").onclick = () => new Audio(url).play();
  show("cry");
}

function renderInfo(data) {
  el("info").querySelector("[data-field=altezza]").textContent =
    `${data.height / 10} m`;
  el("info").querySelector("[data-field=peso]").textContent =
    `${data.weight / 10} kg`;
  el("info").querySelector("[data-field=tipo]").textContent = data.types
    .map((t) => typeTranslations[t.type.name])
    .join(", ");
  show("info");
}

function renderStats(stats, id) {
  const star = LEGGENDARI.has(id) ? "⭐" : MISTERIOSI.has(id) ? "🌟" : "";
  const container = el("panel-stats");

  for (const s of stats) {
    const frag = cloneTemplate("tpl-stat-row");
    const percent = `${Math.min((s.base_stat / 255) * 100, 100)}%`;

    frag.querySelector("[data-field=name]").textContent =
      STAT_NAMES[s.stat.name] ?? s.stat.name;
    frag.querySelector("[data-field=value]").textContent = s.base_stat;
    frag.querySelector("[data-field=star]").textContent = star;
    frag.querySelector(".stat-fill").style.width = percent;

    container.appendChild(frag);
  }
}

async function renderAbilities(abilities) {
  if (!abilities.length) {
    show("abilities-empty");
    return;
  }

  const list = el("abilities-list");
  await Promise.all(
    abilities.map(async (a) => {
      const name = await fetchAbilityName(a.ability.name, a.ability.url);
      const frag = cloneTemplate("tpl-ability");

      frag.querySelector("[data-field=name]").textContent = name;
      const tag = frag.querySelector(".hidden-tag");
      tag.classList.toggle("hidden", !a.is_hidden);

      list.appendChild(frag);
    }),
  );
}

async function renderHeldItems(items) {
  if (!items.length) {
    show("items-empty");
    return;
  }

  const list = el("items-list");
  await Promise.all(
    items.map(async (i) => {
      const name = await fetchItemName(i.item.name, i.item.url);
      const frag = cloneTemplate("tpl-item");

      frag.querySelector("[data-field=name]").textContent = name;
      list.appendChild(frag);
    }),
  );
}

function renderSpriteCard(containerId, pokemon, shiny = false) {
  const frag = cloneTemplate("tpl-pokemon-card");
  const src = shiny
    ? `${SPRITE_BASE}/shiny/${pokemon.id}.png`
    : `${SPRITE_BASE}/${pokemon.id}.png`;

  frag.querySelector("[data-field=id]").textContent =
    `#${String(pokemon.id).padStart(3, "0")}${shiny ? " ✨" : ""}`;
  frag.querySelector("img").src = src;
  frag.querySelector("img").alt = pokemon.nome + (shiny ? " shiny" : "");
  frag.querySelector("[data-field=name]").textContent =
    pokemon.nome + (shiny ? " ✨" : "");

  el(containerId).appendChild(frag);
}

function renderSprites(line) {
  for (const p of line) {
    renderSpriteCard("sprite-list", p, false);
    renderSpriteCard("shiny-list", p, true);
  }
  show("sprite");
  show("shiny");
}

// ── Reset UI ──────────────────────────────────────────────

function resetUI() {
  ["nome", "cry", "info", "tabs", "sprite", "shiny"].forEach(hide);
  [
    "panel-stats",
    "abilities-list",
    "items-list",
    "sprite-list",
    "shiny-list",
  ].forEach(clearElement);
  ["abilities-empty", "items-empty"].forEach(hide);
  el("tab-stats").checked = true;
}

// ── Search ────────────────────────────────────────────────

async function search(event) {
  event.preventDefault();
  resetUI();

  const query = el("pokemon").value.toLowerCase().trim();
  const line = findEvolutionLine(query);

  if (!line) {
    el("nome").textContent =
      "Pokémon non trovato. Prova con un altro nome o id.";
    show("nome");
    return;
  }

  const pokemon = findPokemonInLine(line, query);
  const data = await fetchPokemonDetails(pokemon.id);

  renderName(data.name);
  renderCry(data);
  renderInfo(data);
  renderStats(data.stats, pokemon.id);
  await renderAbilities(data.abilities);
  await renderHeldItems(data.held_items);
  show("tabs");
  renderSprites(line);
}

// ── Init ──────────────────────────────────────────────────

async function init() {
  [typeTranslations, evolutionLines] = await Promise.all([
    fetchJSON("tipi_ita.json"),
    fetchJSON("evolines.json"),
  ]);
  el("form").addEventListener("submit", search);
}

init();
