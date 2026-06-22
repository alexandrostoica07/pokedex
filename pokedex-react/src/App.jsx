import { useState } from "react";
import "./index.css";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const LEGGENDARI = new Set([144, 145, 146, 150]);
const MISTERIOSI = new Set([151]);

const STAT_NAMES = {
  hp: "HP",
  attack: "Attacco",
  defense: "Difesa",
  "special-attack": "Att. Speciale",
  "special-defense": "Dif. Speciale",
  speed: "Velocità",
};

async function fetchJSON(url) {
  return (await fetch(url)).json();
}

function statPercent(value) {
  return `${Math.min((value / 255) * 100, 100)}%`;
}

function statClass(value) {
  if (value < 60) return "low";
  if (value < 100) return "mid";
  return "high";
}

const abilityCache = {};
const itemCache = {};

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

function App() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState(null);
  const [errore, setErrore] = useState("");
  const [evolutionLine, setEvolutionLine] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [typeTranslations, setTypeTranslations] = useState({});

  async function search(e) {
    e.preventDefault();
    setPokemon(null);
    setEvolutionLine([]);
    setAbilities([]);
    setItems([]);
    setErrore("");

    const [tipi, evolines] = await Promise.all([
      fetchJSON("/tipi_ita.json"),
      fetchJSON("/evolines.json"),
    ]);

    setTypeTranslations(tipi);

    const q = query.toLowerCase().trim();
    const line = evolines.find((l) =>
      l.some((p) => p.nome.toLowerCase() === q || String(p.id) === q),
    );

    if (!line) {
      setErrore("Pokémon non trovato. Prova con un altro nome o ID (1–151).");
      return;
    }

    const found = line.find(
      (p) => p.nome.toLowerCase() === q || String(p.id) === q,
    );
    const res = await fetchJSON(
      `https://pokeapi.co/api/v2/pokemon/${found.id}`,
    );

    const [abs, itms] = await Promise.all([
      Promise.all(
        res.abilities.map(async (a) => ({
          name: await fetchAbilityName(a.ability.name, a.ability.url),
          hidden: a.is_hidden,
        })),
      ),
      Promise.all(
        res.held_items.map((i) => fetchItemName(i.item.name, i.item.url)),
      ),
    ]);

    setPokemon(res);
    setEvolutionLine(line);
    setAbilities(abs);
    setItems(itms);
    setActiveTab("stats");
  }

  const star = pokemon
    ? LEGGENDARI.has(pokemon.id)
      ? "⭐"
      : MISTERIOSI.has(pokemon.id)
        ? "🌟"
        : ""
    : "";

  const primaryType = pokemon?.types[0].type.name ?? "normal";

  return (
    <div>
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-dot red"></span>
            <span className="logo-dot yellow"></span>
            <span className="logo-dot green"></span>
            <h1 className="logo-title">POKÉDEX</h1>
          </div>
          <p className="logo-sub">Prima Generazione · Kanto · #001–151</p>
        </div>
      </header>

      <section className="search-section">
        <form className="search-form" onSubmit={search}>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome o numero (#001–151)…"
              autoComplete="off"
            />
            <button type="submit" className="search-btn">
              Cerca
            </button>
          </div>
        </form>
      </section>

      {errore ? (
        <div className="error-banner">
          <span>⚠️</span> {errore}
        </div>
      ) : null}

      {pokemon ? (
        <main className="poke-card">
          <div className={`card-header type-bg-${primaryType}`}>
            <div className="card-meta">
              <span className="poke-number">
                #{String(pokemon.id).padStart(3, "0")}
              </span>
            </div>
            <h2 className="poke-name">
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </h2>
            <div className="type-badges">
              {pokemon.types.map((t) => (
                <span
                  key={t.type.name}
                  className={`type-badge type-${t.type.name}`}
                >
                  {typeTranslations[t.type.name] ?? t.type.name}
                </span>
              ))}
            </div>
            <button
              className="cry-btn"
              onClick={() => new Audio(pokemon.cries?.latest).play()}
            >
              🔊 <span>Verso</span>
            </button>
          </div>

          <div className="card-sprite">
            <img
              className="main-sprite"
              src={`${SPRITE_BASE}/${pokemon.id}.png`}
              alt={pokemon.name}
            />
          </div>

          <div className="quick-stats">
            <div className="quick-stat">
              <span className="qs-value">{pokemon.height / 10} m</span>
              <span className="qs-label">Altezza</span>
            </div>
            <div className="qs-divider"></div>
            <div className="quick-stat">
              <span className="qs-value">{pokemon.weight / 10} kg</span>
              <span className="qs-label">Peso</span>
            </div>
            <div className="qs-divider"></div>
            <div className="quick-stat">
              <span className="qs-value">{pokemon.base_experience ?? "—"}</span>
              <span className="qs-label">Esp. Base</span>
            </div>
          </div>

          <div id="tabs">
            <div id="tab-bar">
              <button
                className={activeTab === "stats" ? "active" : ""}
                onClick={() => setActiveTab("stats")}
              >
                📊 Statistiche
              </button>
              <button
                className={activeTab === "abilities" ? "active" : ""}
                onClick={() => setActiveTab("abilities")}
              >
                ✨ Abilità
              </button>
              <button
                className={activeTab === "items" ? "active" : ""}
                onClick={() => setActiveTab("items")}
              >
                🎒 Oggetti
              </button>
            </div>

            <div id="tab-content">
              {activeTab === "stats" ? (
                <div className="panel">
                  {pokemon.stats.map((s) => (
                    <div key={s.stat.name} className="stat-row">
                      <span className="stat-name">
                        {STAT_NAMES[s.stat.name] ?? s.stat.name}
                      </span>
                      <span className="stat-value">{s.base_stat}</span>
                      <div className="stat-bar">
                        <div
                          className={`stat-fill ${statClass(s.base_stat)}`}
                          style={{ width: statPercent(s.base_stat) }}
                        ></div>
                      </div>
                      <span className="stat-star">{star}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === "abilities" ? (
                <div className="panel">
                  {abilities.length > 0 ? (
                    <ul className="tab-list">
                      {abilities.map((a) => (
                        <li key={a.name} className="ability-item">
                          <span className="ability-name">{a.name}</span>
                          {a.hidden ? (
                            <span className="hidden-tag">Nascosta</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-msg">Nessuna abilità.</p>
                  )}
                </div>
              ) : null}

              {activeTab === "items" ? (
                <div className="panel">
                  {items.length > 0 ? (
                    <ul className="tab-list">
                      {items.map((item) => (
                        <li key={item} className="item-row">
                          🎒 {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-msg">Nessun oggetto tenuto.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </main>
      ) : null}

      {evolutionLine.length > 0 ? (
        <section className="evo-section">
          <h3 className="section-title">Linea Evolutiva</h3>
          <div className="evo-grid">
            {evolutionLine.map((p, i) => (
              <div
                key={p.id}
                className={`evo-item ${p.id === pokemon?.id ? "evo-current" : ""}`}
              >
                {i > 0 ? <div className="evo-arrow">→</div> : null}
                <div className="evo-card">
                  <span className="evo-num">
                    #{String(p.id).padStart(3, "0")}
                  </span>
                  <img
                    className="evo-sprite"
                    src={`${SPRITE_BASE}/${p.id}.png`}
                    alt={p.nome}
                  />
                  <span className="evo-name">{p.nome}</span>
                </div>
              </div>
            ))}
          </div>

          <h3 className="section-title shiny-title">✨ Versione Shiny</h3>
          <div className="evo-grid">
            {evolutionLine.map((p, i) => (
              <div
                key={`shiny-${p.id}`}
                className={`evo-item ${p.id === pokemon?.id ? "evo-current" : ""}`}
              >
                {i > 0 ? <div className="evo-arrow">→</div> : null}
                <div className="evo-card shiny-card">
                  <span className="evo-num">
                    #{String(p.id).padStart(3, "0")} ✨
                  </span>
                  <img
                    className="evo-sprite"
                    src={`${SPRITE_BASE}/shiny/${p.id}.png`}
                    alt={`${p.nome} shiny`}
                  />
                  <span className="evo-name">{p.nome}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="site-footer">
        <p>
          Dati via{" "}
          <a href="https://pokeapi.co" target="_blank">
            PokéAPI
          </a>{" "}
          · Immagini © Nintendo / Game Freak
        </p>
      </footer>
    </div>
  );
}

export default App;
