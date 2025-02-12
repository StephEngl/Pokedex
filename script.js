let searchTimeout = [];
let pokemonCache = [];
let cardsWrapper = document.getElementById("cards_wrapper");
let currentOffset = 0;
const limitLoadingPokemon = 20;
let myChart = null;
const ctx = document.getElementById("myChart");

async function init() {
  // Registriere das benutzerdefinierte Plugin
  Chart.register({
    id: "customBackgroundPlugin",
    beforeDraw(chart) {
      const ctx = chart.ctx;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.5)"; // Hintergrundfarbe (z.B. halbtransparentes Weiß)
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
    const imageLoadPromises = [];

    for (const pokemon of newPokemon) {
      const pokemonDetails = await getPokemonDetails(pokemon.url);
      const card = createPokemonCard(pokemonDetails, pokemon.url);
      cardsWrapper.appendChild(card);
      const imgElement = card.querySelector("img");
      if (imgElement) {
        imageLoadPromises.push(loadImage(imgElement.src));
      }
    }
    // Warten, bis alle Bilder geladen sind
    await Promise.all(imageLoadPromises);
    pokemonCache = cardsWrapper.innerHTML;
  } catch (error) {
    console.warn("Error rendering Pokemon cards:", error);
  } finally {
    hideSpinner();
  }
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
  const card = document.createElement("div");

  card.setAttribute("onclick", `openDetailCard(${pokemonId}, "${pokemonUrl}")`);
  card.className = `cards_content bg_${pokemonType_1}`;
  card.id = `cards_content_${pokemonId}`;

  card.innerHTML = getPokemonCardTemplate(
    pokemonId,
    formattedPokemonId,
    pokemonName,
    pokemonImage,
    pokemonDetails.types
  );
  // Lade das Bild und wechsle die Klassen
  const img = card.querySelector(`#pokemon_image_${pokemonId}`);
  const loadingHint = card.querySelector(`#loading_hint_${pokemonId}`);

  img.onload = () => {
    loadingHint.classList.add("d_none");
    img.classList.remove("d_none");
  };
  return card;
}

// Show Dialog -> DetailCard
function openDetailCard(pokemonId, pokemonUrl) {
  document.body.classList.add("overflow_hidden");
  let refOverlay = document.getElementById("overlay");
  refOverlay.showModal();
  renderDetailCard(pokemonId, pokemonUrl);
}

function onMouseDown(event) {
  const dialog = document.getElementById("overlay");
  if (event.target === dialog) {
    document.body.classList.remove("overflow_hidden");
    dialog.close();
  }
}

async function renderDetailCard(pokemonId, pokemonUrl) {
  try {
    let pokemonDetail = await fetchPokemonDetails(pokemonUrl);
    const pokemonType = pokemonDetail.types[0].type.name;
    document.getElementById("detail_card").classList = "";
    document.getElementById("detail_card").classList.add("detail_card", `bg_${pokemonType}`);
    renderDetailCardHead(pokemonType, pokemonDetail, pokemonId);
    renderDetailCardBody(pokemonDetail, pokemonType);
  } catch (error) {
    console.error("Fehler beim Rendern der Detailkarte:", error);
  }
}

function renderDetailCardHead(pokemonType, pokemonDetail, pokemonId) {
  const pokemonName = getPokemonName(pokemonDetail);
  const pokemonCry = pokemonDetail.cries.latest;
  const imgUrl = pokemonDetail.sprites.other["official-artwork"].front_default;
  document.getElementById("detail_card").innerHTML = getDetailCardHeadTemplate(
    pokemonType,
    pokemonName,
    pokemonId,
    pokemonCry,
    imgUrl
  );
}

function getPokemonName(pokemonDetail) {
  const pokemonName =
    pokemonDetail.name.charAt(0).toUpperCase() + pokemonDetail.name.slice(1);
  return pokemonName;
}

async function playPokemonCry(audioUrl) {
  try {
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("Fehler beim Abspielen des Pokémon-Schreis:", error);
  }
}

async function renderDetailCardBody(pokemonDetail, pokemonType) {
  const heightInCentimeters = getHeightInCentimeter(pokemonDetail);
  const weightInKilograms = getWeightInKilograms(pokemonDetail);
  const generationUrl = await getGenerationUrl(pokemonDetail);
  const regionName = await getRegionName(generationUrl);
  const generationNumber = await getGeneration(generationUrl);
  const shinyImage = pokemonDetail.sprites.other["official-artwork"].front_shiny;

  // getStatsFromAPI(pokemonType, pokemonDetail);
  document.getElementById("detail_card").innerHTML += getDetailCardBodyTemplate(
    heightInCentimeters,
    weightInKilograms,
    regionName,
    generationNumber,
    shinyImage,
    pokemonDetail.types
  );
}

// Get Generation
async function getGenerationUrl(pokemonDetail) {
  const pokemonSpeciesUrl = pokemonDetail.species.url;
  const generation = await fetchPokemonGenerationUrl(pokemonSpeciesUrl);
  return generation.url;
}

async function fetchPokemonGenerationUrl(pokemonSpeciesUrl) {
  const response = await fetch(pokemonSpeciesUrl);
  const data = await response.json();
  return data.generation;
}

async function getGeneration(generationUrl) {
  const generationNumber = await fetchPokemonGeneration(generationUrl);
  return generationNumber;
}

async function fetchPokemonGeneration(generationUrl) {
  const response = await fetch(generationUrl);
  const data = await response.json();
  return data.id;
}

// Get Region Name
async function getRegionName(generationUrl) {
  const regionName = await fetchPokemonRegionName(generationUrl);
  return regionName;
}

async function fetchPokemonRegionName(generationUrl) {
  const response = await fetch(generationUrl);
  const data = await response.json();
  return data.main_region.name;
}

//  Get Height
function getHeightInCentimeter(pokemonDetail) {
  const heightInCentimeters = (pokemonDetail.height * 10).toFixed(0);
  return heightInCentimeters;
}

// Get Weight
function getWeightInKilograms(pokemonDetail) {
  const weightInKilograms = (pokemonDetail.weight / 10)
    .toFixed(1)
    .replace(".", ",");
  return weightInKilograms;
}

// Get Stats from API
function getStatsFromAPI(pokemonType, pokemonDetail) {
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

// Navigate in Detail Card
async function getPreviousDetailCard(pokemonId) {
  let newIndex = pokemonId - 1;
  if (newIndex < 1) newIndex = 1025; // Zurück zum letzten Pokémon

  const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${newIndex}/`;
  await renderDetailCard(newIndex, pokemonUrl);
}

async function getNextDetailCard(pokemonId) {
  let newIndex = pokemonId + 1;
  if (newIndex > 1025) newIndex = 1; // Zurück zum ersten Pokémon

  const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${newIndex}/`;
  await renderDetailCard(newIndex, pokemonUrl);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function showCardContent(sectionId, sliderId) {
  detailCardHideSections(sectionId);
  detailCardHighlightActiveTab(sliderId);
}

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

function loadMorePokemon() {
  currentOffset += limitLoadingPokemon;
  const limit = currentOffset + limitLoadingPokemon;
  renderPokemonCards(currentOffset, limit);
}

// Pokemon Names Search Field
async function searchPokemon() {
  const input = document.getElementById("search_input").value.toLowerCase();
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (input.length < 3) {
    cardsWrapper.innerHTML = pokemonCache;
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=1025`
      );
      const data = await response.json();
      const filteredPokemon = data.results.filter((pokemon) =>
        pokemon.name.toLowerCase().startsWith(input)
      );

      await renderFilteredPokemonCards(filteredPokemon);
    } catch (error) {
      console.error("Fehler bei der Pokémon-Suche:", error);
    }
  }, 300); // 300ms Verzögerung
}

async function renderFilteredPokemonCards(filteredPokemon) {
  cardsWrapper.innerHTML = "";
  for (let i = 0; i < filteredPokemon.length; i++) {
    const pokemonData = filteredPokemon[i];
    const pokemonUrl = pokemonData.url;

    try {
      const pokemonDetails = await getPokemonDetails(pokemonUrl);
      const card = createPokemonCard(pokemonDetails, pokemonUrl);
      cardsWrapper.appendChild(card);
    } catch (error) {
      console.warn(
        `Fehler beim Laden der Details für ${pokemonData.name}:`,
        error
      );
    }
  }
}

// Loading Spinner
function showSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "flex";
}

function hideSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "none";
}

// Radar Chart for stats
function createRadarChart(pokemonType, statValues) {
  const ctx = document.getElementById("myChart").getContext("2d");

  // Bestehendes Chart zerstören, falls vorhanden
  if (myChart) {
    myChart.destroy();
  }
  // Bestimme die Hintergrundfarbe basierend auf dem Pokémon-Typ
  const backgroundColor = getComputedStyle(
    document.querySelector(`.bg_${pokemonType}`)
  ).backgroundColor;

  // Erstelle eine semi-transparente Version der Farbe für das Dataset
  const rgbaColor = backgroundColor
    .replace("rgb", "rgba")
    .replace(")", ", 0.4)");

  // Neues Chart erstellen und in der globalen Variable speichern
  myChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["KP", "ANG", "VER", "SP-ANG", "SP-VER", "INIT"],
      datasets: [
        {
          label: "Statuswerte",
          data: statValues,
          borderWidth: 1,
          backgroundColor: rgbaColor,
          borderColor: backgroundColor,
          pointBackgroundColor: backgroundColor,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: backgroundColor,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false, // Blendet die Legende aus
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            stepSize: 20,
          },
        },
      },
    },
  });
}

function extractStats(pokemonDetails) {
  return pokemonDetails.stats.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});
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
