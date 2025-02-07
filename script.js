let pokemon = [];
let allPokemonNames = [];
let pokemonDetails = [];
let cardsWrapper = document.getElementById("cards_wrapper");
let currentOffset = 0;
const limitLoadingPokemon = 650;
let currIndex = 1;

async function init() {
  await getAllPokemonNames();
  renderPokemonCards(0, limitLoadingPokemon);
}

async function getAllPokemonNames() {
  let pokemonNamesArray = await fetchPokemon(0, 1025);
  allPokemonNames = pokemonNamesArray.map((pokemon) => pokemon.name);
}

async function renderPokemonCards(start, end) {
  // showSpinner();
  if (pokemon.length < end) {
    const newPokemon = await fetchPokemon(start, end - start);
    pokemon.push(...newPokemon);
  }

  for (let i = start; i < end; i++) {
    pokemonDetails = await getPokemonDetails(i, pokemon[i].url);
    const card = createPokemonCard(i, pokemonDetails);
    cardsWrapper.appendChild(card);
  }
  // hideSpinner();
}

function createPokemonCard(i, pokemonDetails) {
  const card = document.createElement('div');
  card.onclick = openDetailCard;
  card.className = `cards_content bg_${pokemonDetails.types[0].type.name}`;
  card.id = `cards_content_${i}`;

  const pokemonId = ("000" + pokemonDetails.id).slice(-4);
  const pokemonName = pokemonDetails.name;
  const pokemonImage = pokemonDetails.sprites.other.dream_world.front_default;

  card.innerHTML = `
    <div class="pokemon_info" id="pokemon_info_${i}">
      <p class="pokemon_id" id="pokemon_id_${i}">#${pokemonId}</p>
      <h3 id="pokemon_name_${i}">${pokemonName}</h3>
      ${pokemonDetails.types.map((type, j) => `<p class="pokemon_type" id="type_${j}">${type.type.name}</p>`).join('')}
    </div>
    <img src="assets/img/pokeball.svg" alt="Pokeball" class="pokeball-background">
    <img src="${pokemonImage}" alt="${pokemonName}" class="pokemon_image" id="pokemon_image_${i}">
  `;

  return card;
}

function loadMorePokemon() {
  currentOffset += limitLoadingPokemon;
  renderPokemonCards(currentOffset, currentOffset + limitLoadingPokemon);
}

async function fetchPokemon(offset, limit) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    const responseAsJson = await response.json();
    return responseAsJson.results;
  } catch (error) {
    console.error("Error while loading Pokémon API", error);
  }
}

async function fetchPokemonDetails(i, url) {
  const response = await fetch(url);
  return await response.json();
}

// Pokemon Names Search Field
function searchPokemon() {
  const input = document.getElementById("search_input").value.toLowerCase();

  if (2 >= input.length) {
    cardsWrapper.innerHTML = ""; 
    renderPokemonCards(0, limitLoadingPokemon);
    return;
  }
  const filteredPokemon = allPokemonNames.filter(name => 
    name.toLowerCase().includes(input)
  );
  renderFilteredPokemonCards(filteredPokemon);
}

async function renderFilteredPokemonCards(filteredPokemon) {
  cardsWrapper.innerHTML = "";
  for (let i = 0; i < filteredPokemon.length; i++) {
    const pokemonName = filteredPokemon[i];
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    pokemonDetails = await getPokemonDetails(i, pokemonUrl)
    const card = createPokemonCard(i, pokemonDetails);
    cardsWrapper.appendChild(card);
  }
}

async function getPokemonDetails(i, pokemonUrl) {
  pokemonDetails = await fetchPokemonDetails(i, pokemonUrl);
  return pokemonDetails;
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
