let pokemon = [];
let currentOffset = 0;
const limitLoadingPokemon = 50;
let currIndex = 1;

function init() {
  renderPokemonCards(0, limitLoadingPokemon);
}

async function renderPokemonCards(start, end) {
  // showSpinner();
  if (pokemon.length < end) {
    const newPokemon = await fetchPokemon(start, end - start);
    pokemon.push(...newPokemon);
  }
  
  addNewPokemonCards(start, end-start);
  await updatePokemonDetails(start, end-start);

  // hideSpinner();
  if (start > 0) {
    scrollToNewCards(start);
  }
}

function addNewPokemonCards(start, count) {
  let newCards = "";
  for (let i = start; i < start + count; i++) {
    newCards += getCardsTemplate(i, "");
  }
  document.getElementById("cards_wrapper").innerHTML += newCards;
}

async function updatePokemonDetails(start, count) {
  for (let i = start; i < start + count; i++) {
    if (!pokemon[i].details) {
      const monsterDetails = await fetchPokemonDetails(i, pokemon[i].url);
      pokemon[i].details = monsterDetails.details;
      pokemon[i].firstType = monsterDetails.firstType;
    }

    const pokemonName = pokemon[i].name;
    const pokemonId = pokemon[i].details.id;
    updateCardBackground(i, pokemon[i].firstType);
    document.getElementById("pokemon_name_" + i).innerHTML = pokemonName;
    document.getElementById("pokemon_id_" + i).innerHTML = "#" + ('000' + pokemonId).slice(-4)
  }
}

function loadMorePokemon() {
  currentOffset += limitLoadingPokemon;
  renderPokemonCards(currentOffset, currentOffset + limitLoadingPokemon);
}

function updateCardBackground(index, type) {
  const card = document.getElementById("cards_content_" + index);
  if (card) {
    card.className = `cards_content bg_${type}`;
  }
}

function scrollToNewCards(start) {
  const firstNewCard = document.getElementById("cards_content_" + start);
  if (firstNewCard) {
    firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function fetchPokemon(offset, limit) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    const responseAsJson = await response.json();
    return responseAsJson.results;
  } catch (error) {
    console.error("Error while loading Pokémon API", error)
  }
}

async function fetchPokemonDetails(i, url) {
  const response = await fetch(url);
  const pokemonDetails = await response.json();
  const pokemonFirstType = pokemonDetails.types[0].type.name;
  getPokemonCardImage(i, pokemonDetails)
  renderPokemonTypes(i, pokemonDetails.types);

  return {
    firstType: pokemonFirstType,
    details: pokemonDetails
  };
}

function getPokemonCardImage(i, pokemonDetails) {
  const pokemonCardImg = pokemonDetails.sprites.other.dream_world.front_default;
  document.getElementById("pokemon_image_" + [i]).src = pokemonCardImg;
}

function renderPokemonTypes(i, types) {
  const typeContainer = document.getElementById("pokemon_info_" + i);
  types.forEach((pokemonType, j) => {
    typeContainer.innerHTML += getTypesTemplate(j, pokemonType.type.name);
  });
}

// Show Dialog -> DetailCard
function openDetailCard() {
  let refOverlay = document.getElementById("overlay");
  refOverlay.showModal();
  // showImage(currIndex);
}

function onMouseDown(event) {
  const dialog = document.getElementById("overlay");
  if (event.target === dialog) {
    dialog.close();
  }
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

function showSpinner() {
  document.getElementById("cards_wrapper").style.display = "none";
  document.getElementById("loading_spinner").style.display = "flex";
}

function hideSpinner() {
  document.getElementById("loading_spinner").style.display = "none";
  document.getElementById("cards_wrapper").style.display = "flex";
}