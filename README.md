# Pokédex Prima Generazione

Un'applicazione web che permette di cercare i Pokémon della prima generazione (1–151) per nome o numero, visualizzarne le statistiche, le abilità, gli oggetti tenuti, gli sprite normali e shiny, e l'intera linea evolutiva.

## Funzionalità

- Ricerca per **nome** o per **numero del Pokédex** (1–151)
- Visualizzazione di **altezza**, **peso** e **tipo** (in italiano) del Pokémon cercato
- Pannello a **schede** con:
  - **Base Stats** — barre grafiche per HP, Attacco, Difesa, Att. Speciale, Dif. Speciale e Velocità
  - **Abilities** — abilità in italiano, con indicazione delle abilità nascoste
  - **Held Items** — oggetti che il Pokémon può tenere in natura
- Sprite **versione normale** e **versione shiny ✨** per l'intera linea evolutiva
- Ricerca non case-sensitive

## Come si usa

1. Apri `index.html` in un browser
2. Digita il nome di un Pokémon (es. `Pikachu`, `Charmander`) oppure il suo numero (es. `25`, `4`)
3. Clicca su **Cerca**
4. Naviga tra le schede per esplorare statistiche, abilità e oggetti; scorri per vedere gli sprite dell'intera linea evolutiva

## Struttura del progetto

```
index.html        # Struttura della pagina
css.css           # Stili e layout
js.js             # Logica di ricerca e chiamate API
evolines.json     # Linee evolutive dei 151 Pokémon (nome + ID)
tipi_ita.json     # Traduzione dei tipi in italiano
```

## Dati locali

- `evolines.json` — raggruppa i 151 Pokémon in linee evolutive; ogni voce contiene `nome` e `id`
- `tipi_ita.json` — mappa i nomi dei tipi dall'inglese all'italiano

## Tecnologie

- HTML5 / CSS3 (tab in CSS puro, senza JavaScript)
- JavaScript Vanilla (Fetch API, `async/await`)
- [PokéAPI](https://pokeapi.co/) — dati di gioco (statistiche, abilità, oggetti)
- [PokéAPI Sprites](https://github.com/PokeAPI/sprites) — sprite ufficiali (normale e shiny)

## Note

- La ricerca **non è case-sensitive** (`pikachu` e `PIKACHU` funzionano entrambi)
- I nomi delle abilità vengono recuperati in italiano dalla PokéAPI e memorizzati in cache per evitare richieste duplicate
- Se il nome o il numero non corrisponde a nessun Pokémon, viene mostrato un messaggio di errore
- Sono inclusi solo i Pokémon originali (generazione 1, ID 1–151)
