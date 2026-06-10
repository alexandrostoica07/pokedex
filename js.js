let traduzioni = {};

fetch("tipi_ita.json")
  .then((res) => res.json())
  .then((data) => {
    traduzioni = data;
  });

let pk = [];

fetch("evolines.json")
  .then((res) => res.json())
  .then((data) => {
    pk = data;
  });

document.getElementById("form").addEventListener("submit", cerca);

async function cerca(event) {
  event.preventDefault();

  const ricerca = document.getElementById("pokemon").value.toLowerCase();

  document.getElementById("nome").innerHTML = "";
  document.getElementById("sprite").innerHTML = "";
  document.getElementById("info").innerHTML = "";
  document.getElementById("shiny").innerHTML = "";

  const lineaTrovata = pk.find((linea) =>
    linea.some(
      (pokemon) =>
        pokemon.nome.toLowerCase() === ricerca || pokemon.id == ricerca,
    ),
  );

  if (!lineaTrovata) {
    document.getElementById("nome").innerHTML =
      "Pokemon non trovato. Prova con un altro nome.";
    return;
  }

  let pokemonCercato = lineaTrovata.find(
    (pokemon) =>
      pokemon.nome.toLowerCase() === ricerca || pokemon.id == ricerca,
  );

  let res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonCercato.id}`,
  );

  let data = await res.json();

  let altezza = data.height / 10;
  let peso = data.weight / 10;
  let tipi = data.types.map((t) => traduzioni[t.type.name]).join(", ");

  document.getElementById("info").innerHTML = `
        <p>Altezza: ${altezza} m</p>
        <p>Peso: ${peso} kg</p>
        <p>Tipo: ${tipi}</p>
    `;
  document.getElementById("sprite").innerHTML = "<h2>Versione Normali</h2>";
  lineaTrovata.forEach((pokemon) => {
    document.getElementById("sprite").innerHTML += `
            <div class="pokemon">
                <p>#${String(pokemon.id).padStart(3, "0")}</p>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${pokemon.nome}">
                <p>${pokemon.nome}</p>
            </div>
        `;
  });

  document.getElementById("shiny").innerHTML = "<h2>Versione Shiny ✨</h2>";
  lineaTrovata.forEach((pokemon) => {
    document.getElementById("shiny").innerHTML += `
            <div class="pokemon">
                <p>#${String(pokemon.id).padStart(3, "0")}✨</p>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png" alt="${pokemon.nome} shiny">
                <p>${pokemon.nome} ✨</p>
            </div>
        `;
  });
}
