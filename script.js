let searchTimeout = [];
let pokemonCache = [];
let cardsWrapper = document.getElementById("cards_wrapper");
let currentOffset = 0;
const limitLoadingPokemon = 20;
let myRadarChart = null;

async function init() {
  // register custom plugin for radar-chart
  Chart.register({
    id: "customBackgroundPlugin",
    beforeDraw(chart) {
      const ctx = chart.ctx;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(0, 0, chart.width, chart.height); // Füllt den gesamten Canvas-Bereich
      ctx.restore();
    },
  });
  await renderPokemonCards(0, limitLoadingPokemon);
}

async function renderPokemonCards(offset, limit) {
  showSpinner();
  try {
    const newPokemon = await fetchPokemon(offset, limit);
    const cards = await createPokemonCards(newPokemon);
    appendCardsToWrapper(cards);
    await loadAllCardImages(cards);
    updatePokemonCache();
  } catch (error) {
    console.warn("Error rendering Pokemon cards:", error);
  } finally {
    hideSpinner();
  }
}

async function createPokemonCards(pokemonList) {
  return Promise.all(pokemonList.map(async (pokemon) => {
    const pokemonDetails = await getPokemonDetails(pokemon.url);
    return createPokemonCard(pokemonDetails, pokemon.url);
  }));
}

function appendCardsToWrapper(cards) {
  cards.forEach(card => cardsWrapper.appendChild(card));
}

async function loadAllCardImages(cards) {
  const imagePromises = cards.map(card => {
    const img = card.querySelector('img');
    return img ? loadImage(img.src) : Promise.resolve();
  });
  await Promise.all(imagePromises);
}

function updatePokemonCache() {
  pokemonCache = cardsWrapper.innerHTML;
}

async function fetchPokemon(offset, limit) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  const responseAsJson = await response.json();
  return responseAsJson.results;
}

async function getPokemonDetails(pokemonUrl) {
  const pokemonDetails = await fetchPokemonDetails(pokemonUrl);
  return pokemonDetails;
}

async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  return await response.json();
}

function createPokemonCard(pokemonDetails, pokemonUrl) {
  const pokemonId = pokemonDetails.id;
  const pokemonType_1 = pokemonDetails.types[0].type.name;
  const formattedPokemonId = ("000" + pokemonId).slice(-4);
  const pokemonName = pokemonDetails.name;
  const pokemonImage = pokemonDetails.sprites.other.home.front_default;

  const card = createCardElement(pokemonId, pokemonType_1, pokemonUrl);
    card.innerHTML = getPokemonCardTemplate(pokemonId, formattedPokemonId,
    pokemonName, pokemonImage, pokemonDetails.types);

  setupImageLoading(card, pokemonId);
  return card;
}

function createCardElement(pokemonId, pokemonType_1, pokemonUrl) {
  const card = document.createElement("div");
  card.setAttribute("onclick", `openDetailCard(${pokemonId}, "${pokemonUrl}")`);
  card.className = `cards_content bg_${pokemonType_1}`;
  card.id = `cards_content_${pokemonId}`;
  return card;
}

function setupImageLoading(card, pokemonId) {
  const img = card.querySelector(`#pokemon_image_${pokemonId}`);
  const loadingHint = card.querySelector(`#loading_hint_${pokemonId}`);
  img.onload = () => {
    loadingHint.classList.add("d_none");
    img.classList.remove("d_none");
  };
}

function appendPokemonCard(pokemonDetails, pokemonUrl) {
  const card = createPokemonCard(pokemonDetails, pokemonUrl);
  cardsWrapper.appendChild(card);
}

// Loading Button
function loadMorePokemon() {
  currentOffset += limitLoadingPokemon;
  const limit = currentOffset + limitLoadingPokemon;
  renderPokemonCards(currentOffset, limitLoadingPokemon);
}

function hideLoadMoreButton() {
  document.getElementById("load_more_button").style.display = "none";
}

// Search Pokemon Names
async function searchPokemon() {
  const input = document.getElementById("search_input").value.toLowerCase();
  if (searchTimeout) clearTimeout(searchTimeout);
  if (input.length < 3) {
    resetToCachedPokemon();
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const filteredPokemon = await fetchFilteredPokemon(input);
      await renderFilteredPokemonCards(filteredPokemon);
    } catch (error) {
      console.error("Fehler bei der Pokémon-Suche:", error);
    }
  }, 300); // 300ms time delay
}

function resetToCachedPokemon() {
  cardsWrapper.innerHTML = pokemonCache;
  document.getElementById("load_more_button").style.display = "block";
}

async function fetchFilteredPokemon(input) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
  const data = await response.json();
  return data.results.filter((pokemon) =>
    pokemon.name.toLowerCase().startsWith(input)
  );
}

async function renderFilteredPokemonCards(filteredPokemon) {
  cardsWrapper.innerHTML = "";
  for (let i = 0; i < filteredPokemon.length; i++) {
    const pokemonData = filteredPokemon[i];
    const pokemonUrl = pokemonData.url;

    try {
      const pokemonDetails = await getPokemonDetails(pokemonUrl);
      appendPokemonCard(pokemonDetails, pokemonUrl);
    } catch (error) {
      console.warn(`Fehler beim Laden der Details für ${pokemonData.name}:`, error);
    }
  }
  hideLoadMoreButton();
}

// Loading Spinner
function showSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "flex";
}

function hideSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "none";
}

// Übersetzung
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
