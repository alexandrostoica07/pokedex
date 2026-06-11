let typeTranslations = {};
let pk = [];
const abilityCache = {};

async function loadData() {
  const [resTypes, resPokemon] = await Promise.all([
    fetch("tipi_ita.json"),
    fetch("evolines.json"),
  ]);
  typeTranslations = await resTypes.json();
  pk = await resPokemon.json();
}

function findPokemon(query) {
  return pk.find((line) =>
    line.some(
      (pokemon) =>
        pokemon.nome.toLowerCase() === query || String(pokemon.id) === query,
    ),
  );
}

function findInLine(line, query) {
  return line.find(
    (pokemon) =>
      pokemon.nome.toLowerCase() === query || String(pokemon.id) === query,
  );
}

async function fetchPokemonDetails(id) {
  return (await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)).json();
}

function showError(message) {
  document.getElementById("nome").innerHTML = message;
}

function clearUI() {
  document.getElementById("nome").innerHTML = "";
  document.getElementById("sprite").innerHTML = "";
  document.getElementById("info").innerHTML = "";
  document.getElementById("shiny").innerHTML = "";
  document.getElementById("tabs").style.display = "none";
  document.getElementById("tab-stats").checked = true;
}

function showInfo(data) {
  const height = data.height / 10;
  const weight = data.weight / 10;
  const types = data.types.map((t) => typeTranslations[t.type.name]).join(", ");

  document.getElementById("info").innerHTML = `
    <p>Altezza: ${height} m</p>
    <p>Peso: ${weight} kg</p>
    <p>Tipo: ${types}</p>
  `;
}

function showStats(data) {
  const statNames = {
    hp: "HP",
    attack: "Attacco",
    defense: "Difesa",
    "special-attack": "Att. Speciale",
    "special-defense": "Dif. Speciale",
    speed: "Velocità",
  };

  let html = "";
  for (const stat of data.stats) {
    const name = statNames[stat.stat.name] ?? stat.stat.name;
    const value = stat.base_stat;
    const percent = Math.min((value / 255) * 100, 100);
    html += `
      <div class="stat-row">
        <span class="stat-name">${name}</span>
        <span class="stat-value">${value}</span>
        <div class="stat-bar">
          <div class="stat-fill" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }
  document.getElementById("panel-stats").innerHTML = html;
}

async function getAbilityName(abilityName, abilityUrl) {
  if (abilityCache[abilityName]) return abilityCache[abilityName];
  const res = await fetch(abilityUrl);
  const data = await res.json();
  const itName = data.names.find((n) => n.language.name === "it");
  const name = itName?.name ?? data.name;
  abilityCache[abilityName] = name;
  return name;
}

async function showAbilities(data) {
  if (data.abilities.length === 0) {
    document.getElementById("panel-abilities").innerHTML =
      "<p>Nessuna abilità.</p>";
    return;
  }

  const resolved = await Promise.all(
    data.abilities.map(async (a) => ({
      name: await getAbilityName(a.ability.name, a.ability.url),
      hidden: a.is_hidden,
    })),
  );

  let html = "<ul class='tab-list'>";
  for (const a of resolved) {
    const hidden = a.hidden ? " <span class='hidden-tag'>Nascosta</span>" : "";
    html += `<li>${a.name}${hidden}</li>`;
  }
  html += "</ul>";
  document.getElementById("panel-abilities").innerHTML = html;
}

function showHeldItems(data) {
  if (data.held_items.length === 0) {
    document.getElementById("panel-items").innerHTML =
      "<p>Nessun oggetto tenuto.</p>";
    return;
  }

  let html = "<ul class='tab-list'>";
  for (const item of data.held_items) {
    html += `<li>${item.item.name}</li>`;
  }
  html += "</ul>";
  document.getElementById("panel-items").innerHTML = html;
}

function showSprite(line) {
  let html = "<h2>Versione Normale</h2>";
  for (const pokemon of line) {
    html += `
      <div class="pokemon">
        <p>#${String(pokemon.id).padStart(3, "0")}</p>
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png"
          alt="${pokemon.nome}"
        >
        <p>${pokemon.nome}</p>
      </div>
    `;
  }
  document.getElementById("sprite").innerHTML = html;
}

function showShiny(line) {
  let html = "<h2>Versione Shiny ✨</h2>";
  for (const pokemon of line) {
    html += `
      <div class="pokemon">
        <p>#${String(pokemon.id).padStart(3, "0")} ✨</p>
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png"
          alt="${pokemon.nome} shiny"
        >
        <p>${pokemon.nome} ✨</p>
      </div>
    `;
  }
  document.getElementById("shiny").innerHTML = html;
}

async function search(event) {
  event.preventDefault();
  clearUI();

  const query = document.getElementById("pokemon").value.toLowerCase();

  const foundLine = findPokemon(query);
  if (!foundLine) {
    showError("Pokémon non trovato. Prova con un altro nome o id.");
    return;
  }

  const foundPokemon = findInLine(foundLine, query);
  const data = await fetchPokemonDetails(foundPokemon.id);

  showInfo(data);
  showStats(data);
  await showAbilities(data);
  showHeldItems(data);
  document.getElementById("tabs").style.display = "block";
  showSprite(foundLine);
  showShiny(foundLine);
}

loadData();
document.getElementById("form").addEventListener("submit", search);
