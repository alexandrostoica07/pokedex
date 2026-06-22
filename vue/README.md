# Pokédex – Prima Generazione

Una web application per esplorare i 151 Pokémon della prima generazione (Kanto), realizzata in due versioni con tecnologie diverse.

## Descrizione

Questo progetto è stato realizzato come esercitazione per il corso di Web Development.

L'applicazione è stata sviluppata in due versioni:

- **Versione Vanilla**: HTML, CSS e JavaScript puro con Petite Vue.
- **Versione React**: implementazione moderna basata su React e Vite.

L'obiettivo del progetto è confrontare due approcci differenti allo sviluppo frontend mantenendo le stesse funzionalità principali.

## Funzionalità

- Ricerca Pokémon per nome o numero (#001–151)
- Visualizzazione sprite principale e versione shiny
- Informazioni principali: numero, tipo, altezza, peso, esperienza base
- Statistiche con barre colorate (HP, Attacco, Difesa, ecc.)
- Abilità in italiano con indicazione delle abilità nascoste
- Oggetti tenuti in italiano
- Linea evolutiva completa con sprite
- Versione shiny della linea evolutiva
- Verso del Pokémon (audio)
- Icone speciali per Pokémon leggendari ⭐ e misteriosi 🌟
- Sfondo della card che cambia colore in base al tipo
- Interfaccia responsive
- Gestione degli errori

## Tecnologie Utilizzate

### Versione Vanilla

- HTML5
- CSS3
- JavaScript ES6
- Petite Vue 0.2.2

### Versione React

- React 18
- Vite
- JavaScript ES6
- CSS3

## Struttura del Progetto

```text
pokedex/
├── index.html
├── css.css
├── js.js
├── tipi_ita.json
├── evolines.json
├── README.md
└── pokedex-react/
    ├── src/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── public/
    │   ├── tipi_ita.json
    │   └── evolines.json
    ├── package.json
    └── vite.config.js
```

## Installazione

### Versione Vanilla

1. Clonare il repository

```bash
git clone <repository-url>
```

2. Aprire `index.html` nel browser.

### Versione React

1. Entrare nella cartella React

```bash
cd pokedex-react
```

2. Installare le dipendenze

```bash
npm install
```

3. Avviare il server di sviluppo

```bash
npm run dev
```

4. Aprire il browser all'indirizzo indicato nel terminale.

## API Utilizzata

- [PokéAPI](https://pokeapi.co) — dati Pokémon
- [PokeAPI Sprites](https://github.com/PokeAPI/sprites) — sprite e versioni shiny
- [PokeAPI Cries](https://github.com/PokeAPI/cries) — versi audio

## Obiettivi Didattici

- Comprendere le basi di HTML, CSS e JavaScript.
- Utilizzare le API REST tramite fetch.
- Gestire il DOM dinamicamente.
- Imparare la reattività con Petite Vue.
- Sviluppare applicazioni component-based con React.
- Confrontare sviluppo Vanilla JavaScript e React.
