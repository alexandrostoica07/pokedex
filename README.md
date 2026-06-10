# Pokédex Prima Generazione

Un'applicazione web semplice che permette di cercare i Pokémon della prima generazione (1–151) e visualizzarne le evoluzioni con gli sprite ufficiali.

## Funzionalità

- Ricerca di qualsiasi Pokémon della prima generazione tramite nome
- Visualizzazione automatica dell'intera linea evolutiva del Pokémon cercato
- Sprite ufficiali caricati dinamicamente tramite [PokéAPI](https://pokeapi.co/)

## Come si usa

1. Apri il file `pokedex.html` in un browser
2. Digita il nome di un Pokémon nel campo di ricerca (es. `Pikachu`, `Charmander`, `Eevee`)
3. Clicca su **Cerca**
4. Verranno mostrati tutti i Pokémon della stessa linea evolutiva con il loro sprite e nome

## Struttura del progetto

```
pokedex.html      # File unico contenente HTML, CSS e JavaScript
```

Tutto il codice è contenuto in un singolo file HTML, senza dipendenze esterne ad eccezione degli sprite caricati da GitHub (repository ufficiale di PokéAPI).

## Dati

I 151 Pokémon sono organizzati in un array JavaScript suddiviso per linee evolutive. Ogni voce contiene:

- `nome` — nome del Pokémon (usato per la ricerca)
- `id` — numero nel Pokédex nazionale (usato per recuperare lo sprite)

## Tecnologie

- HTML5
- CSS3
- JavaScript (Vanilla)
- [PokéAPI Sprites](https://github.com/PokeAPI/sprites) — sprite ufficiali

## Note

- La ricerca **non è case-sensitive** (es. `pikachu` e `PIKACHU` funzionano entrambi)
- Se il nome non corrisponde a nessun Pokémon, viene mostrato un messaggio di errore
- Sono inclusi solo i Pokémon originali (generazione 1, ID 1–151)
