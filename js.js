let traduzioni = {};
let pk = [];

async function caricaDati() {
  const [resTipi, resPokemon] = await Promise.all([
    fetch("tipi_ita.json"),
    fetch("evolines.json"),
  ]);
  traduzioni = await resTipi.json();
  pk = await resPokemon.json();
}

function trovaPokemon(ricerca) {
  return pk.find((linea) =>
    linea.some(
      (pokemon) =>
        pokemon.nome.toLowerCase() === ricerca ||
        String(pokemon.id) === ricerca,
    ),
  );
}

function trovaNellaLinea(linea, ricerca) {
  return linea.find(
    (pokemon) =>
      pokemon.nome.toLowerCase() === ricerca || String(pokemon.id) === ricerca,
  );
}

async function dettagliPokemon(id) {
  return (await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)).json();
}

function mostraErrore(messaggio) {
  document.getElementById("nome").innerHTML = messaggio;
}

function pulisci() {
  document.getElementById("nome").innerHTML = "";
  document.getElementById("sprite").innerHTML = "";
  document.getElementById("info").innerHTML = "";
  document.getElementById("shiny").innerHTML = "";
}

function info(data) {
  const altezza = data.height / 10;
  const peso = data.weight / 10;
  const tipi = data.types.map((t) => traduzioni[t.type.name]).join(", ");

  document.getElementById("info").innerHTML = `
    <p>Altezza: ${altezza} m</p>
    <p>Peso: ${peso} kg</p>
    <p>Tipo: ${tipi}</p>
  `;
}

function sprite(linea) {
  let html = "<h2>Versione Normale</h2>";
  for (const pokemon of linea) {
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

function shiny(linea) {
  let html = "<h2>Versione Shiny ✨</h2>";
  for (const pokemon of linea) {
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

async function cerca(event) {
  event.preventDefault();
  pulisci();

  const ricerca = document.getElementById("pokemon").value.toLowerCase();

  const lineaTrovata = trovaPokemon(ricerca);
  if (!lineaTrovata) {
    mostraErrore("Pokémon non trovato. Prova con un altro nome.");
    return;
  }

  const pokemonCercato = trovaNellaLinea(lineaTrovata, ricerca);
  const data = await dettagliPokemon(pokemonCercato.id);

  info(data);
  sprite(lineaTrovata);
  shiny(lineaTrovata);
}

caricaDati();
document.getElementById("form").addEventListener("submit", cerca);
