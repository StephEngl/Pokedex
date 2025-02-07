let pokemon = [];
let allPokemonNames = [];
let pokemonDetails = [];
let cardsWrapper = document.getElementById("cards_wrapper");
let currentOffset = 0;
const limitLoadingPokemon = 20;
let currIndex = 0;

async function init() {
  await getAllPokemonNames();
  renderPokemonCards(0, limitLoadingPokemon);
}

async function getAllPokemonNames() {
  let pokemonNamesArray = await fetchPokemon(0, 1025);
  allPokemonNames = pokemonNamesArray.map((pokemon) => pokemon.name);
}

async function renderPokemonCards(start, end) {
  showSpinner();
  try {
    if (pokemon.length < end) {
      const newPokemon = await fetchPokemon(start, end - start);
      pokemon.push(...newPokemon);
    }
    const imageLoadPromises = [];

    for (let i = start; i < end; i++) {
      pokemonDetails = await getPokemonDetails(i, pokemon[i].url);
      const card = createPokemonCard(i, pokemonDetails);
      cardsWrapper.appendChild(card);

      const imgElement = card.querySelector("img");
      if (imgElement) {
        imageLoadPromises.push(loadImage(imgElement.src));
      }
    }
    // Warten, bis alle Bilder geladen sind
    await Promise.all(imageLoadPromises);
  } catch (error) {
    console.error("Error rendering Pokemon cards:", error);
  } finally {
    hideSpinner();
  }
}

function createPokemonCard(i, pokemonDetails) {
  const card = document.createElement("div");
  card.setAttribute('onclick', `openDetailCard(${i})`);
  // card.onclick = `openDetailCard(${i})`;
  card.className = `cards_content bg_${pokemonDetails.types[0].type.name}`;
  card.id = `cards_content_${i}`;

  const pokemonId = ("000" + pokemonDetails.id).slice(-4);
  const pokemonName = pokemonDetails.name;
  const pokemonImage = pokemonDetails.sprites.other.home.front_default;

  card.innerHTML = getPokemonCardTemplate(
    i,
    pokemonId,
    pokemonName,
    pokemonImage,
    pokemonDetails.types
  );

  return card;
}

function renderDetailCard(currIndex) {
  document.getElementById("detail_card_pokemon_id").innerHTML =
    document.getElementById("pokemon_id_" + [currIndex]).innerHTML;
  document.getElementById("detail_card_name").innerHTML =
    document.getElementById("pokemon_name_" + [currIndex]).innerHTML;
  document.getElementById("detail_card_types").innerHTML = getTypesTemplate(pokemonDetails.types);
  document.getElementById("detail_card_pokemon_image").src = document.getElementById("pokemon_image_" + [currIndex]).src;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
  const filteredPokemon = allPokemonNames.filter((name) =>
    name.toLowerCase().includes(input)
  );
  renderFilteredPokemonCards(filteredPokemon);
}

async function renderFilteredPokemonCards(filteredPokemon) {
  cardsWrapper.innerHTML = "";
  for (let i = 0; i < filteredPokemon.length; i++) {
    const pokemonName = filteredPokemon[i];
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    pokemonDetails = await getPokemonDetails(i, pokemonUrl);
    const card = createPokemonCard(i, pokemonDetails);
    cardsWrapper.appendChild(card);
  }
}

async function getPokemonDetails(i, pokemonUrl) {
  pokemonDetails = await fetchPokemonDetails(i, pokemonUrl);
  return pokemonDetails;
}

// Show Dialog -> DetailCard
function openDetailCard(currIndex) {
  document.body.classList.add("overflow_hidden");
  let refOverlay = document.getElementById("overlay");
  refOverlay.showModal();
  renderDetailCard(currIndex);
}

function onMouseDown(event) {
  document.body.classList.remove("overflow_hidden");
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

// Loading Spinner
function showSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "flex";
}

function hideSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "none";
}
