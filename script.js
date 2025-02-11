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
    console.error("Error rendering Pokemon cards:", error);
  } finally {
    hideSpinner();
  }
}

function createPokemonCard(pokemonDetails, pokemonUrl) {
  const card = document.createElement("div");
  const pokemonId = pokemonDetails.id;
  card.setAttribute("onclick", `openDetailCard(${pokemonId}, "${pokemonUrl}")`);
  card.className = `cards_content bg_${pokemonDetails.types[0].type.name}`;
  card.id = `cards_content_${pokemonId}`;

  const formattedPokemonId = ("000" + pokemonId).slice(-4);
  const pokemonName = pokemonDetails.name;
  const pokemonImage = pokemonDetails.sprites.other.home.front_default;

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

    setClassBackgroundColor(pokemonType);
    await getGenerationAndRegion(pokemonDetail);
    getStatsFromAPI(pokemonType, pokemonDetail);
    setPokemonIdAndName(pokemonDetail);
    getHeightAndWeightFromApi(pokemonDetail);

    setDetailCardImage(
      pokemonDetail.sprites.other["official-artwork"].front_default
    );
    setShinyImage(pokemonDetail.sprites.other["official-artwork"].front_shiny);
    setButtonAttributes(pokemonDetail.id);

    const cryButton = document.getElementById("pokemon_cry");
    cryButton.setAttribute(
      "onclick",
      `playPokemonCry('${pokemonDetail.cries.latest}')`
    );
  } catch (error) {
    console.error("Fehler beim Rendern der Detailkarte:", error);
  }
}

function setClassBackgroundColor(pokemonType) {
  document.getElementById(
    "detail_card"
  ).className = `detail_card bg_${pokemonType}`;
}

async function getGenerationAndRegion(pokemonDetail) {
  const pokemonSpeciesUrl = pokemonDetail.species.url;
  const generationName = await fetchPokemonGeneration(pokemonSpeciesUrl);
  const romanNumber = generationName.replace("generation-", "");
  const generationNumber = romanToNumber(romanNumber);
  document.getElementById("pokemon_generation").textContent =
    generationNumber !== null ? generationNumber : "?";
  const generationUrl = `https://pokeapi.co/api/v2/generation/${generationNumber}/`;
  const regionName = await fetchPokemonRegionName(generationUrl);
  document.getElementById("pokemon_region").textContent = regionName;
}

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

function getHeightAndWeightFromApi(pokemonDetail) {
  const heightInCentimeters = (pokemonDetail.height * 10).toFixed(0);
  const weightInKilograms = (pokemonDetail.weight / 10)
    .toFixed(1)
    .replace(".", ",");

  document.getElementById(
    "pokemon_height"
  ).textContent = `${heightInCentimeters} cm`;
  document.getElementById(
    "pokemon_weight"
  ).textContent = `${weightInKilograms} kg`;
}

function setDetailCardImage(imageUrl) {
  const imgElement = document.getElementById("detail_card_pokemon_image");
  const loadingHint = document.getElementById("loading_hint");

  imgElement.classList.add("d_none");
  loadingHint.classList.remove("d_none");

  imgElement.onload = function () {
    loadingHint.classList.add("d_none");
    imgElement.classList.remove("d_none");
  };

  imgElement.src = imageUrl;
}

function setShinyImage(shinyImageUrl) {
  const shinyImage = document.getElementById("shiny_image");
  shinyImage.src = shinyImageUrl;
}

function setPokemonIdAndName(pokemonDetail) {
  const pokemonId = ("000" + pokemonDetail.id).slice(-4);
  document.getElementById("detail_card_pokemon_id").innerHTML = `#${pokemonId}`;

  document.getElementById("detail_card_name").innerHTML =
    pokemonDetail.name.charAt(0).toUpperCase() + pokemonDetail.name.slice(1);
  document.getElementById("detail_card_types").innerHTML = getTypesTemplate(
    pokemonDetail.types
  );
}

async function playPokemonCry(audioUrl) {
  try {
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("Fehler beim Abspielen des Pokémon-Schreis:", error);
  }
}

function setButtonAttributes(pokemonId) {
  document
    .getElementById("btn_left")
    .setAttribute("onclick", `getPreviousDetailCard(${pokemonId})`);
  document
    .getElementById("btn_right")
    .setAttribute("onclick", `getNextDetailCard(${pokemonId})`);
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

// Event Delegation for selection in Detail-Card-Details
document.querySelector(".details_slider").addEventListener("click", (event) => {
  const target = event.target;

  // Prüfen, ob ein Tab angeklickt wurde
  if (target.tagName === "P" && target.dataset.target) {
    const sectionId = target.dataset.target;

    // Alle Abschnitte ausblenden, außer den slider
    const sections = document.querySelectorAll(
      ".detail_card_details_container > div:not(.details_slider)"
    );
    sections.forEach((section) => section.classList.add("d_none"));

    // Gewünschten Abschnitt anzeigen
    document.getElementById(sectionId).classList.remove("d_none");

    // Aktiven Tab hervorheben
    const tabs = document.querySelectorAll(".details_slider > p");
    tabs.forEach((tab) => tab.classList.remove("active"));
    target.classList.add("active");
  }
});

function loadMorePokemon() {
  currentOffset += limitLoadingPokemon;
  const limit = currentOffset + limitLoadingPokemon;
  renderPokemonCards(currentOffset, limit);
}

async function fetchPokemon(offset, limit) {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    const responseAsJson = await response.json();
    return responseAsJson.results;
}

async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  return await response.json();
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

async function getPokemonDetails(pokemonUrl) {
  const pokemonDetails = await fetchPokemonDetails(pokemonUrl);
  return pokemonDetails;
}

// Loading Spinner
function showSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "flex";
}

function hideSpinner() {
  document.getElementById("loading_spinner_overlay").style.display = "none";
}

// Set Background Color Type-Badge
function setBackgroundColor(iconElement, containerElement) {
  const img = new Image();
  img.src = iconElement.src;
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const pixelData = ctx.getImageData(0, 0, 1, 1).data;
    const backgroundColor = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, 0.3)`;
    containerElement.style.backgroundColor = backgroundColor;
  };
}

// Get Generation
async function fetchPokemonGeneration(pokemonSpeciesUrl) {
  const response = await fetch(pokemonSpeciesUrl);
  const data = await response.json();
  return data.generation.name; // Gibt z.B. "generation-i" zurück
}

function romanToNumber(roman) {
  switch (roman) {
    case "i":
      return 1;
    case "ii":
      return 2;
    case "iii":
      return 3;
    case "iv":
      return 4;
    case "v":
      return 5;
    case "vi":
      return 6;
    case "vii":
      return 7;
    case "viii":
      return 8;
    case "ix":
      return 9;
    default:
      return null; // Oder eine andere Fehlerbehandlung
  }
}

// Get Region
async function fetchPokemonRegionName(generationUrl) {
  const response = await fetch(generationUrl);
  const data = await response.json();
  return data.main_region.name;
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
