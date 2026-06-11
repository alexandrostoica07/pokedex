let translations = {};
let pk = [];

async function loadData() {
  const [resTypes, resPokemon] = await Promise.all([
    fetch("tipi_ita.json"),
    fetch("evolines.json"),
  ]);
  translations = await resTypes.json();
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
}

function showInfo(data) {
  const height = data.height / 10;
  const weight = data.weight / 10;
  const types = data.types.map((t) => translations[t.type.name]).join(", ");

  document.getElementById("info").innerHTML = `
    <p>Height: ${height} m</p>
    <p>Weight: ${weight} kg</p>
    <p>Type: ${types}</p>
  `;
}

function showSprite(line) {
  let html = "<h2>Normal Version</h2>";
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
  let html = "<h2>Shiny Version ✨</h2>";
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
    showError("Pokémon not found. Try another name.");
    return;
  }

  const foundPokemon = findInLine(foundLine, query);
  const data = await fetchPokemonDetails(foundPokemon.id);

  showInfo(data);
  showSprite(foundLine);
  showShiny(foundLine);
}

loadData();
document.getElementById("form").addEventListener("submit", search);
