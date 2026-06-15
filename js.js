let typeTranslations = {};
let pk = [];
const abilityCache = {};
const itemCache = {};

const LEGGENDARI = new Set([144, 145, 146, 150]);
const MISTERIOSI = new Set([151]);

// ── Helpers ──────────────────────────────────────────────

function show(id) {
  document.getElementById(id).classList.remove("hidden");
}
function hide(id) {
  document.getElementById(id).classList.add("hidden");
}
function setText(id, text) {
  document.getElementById(id).textContent = text;
}
function cloneTemplate(id) {
  return document.getElementById(id).content.cloneNode(true);
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
  document.getElementById("panel-stats").innerHTML = "";
  document.getElementById("abilities-list").innerHTML = "";
  document.getElementById("items-list").innerHTML = "";
  document.getElementById("sprite-list").innerHTML = "";
  document.getElementById("shiny-list").innerHTML = "";
  hide("abilities-empty");
  hide("items-empty");
  document.getElementById("tab-stats").checked = true;
}

function showError(message) {
  const el = document.getElementById("nome");
  el.textContent = message;
  show("nome");
}

// ── UI: info ──────────────────────────────────────────────

function showInfo(data) {
  setText("nome", data.name.charAt(0).toUpperCase() + data.name.slice(1));
  show("nome");

  const cryUrl =
    data.cries?.latest ??
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`;
  document.getElementById("cry-btn").onclick = () => new Audio(cryUrl).play();
  show("cry");

  setText("info-altezza", `${data.height / 10} m`);
  setText("info-peso", `${data.weight / 10} kg`);
  setText(
    "info-tipo",
    data.types.map((t) => typeTranslations[t.type.name]).join(", "),
  );
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
  const container = document.getElementById("panel-stats");

  for (const stat of data.stats) {
    const frag = cloneTemplate("tpl-stat-row");
    const row = frag.querySelector(".stat-row");
    row.querySelector(".stat-name").textContent =
      statNames[stat.stat.name] ?? stat.stat.name;
    row.querySelector(".stat-value").textContent = stat.base_stat;
    row.querySelector(".stat-fill").style.width =
      `${Math.min((stat.base_stat / 255) * 100, 100)}%`;
    row.querySelector(".stat-star").textContent = star;
    container.appendChild(frag);
  }
}

// ── UI: abilities ─────────────────────────────────────────

async function showAbilities(data) {
  if (data.abilities.length === 0) {
    show("abilities-empty");
    return;
  }

  const list = document.getElementById("abilities-list");
  const resolved = await Promise.all(
    data.abilities.map(async (a) => ({
      name: await getAbilityName(a.ability.name, a.ability.url),
      hidden: a.is_hidden,
    })),
  );

  for (const a of resolved) {
    const frag = cloneTemplate("tpl-ability");
    const li = frag.querySelector("li");
    li.querySelector(".ability-name").textContent = a.name;
    if (a.hidden) li.querySelector(".hidden-tag").classList.remove("hidden");
    list.appendChild(frag);
  }
}

// ── UI: held items ────────────────────────────────────────

async function showHeldItems(data) {
  if (data.held_items.length === 0) {
    show("items-empty");
    return;
  }

  const list = document.getElementById("items-list");
  const resolved = await Promise.all(
    data.held_items.map(async (i) => ({
      name: await getItemName(i.item.name, i.item.url),
    })),
  );

  for (const i of resolved) {
    const frag = cloneTemplate("tpl-item");
    frag.querySelector(".item-name").textContent = i.name;
    list.appendChild(frag);
  }
}

// ── UI: sprites ───────────────────────────────────────────

function showSprites(line) {
  const normalList = document.getElementById("sprite-list");
  const shinyList = document.getElementById("shiny-list");

  for (const pokemon of line) {
    const idStr = `#${String(pokemon.id).padStart(3, "0")}`;

    const normal = cloneTemplate("tpl-pokemon-card");
    normal.querySelector(".pokemon-id").textContent = idStr;
    normal.querySelector(".pokemon-img").src =
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    normal.querySelector(".pokemon-img").alt = pokemon.nome;
    normal.querySelector(".pokemon-name").textContent = pokemon.nome;
    normalList.appendChild(normal);

    const shiny = cloneTemplate("tpl-pokemon-card");
    shiny.querySelector(".pokemon-id").textContent = `${idStr} ✨`;
    shiny.querySelector(".pokemon-img").src =
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`;
    shiny.querySelector(".pokemon-img").alt = `${pokemon.nome} shiny`;
    shiny.querySelector(".pokemon-name").textContent = `${pokemon.nome} ✨`;
    shinyList.appendChild(shiny);
  }

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
    showError("Pokémon non trovato. Prova con un altro nome o id.");
    return;
  }

  const foundPokemon = findInLine(foundLine, query);
  const data = await fetchPokemonDetails(foundPokemon.id);

  const isLegendary = LEGGENDARI.has(foundPokemon.id);
  const isMisterioso = MISTERIOSI.has(foundPokemon.id);

  showInfo(data);
  showStats(data, isLegendary, isMisterioso);
  await showAbilities(data);
  await showHeldItems(data);
  show("tabs");
  showSprites(foundLine);
}

// ── Init ──────────────────────────────────────────────────

loadData();
document.getElementById("form").addEventListener("submit", search);
