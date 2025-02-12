/** @type {Array} Array to store search timeout IDs */
let searchTimeout = [];

/** @type {Array} Array to cache Pokemon data */
let pokemonCache = [];

/** @type {HTMLElement} Reference to the cards wrapper element */
let cardsWrapper = document.getElementById("cards_wrapper");

/** @type {number} Current offset for Pokemon loading */
let currentOffset = 0;

/** @type {number} Limit for the number of Pokemon to load at once */
const limitLoadingPokemon = 20;

/** @type {Chart|null} Reference to the radar chart instance */
let myRadarChart = null;

/**
 * Initializes the application.
 * Registers a custom plugin for the radar chart and renders initial Pokemon cards.
 * @returns {Promise<void>}
 */
async function init() {
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

/**
 * Renders Pokemon cards.
 * @param {number} offset - The offset for fetching Pokemon.
 * @param {number} limit - The limit of Pokemon to fetch.
 * @returns {Promise<void>}
 */
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

/**
 * Creates Pokemon cards from a list of Pokemon.
 * @param {Array} pokemonList - List of Pokemon to create cards for.
 * @returns {Promise<Array>} Array of created Pokemon card elements.
 */
async function createPokemonCards(pokemonList) {
  return Promise.all(pokemonList.map(async (pokemon) => {
    const pokemonDetails = await getPokemonDetails(pokemon.url);
    return createPokemonCard(pokemonDetails, pokemon.url);
  }));
}

/**
 * Appends cards to the cards wrapper.
 * @param {Array} cards - Array of card elements to append.
 */
function appendCardsToWrapper(cards) {
  cards.forEach(card => cardsWrapper.appendChild(card));
}

/**
 * Loads all card images.
 * @param {Array} cards - Array of card elements.
 * @returns {Promise<void>}
 */
async function loadAllCardImages(cards) {
  const imagePromises = cards.map(card => {
    const img = card.querySelector('img');
    return img ? loadImage(img.src) : Promise.resolve();
  });
  await Promise.all(imagePromises);
}

/**
 * Updates the Pokemon cache with current cards wrapper content.
 */
function updatePokemonCache() {
  pokemonCache = cardsWrapper.innerHTML;
}

/**
 * Fetches Pokemon data from the API.
 * @param {number} offset - The offset for fetching Pokemon.
 * @param {number} limit - The limit of Pokemon to fetch.
 * @returns {Promise<Array>} Array of fetched Pokemon data.
 */
async function fetchPokemon(offset, limit) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  const responseAsJson = await response.json();
  return responseAsJson.results;
}

/**
 * Gets detailed Pokemon information.
 * @param {string} pokemonUrl - URL to fetch Pokemon details.
 * @returns {Promise<Object>} Detailed Pokemon data.
 */
async function getPokemonDetails(pokemonUrl) {
  const pokemonDetails = await fetchPokemonDetails(pokemonUrl);
  return pokemonDetails;
}

/**
 * Fetches detailed Pokemon information from the API.
 * @param {string} url - URL to fetch Pokemon details.
 * @returns {Promise<Object>} Detailed Pokemon data.
 */
async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  return await response.json();
}

/**
 * Creates a Pokemon card element.
 * @param {Object} pokemonDetails - Detailed Pokemon data.
 * @param {string} pokemonUrl - URL of the Pokemon data.
 * @returns {HTMLElement} Created Pokemon card element.
 */
function createPokemonCard(pokemonDetails, pokemonUrl) {
  const pokemonId = pokemonDetails.id;
  const pokemonType_1 = pokemonDetails.types[0].type.name;
  const formattedPokemonId = ("000" + pokemonId).slice(-4);
  const pokemonName = pokemon_names_german[pokemonId - 1] || pokemonDetails.name;
  const pokemonImage = pokemonDetails.sprites.other.home.front_default;

  const card = createCardElement(pokemonId, pokemonType_1, pokemonUrl);
    card.innerHTML = getPokemonCardTemplate(pokemonId, formattedPokemonId,
    pokemonName, pokemonImage, pokemonDetails.types);

  setupImageLoading(card, pokemonId);
  return card;
}

/**
 * Creates a card element for a Pokemon to open Detail Card.
 * @param {number} pokemonId - ID of the Pokemon.
 * @param {string} pokemonType_1 - Primary type of the Pokemon.
 * @param {string} pokemonUrl - URL of the Pokemon data.
 * @returns {HTMLElement} Created card element.
 */
function createCardElement(pokemonId, pokemonType_1, pokemonUrl) {
  const card = document.createElement("div");
  card.setAttribute("onclick", `openDetailCard(${pokemonId}, "${pokemonUrl}")`);
  card.className = `cards_content bg_${pokemonType_1}`;
  card.id = `cards_content_${pokemonId}`;
  return card;
}

/**
 * Sets up image loading for a Pokemon card.
 * @param {HTMLElement} card - The card element.
 * @param {number} pokemonId - ID of the Pokemon.
 */
function setupImageLoading(card, pokemonId) {
  const img = card.querySelector(`#pokemon_image_${pokemonId}`);
  const loadingHint = card.querySelector(`#loading_hint_${pokemonId}`);
  img.onload = () => {
    loadingHint.classList.add("d_none");
    img.classList.remove("d_none");
  };
}

/**
 * Appends a Pokemon card to the cards wrapper.
 * @param {Object} pokemonDetails - Detailed Pokemon data.
 * @param {string} pokemonUrl - URL of the Pokemon data.
 */
function appendPokemonCard(pokemonDetails, pokemonUrl) {
  const card = createPokemonCard(pokemonDetails, pokemonUrl);
  cardsWrapper.appendChild(card);
}

/**
 * Loads more Pokemon cards.
 */
function loadMorePokemon() {
  currentOffset += limitLoadingPokemon;
  const limit = currentOffset + limitLoadingPokemon;
  renderPokemonCards(currentOffset, limitLoadingPokemon);
}

/**
 * Hides the "Load More" button.
 */
function hideLoadMoreButton() {
  document.getElementById("load_more_button").style.display = "none";
}

// /**
//  * Handles Pokemon search functionality.
//  * @returns {Promise<void>}
//  */
// async function searchPokemon() {
//   const input = document.getElementById("search_input").value.toLowerCase();
//   if (searchTimeout) clearTimeout(searchTimeout);
//   if (input.length < 3) {
//     resetToCachedPokemon();
//     return;
//   }

//   searchTimeout = setTimeout(async () => {
//     try {
//       const filteredPokemon = await fetchFilteredPokemon(input);
//       await renderFilteredPokemonCards(filteredPokemon);
//     } catch (error) {
//       console.error("Fehler bei der Pokémon-Suche:", error);
//     }
//   }, 300); // 300ms time delay
// }

/**
 * Handles Pokemon search functionality.
 * @returns {Promise<void>}
 */
async function searchPokemon() {
  const input = document.getElementById("search_input").value.toLowerCase();
  if (input.length < 3) {
    clearTimeout(searchTimeout);
    resetToCachedPokemon();
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const filteredPokemon = await searchGermanPokemon(input);
      updateCardsWrapper(filteredPokemon);
    } catch (error) {
      handleSearchError(error);
    } finally {
      hideLoadMoreButton();
    }
  }, 300);
}

/**
 * Searches for Pokemon based on the German name.
 * @param {string} input - The search input.
 * @returns {Promise<Array>} - Array of found pokemon
 */
async function searchGermanPokemon(input) {
  if (!pokemon_names_german) return [];

  const germanMatches = pokemon_names_german.filter(name =>
    name.toLowerCase().startsWith(input)
  );

  if (germanMatches.length === 0) return [];

  const pokemonIds = germanMatches.map(name => pokemon_names_german.indexOf(name) + 1);

  return await Promise.all(
    pokemonIds.map(async pokemonId => {
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`;
      return await getPokemonDetails(pokemonUrl);
    })
  );
}

/**
 * Updates the cards wrapper with the given Pokemon data.
 * @param {Array} filteredPokemon - The filtered Pokemon data.
 */
function updateCardsWrapper(filteredPokemon) {
  cardsWrapper.innerHTML = ""; // Clear previous results
  if (filteredPokemon.length > 0) {
    filteredPokemon.forEach(pokemon => {
      appendPokemonCard(pokemon, `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`);
    });
  } else {
    cardsWrapper.innerHTML = "<p>Kein Pokémon mit diesem Namen gefunden.</p>";
  }
}

/**
 * Handles errors that occur during the search.
 * @param {Error} error - The error object.
 */
function handleSearchError(error) {
  console.error("Fehler bei der Pokémon-Suche:", error);
  cardsWrapper.innerHTML = "<p>Fehler bei der Suche.</p>";
}

/**
 * Resets the display to cached Pokemon data.
 */
function resetToCachedPokemon() {
  cardsWrapper.innerHTML = pokemonCache;
  document.getElementById("load_more_button").style.display = "block";
}

/**
 * Fetches filtered Pokemon based on search input.
 * @param {string} input - Search input string.
 * @returns {Promise<Array>} Filtered Pokemon data.
 */
async function fetchFilteredPokemon(input) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
  const data = await response.json();
  return data.results.filter((pokemon) =>
    pokemon.name.toLowerCase().startsWith(input)
  );
}

/**
 * Renders filtered Pokemon cards.
 * @param {Array} filteredPokemon - Array of filtered Pokemon data.
 * @returns {Promise<void>}
 */
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

/**
 * Shows the loading spinner.
 */
function showSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "flex";
}

/**
 * Hides the loading spinner.
 */
function hideSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "none";
}

/**
 * Translates Pokemon types from English to German.
 * @param {string} englishType - The English name of the Pokemon type.
 * @returns {string} The German translation of the Pokemon type.
 */
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
