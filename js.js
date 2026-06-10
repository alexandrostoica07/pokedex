let pk = [];

fetch("evolines.json")
  .then((res) => res.json())
  .then((data) => {
    pk = data;
  });

document.getElementById("form").addEventListener("submit", cerca);

function cerca(event) {
  event.preventDefault();

  const ricerca = document.getElementById("pokemon").value.toLowerCase();

  document.getElementById("nome").innerHTML = "";
  document.getElementById("sprite").innerHTML = "";

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

  lineaTrovata.forEach((pokemon) => {
    document.getElementById("sprite").innerHTML += `
            <div class="pokemon">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${pokemon.nome}">
                <p>${pokemon.nome}</p>
            </div>
        `;
  });
}
