let pokemonData = [];
let responseAsJsonType = [];


async function renderPokemonCards(start, end) {
  showSpinner();
  const pokemon = await fetchPokemon(start, end);
  hideSpinner();

  for (let i = 0; i < pokemon.length; i++) {
    const pokemonName = pokemon[i].name;
    const pokemonURL = pokemon[i].url;
    
    document.getElementById("cards_wrapper").innerHTML += getCardsTemplate(i, "");
    
    const pokemonFirstType = await fetchPokemonDetails(i, pokemonURL);
    updateCardBackground(i, pokemonFirstType);
    
    document.getElementById("pokemon_name_" + i).innerHTML = pokemonName;
  }
}

function updateCardBackground(index, type) {
  const card = document.getElementById("cards_content_" + index);
  if (card) {
    card.className = `cards_content bg_${type}`;
  }
}

async function fetchPokemon(offset, limit) {
  let response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  responseAsJson = await response.json();
  return responseAsJson.results;
}

async function fetchPokemonDetails(i, url) {
  const response = await fetch(url);
  const responseAsJson = await response.json();
  let responseAsJsonType = responseAsJson.types;
  let pokemonFirstType = responseAsJsonType[0].type.name; // Nimmt den ersten Typ

  for (let j = 0; j < responseAsJsonType.length; j++) {
    let pokemonType = responseAsJsonType[j].type.name;
    document.getElementById("pokemon_info_" + [i]).innerHTML += getTypesTemplate(j, pokemonType); 
  }

  return pokemonFirstType;
}

function translateType(englishType) {
  const typeTranslations = {
    normal: "Normal",
    fire: "Feuer",
    water: "Wasser",
    electric: "Elektro",
    grass: "Pflanze",
    ice: "Eis",
    fighting: "Kampf",
    poison: "Gift",
    ground: "Boden",
    flying: "Flug",
    psychic: "Psycho",
    bug: "Käfer",
    rock: "Gestein",
    ghost: "Geist",
    dragon: "Drache",
    dark: "Unlicht",
    steel: "Stahl",
    fairy: "Fee",
  };
  return typeTranslations[englishType] || englishType;
}

// Loading Spinner
function showSpinner() {
  document.getElementById("loading_spinner").style.display = "block";
}

function hideSpinner() {
  document.getElementById("loading_spinner").style.display = "none";
}

// Beispiel für die Verwendung:
// showSpinner();
// Führen Sie hier Ihre asynchrone Operation durch
// Wenn die Operation abgeschlossen ist:
// hideSpinner();
