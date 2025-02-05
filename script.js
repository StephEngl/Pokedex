let pokemonData = [];

async function fetchPokemonData() {
    let responseType = await fetch("https://pokeapi.co/api/v2/pokemon-species");
    let typeData = await responseType.json();
    console.log(typeData);
}


// async function fetchPokemonData() {
//   for (let i = 1; i <= 1025; i++) {
//     const response = await fetch(
//       `https://pokeapi.co/api/v2/pokemon-species/${i}`
//     );
//     const speciesData = await response.json();

//     const pokemonResponse = await fetch(
//       `https://pokeapi.co/api/v2/pokemon/${i}`
//     );
//     const pokemonData = await pokemonResponse.json();

//     const germanName = speciesData.names.find(
//       (name) => name.language.name === "de"
//     ).name;

//     pokemonData.push({
//       id: i,
//       name: germanName,
//       typen: pokemonData.types.map((type) => translateType(type.type.name)),
//     });
//   }

//   return JSON.stringify(pokemonData, null, 2);
// }

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

// fetchPokemonData().then((json) => console.log(json));






// Loading Spinner
function showSpinner() {
  document.getElementById("loading_spinner").style.display = "block";
}

function hideSpinner() {
  document.getElementById("loading_spinner").style.display = "none";
}

// Beispiel für die Verwendung:
showSpinner();
// Führen Sie hier Ihre asynchrone Operation durch
// Wenn die Operation abgeschlossen ist:
// hideSpinner();
