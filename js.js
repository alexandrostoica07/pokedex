// ── Costanti ──────────────────────────────────────────────

const LEGGENDARI  = new Set([144, 145, 146, 150]);
const MISTERIOSI  = new Set([151]);
const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const STAT_NAMES  = {
  hp:               "HP",
  attack:           "Attacco",
  defense:          "Difesa",
  "special-attack": "Att. Speciale",
  "special-defense":"Dif. Speciale",
  speed:            "Velocità",
};

// ── API ───────────────────────────────────────────────────

async function fetchJSON(url) {
  return (await fetch(url)).json();
}

// ── App ───────────────────────────────────────────────────

function Pokedex(typeTranslations, evolutionLines) {
  return {
    // stato
    query:         "",
    pokemon:       null,
    evolutionLine: [],
    errore:        "",
    abilities:     [],
    items:         [],
    tipi:          "",

    // dati pre-caricati
    typeTranslations,
    evolutionLines,
    abilityCache: {},
    itemCache:    {},

    // costanti esposte al template
    STAT_NAMES,
    SPRITE_BASE,

    // computed-like
    get star() {
      if (!this.pokemon) return "";
      if (LEGGENDARI.has(this.pokemon.id)) return "⭐";
      if (MISTERIOSI.has(this.pokemon.id)) return "🌟";
      return "";
    },

    // helpers
    capitalize(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    },

    statPercent(value) {
      return `${Math.min((value / 255) * 100, 100)}%`;
    },

    playCry() {
      const url = this.pokemon.cries?.latest
        ?? `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${this.pokemon.id}.ogg`;
      new Audio(url).play();
    },

    findEvolutionLine(query) {
      return this.evolutionLines.find(line =>
        line.some(p => p.nome.toLowerCase() === query || String(p.id) === query)
      );
    },

    async fetchAbilityName(name, url) {
      if (this.abilityCache[name]) return this.abilityCache[name];
      const data = await fetchJSON(url);
      const it   = data.names.find(n => n.language.name === "it");
      return (this.abilityCache[name] = it?.name ?? name);
    },

    async fetchItemName(name, url) {
      if (this.itemCache[name]) return this.itemCache[name];
      const data = await fetchJSON(url);
      const it   = data.names.find(n => n.language.name === "it");
      return (this.itemCache[name] = it?.name ?? name);
    },

    // ── Search ──────────────────────────────────────────────

    async search() {
      this.pokemon       = null;
      this.evolutionLine = [];
      this.abilities     = [];
      this.items         = [];
      this.errore        = "";

      const query = this.query.toLowerCase().trim();
      const line  = this.findEvolutionLine(query);

      if (!line) {
        this.errore = "Pokémon non trovato. Prova con un altro nome o id.";
        return;
      }

      const found        = line.find(p => p.nome.toLowerCase() === query || String(p.id) === query);
      this.pokemon       = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${found.id}`);
      this.evolutionLine = line;
      this.tipi          = this.pokemon.types.map(t => this.typeTranslations[t.type.name]).join(", ");

      const [abilities, items] = await Promise.all([
        Promise.all(
          this.pokemon.abilities.map(async a => ({
            name:   await this.fetchAbilityName(a.ability.name, a.ability.url),
            hidden: a.is_hidden,
          }))
        ),
        Promise.all(
          this.pokemon.held_items.map(i => this.fetchItemName(i.item.name, i.item.url))
        ),
      ]);

      this.abilities = abilities;
      this.items     = items;
    },
  };
}

// ── Mount (JSON caricati prima del mount) ──────────────────

Promise.all([
  fetchJSON("tipi_ita.json"),
  fetchJSON("evolines.json"),
]).then(([typeTranslations, evolutionLines]) => {
  PetiteVue.createApp({
    Pokedex: () => Pokedex(typeTranslations, evolutionLines),
  }).mount();
});
