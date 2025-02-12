/**
 * Opens the detail card for a Pokémon.
 * @param {number} pokemonId - The ID of the Pokémon.
 * @param {string} pokemonUrl - The URL for the Pokémon details.
 */
function openDetailCard(pokemonId, pokemonUrl) {
  document.body.classList.add("overflow_hidden");
  let refOverlay = document.getElementById("overlay");
  refOverlay.showModal();
  renderDetailCard(pokemonId, pokemonUrl);
}

/**
 * Handles the mouse click event to close the dialog by clicking on the backdrop.
 * @param {MouseEvent} event - The mouse click event.
 */
function onMouseDown(event) {
  const dialog = document.getElementById("overlay");
  if (event.target === dialog) {
    document.body.classList.remove("overflow_hidden");
    dialog.close();
  }
}

/**
 * Renders the detail card for a Pokémon.
 * @param {number} pokemonId - The ID of the Pokémon.
 * @param {string} pokemonUrl - The URL for the Pokémon details.
 * @returns {Promise<void>}
 */
async function renderDetailCard(pokemonId, pokemonUrl) {
  try {
    let pokemonDetail = await fetchPokemonDetails(pokemonUrl);
    const pokemonType = pokemonDetail.types[0].type.name;
    document.getElementById("detail_card").classList = "";
    document
      .getElementById("detail_card")
      .classList.add("detail_card", `bg_${pokemonType}`);
    renderDetailCardHead(pokemonDetail, pokemonId);
    renderDetailCardBody(pokemonDetail, pokemonType);
  } catch (error) {
    console.error("Fehler beim Rendern der Detailkarte:", error);
  }
}

/**
 * Renders the head section of the detail card.
 * @param {Object} pokemonDetail - The details of the Pokémon.
 * @param {number} pokemonId - The ID of the Pokémon.
 */
function renderDetailCardHead(pokemonDetail, pokemonId) {
  const pokemonName = getPokemonName(pokemonDetail.id, pokemonDetail.name);
  const pokemonCry = pokemonDetail.cries.latest;
  const imgUrl = pokemonDetail.sprites.other["official-artwork"].front_default;
  document.getElementById("detail_card").innerHTML = getDetailCardHeadTemplate(
    pokemonName,
    pokemonId,
    pokemonCry,
    imgUrl
  );
}

/**
 * Gets the German name of the Pokémon.
 * @param {number} pokemonId - The ID of the Pokémon.
 * @param {string} englishName - The English name of the Pokémon.
 * @returns {string} The German name of the Pokémon.
 */
function getPokemonName(pokemonId, englishName) {
  return pokemon_names_german[pokemonId - 1] || englishName;
}

/**
 * Plays the cry of the Pokémon.
 * @param {string} audioUrl - The URL of the audio file.
 * @returns {Promise<void>}
 */
async function playPokemonCry(audioUrl) {
  try {
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("Fehler beim Abspielen des Pokémon-Schreis:", error);
  }
}

/**
 * Renders the body section of the detail card.
 * @param {Object} pokemonDetail - The details of the Pokémon.
 * @param {string} pokemonType - The type of the Pokémon.
 * @returns {Promise<void>}
 */
async function renderDetailCardBody(pokemonDetail, pokemonType) {
  const heightInCentimeters = getHeightInCentimeter(pokemonDetail);
  const weightInKilograms = getWeightInKilograms(pokemonDetail);
  const generationUrl = await getGenerationUrl(pokemonDetail);
  const regionName = await getRegionName(generationUrl);
  const generationNumber = await getGeneration(generationUrl);
  const shinyImage =
    pokemonDetail.sprites.other["official-artwork"].front_shiny;

  document.getElementById("detail_card").innerHTML += getDetailCardBodyTemplate(
    heightInCentimeters,
    weightInKilograms,
    regionName,
    generationNumber,
    shinyImage,
    pokemonDetail.types
  );
  createRadarChartWithStatsFromAPI(pokemonType, pokemonDetail);
}

/**
 * Gets the generation URL for a Pokémon.
 * @param {Object} pokemonDetail - The details of the Pokémon.
 * @returns {Promise<string>} The generation URL.
 */
async function getGenerationUrl(pokemonDetail) {
  const pokemonSpeciesUrl = pokemonDetail.species.url;
  const generation = await fetchPokemonGenerationUrl(pokemonSpeciesUrl);
  return generation.url;
}

/**
 * Fetches the generation URL for a Pokémon.
 * @param {string} pokemonSpeciesUrl - The URL of the Pokémon species.
 * @returns {Promise<Object>} The generation object.
 */
async function fetchPokemonGenerationUrl(pokemonSpeciesUrl) {
  const response = await fetch(pokemonSpeciesUrl);
  const data = await response.json();
  return data.generation;
}

/**
 * Gets the generation number for a Pokémon.
 * @param {string} generationUrl - The generation URL.
 * @returns {Promise<number>} The generation number.
 */
async function getGeneration(generationUrl) {
  const generationNumber = await fetchPokemonGeneration(generationUrl);
  return generationNumber;
}

/**
 * Fetches the generation number for a Pokémon.
 * @param {string} generationUrl - The generation URL.
 * @returns {Promise<number>} The generation number.
 */
async function fetchPokemonGeneration(generationUrl) {
  const response = await fetch(generationUrl);
  const data = await response.json();
  return data.id;
}

/**
 * Gets the region name for a Pokémon.
 * @param {string} generationUrl - The generation URL.
 * @returns {Promise<string>} The region name.
 */
async function getRegionName(generationUrl) {
  const regionName = await fetchPokemonRegionName(generationUrl);
  return regionName;
}

/**
 * Fetches the region name for a Pokémon.
 * @param {string} generationUrl - The generation URL.
 * @returns {Promise<string>} The region name.
 */
async function fetchPokemonRegionName(generationUrl) {
  const response = await fetch(generationUrl);
  const data = await response.json();
  return data.main_region.name;
}

/**
 * Calculates the height of the Pokémon in centimeters.
 * @param {Object} pokemonDetail - The details of the Pokémon.
 * @returns {string} The height in centimeters.
 */
function getHeightInCentimeter(pokemonDetail) {
  const heightInCentimeters = (pokemonDetail.height * 10).toFixed(0);
  return heightInCentimeters;
}

/**
 * Calculates the weight of the Pokémon in kilograms.
 * @param {Object} pokemonDetail - The details of the Pokémon.
 * @returns {string} The weight in kilograms.
 */
function getWeightInKilograms(pokemonDetail) {
  const weightInKilograms = (pokemonDetail.weight / 10)
    .toFixed(1)
    .replace(".", ",");
  return weightInKilograms;
}

/**
 * Creates a radar chart with the Pokémon's stats.
 * @param {string} pokemonType - The type of the Pokémon.
 * @param {Object} pokemonDetail - The details of the Pokémon.
 */
function createRadarChartWithStatsFromAPI(pokemonType, pokemonDetail) {
  const stats = extractStats(pokemonDetail);

  createRadarChart(pokemonType, [
    stats.hp,
    stats.attack,
    stats.defense,
    stats["special-attack"],
    stats["special-defense"],
    stats.speed,
  ]);
}

/**
 * Extracts the stats from the Pokémon details.
 * @param {Object} pokemonDetails - The details of the Pokémon.
 * @returns {Object} An object with the extracted stats.
 */
function extractStats(pokemonDetails) {
  return pokemonDetails.stats.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});
}

/**
 * Creates a radar chart for the Pokémon stats.
 * @param {string} pokemonType - The type of the Pokémon.
 * @param {number[]} statValues - The stat values of the Pokémon.
 */
function createRadarChart(pokemonType, statValues) {
  const ctx = document.getElementById("myChart").getContext("2d");
  if (myRadarChart) myRadarChart.destroy();

  const rgbaColor = getRGBAColor(pokemonType);
  const backgroundColor = rgbaColor
    .replace(", 0.4)", ")")
    .replace("rgba", "rgb");

  myRadarChart = new Chart(
    ctx,
    getRadarChartConfig(statValues, rgbaColor, backgroundColor)
  );
}

/**
 * Gets the RGBA color for a Pokémon type.
 * @param {string} pokemonType - The type of the Pokémon.
 * @returns {string} The RGBA color.
 */
function getRGBAColor(pokemonType) {
  const backgroundColor = getComputedStyle(
    document.querySelector(`.bg_${pokemonType}`)
  ).backgroundColor;
  return backgroundColor.replace("rgb", "rgba").replace(")", ", 0.4)");
}

/**
 * Navigates to the previous detail card.
 * @param {number} pokemonId - The current Pokémon ID.
 * @returns {Promise<void>}
 */
async function getPreviousDetailCard(pokemonId) {
  let newIndex = pokemonId - 1;
  if (newIndex < 1) newIndex = 1025; // Zurück zum letzten Pokémon

  const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${newIndex}/`;
  await renderDetailCard(newIndex, pokemonUrl);
}

/**
 * Navigates to the next detail card.
 * @param {number} pokemonId - The current Pokémon ID.
 * @returns {Promise<void>}
 */
async function getNextDetailCard(pokemonId) {
  let newIndex = pokemonId + 1;
  if (newIndex > 1025) newIndex = 1; // Zurück zum ersten Pokémon

  const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${newIndex}/`;
  await renderDetailCard(newIndex, pokemonUrl);
}

/**
 * Loads an image asynchronously.
 * @param {string} src - The source URL of the image.
 * @returns {Promise<HTMLImageElement>} The loaded image element.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Shows the content of a specific section of the detail card.
 * @param {string} sectionId - The ID of the section to display.
 * @param {string} sliderId - The ID of the active slider.
 */
function showCardContent(sectionId, sliderId) {
  detailCardHideSections(sectionId);
  detailCardHighlightActiveTab(sliderId);
}

/**
 * Hides all sections of the detail card except the specified one.
 * @param {string} sectionId - The ID of the section to display.
 */
function detailCardHideSections(sectionId) {
  const sections = document.querySelectorAll(
    ".detail_card_details_container > div:not(.details_slider)"
  );
  sections.forEach((section) => {
    if (section.id === sectionId) {
      section.classList.remove("d_none");
    } else {
      section.classList.add("d_none");
    }
  });
}

/**
 * Highlights the active tab in the detail card.
 * @param {string} sliderId - The ID of the active slider.
 */
function detailCardHighlightActiveTab(sliderId) {
  const tabs = document.querySelectorAll(".details_slider > p");
  tabs.forEach((tab) => {
    if (tab.id === sliderId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
}
