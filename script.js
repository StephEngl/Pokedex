let pokemon = [];
let searchTimeout;
// let allPokemonNames = [];
let renderedPokemonStats = [];
let pokemonCache = [];
let pokemonDetails = [];
let cardsWrapper = document.getElementById("cards_wrapper");
let currentOffset = 0;
const limitLoadingPokemon = 20;
let currIndex = 0;
let myChart = null;
const ctx = document.getElementById("myChart");

async function init() {
  // await getAllPokemonNames();
  renderPokemonCards(0, limitLoadingPokemon);
}

// async function getAllPokemonNames() {
//   let pokemonNamesArray = await fetchPokemon(0, 1025);
//   allPokemonNames = pokemonNamesArray.map((pokemon) => pokemon.name);
// }

async function renderPokemonCards(start, end) {
  showSpinner();
  try {
    if (pokemon.length < end) {
      const newPokemon = await fetchPokemon(start, end - start);
      pokemon.push(...newPokemon);
    }
    const imageLoadPromises = [];

    for (let i = start; i < end; i++) {
      pokemonDetails = await getPokemonDetails(pokemon[i].url);
      // Pokemon Stats ziehen
      const stats = extractStats(pokemonDetails);
      renderedPokemonStats.push({
        id: i + 1, // Pokémon-ID (API beginnt bei 1)
        name: pokemonDetails.name,
        stats: stats,
      });
      // Pokemon Karte erstellen
      const card = createPokemonCard(i, pokemonDetails, pokemon[i].url);
      cardsWrapper.appendChild(card);

      const imgElement = card.querySelector("img");
      if (imgElement) {
        imageLoadPromises.push(loadImage(imgElement.src));
      }
    }
    // Warten, bis alle Bilder geladen sind
    await Promise.all(imageLoadPromises);
    pokemonCache = cardsWrapper.innerHTML;

    console.log("Aktuelle gerenderte Stats:", renderedPokemonStats);
  } catch (error) {
    console.error("Error rendering Pokemon cards:", error);
  } finally {
    hideSpinner();
  }
}

function createPokemonCard(i, pokemonDetails, pokemonUrl) {
  const card = document.createElement("div");
  card.setAttribute("onclick", `openDetailCard(${i}, "${pokemonUrl}")`);
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

// Show Dialog -> DetailCard
function openDetailCard(currIndex, pokemonUrl) {
  document.body.classList.add("overflow_hidden");
  let refOverlay = document.getElementById("overlay");
  refOverlay.showModal();
  renderDetailCard(currIndex, pokemonUrl);
}

function onMouseDown(event) {
  const dialog = document.getElementById("overlay");
  if (event.target === dialog) {
    document.body.classList.remove("overflow_hidden");
    dialog.close();
  }
}

async function renderDetailCard(currIndex, pokemonUrl) {
  try {
    let pokemonDetail = await fetchPokemonDetails(pokemonUrl);
    const pokemonType = pokemonDetail.types[0].type.name;
    getGenerationAndRegion(pokemonDetail);
    setClassBackgroundColor(pokemonType);
    getStatsFromAPI(pokemonType, pokemonDetail);
    setPokemonIdAndName(currIndex, pokemonDetail);
    getHeightAndWeightFromApi(pokemonDetail);
    setDetailCardImage(currIndex);
    setButtonAttributes(currIndex, pokemonUrl);
    const cryButton = document.getElementById("pokemon_cry");
    cryButton.setAttribute("onclick", `playPokemonCry('${pokemonDetail.cries.latest}')`);
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

function setDetailCardImage(currIndex) {
  document.getElementById("detail_card_pokemon_image").src =
    document.getElementById("pokemon_image_" + [currIndex]).src;
}

function setPokemonIdAndName(currIndex, pokemonDetail) {
  document.getElementById("detail_card_pokemon_id").innerHTML =
    document.getElementById("pokemon_id_" + [currIndex]).innerHTML;
  document.getElementById("detail_card_name").innerHTML =
    document.getElementById("pokemon_name_" + [currIndex]).innerHTML;
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

function setButtonAttributes(currIndex, pokemonUrl) {
  document
  .getElementById("btn_left")
  .setAttribute(
    "onclick",
    `getPreviousDetailCard(${currIndex}, "${pokemonUrl}")`
  );
document
  .getElementById("btn_right")
  .setAttribute(
    "onclick",
    `getNextDetailCard(${currIndex}, "${pokemonUrl}")`
  );
}

// Navigate in Detail Card
function getPreviousDetailCard(currIndex, pokemonUrl) {
  if (currIndex <= 0) {
    currIndex = pokemon.length - 1;
  } else {
    currIndex -= 1;
  }
  renderDetailCard(currIndex, pokemonUrl);
}

function getNextDetailCard(currIndex, pokemonUrl) {
  if (currIndex >= pokemon.length - 1) {
    currIndex = 0;
  } else {
    currIndex += 1;
  }
  renderDetailCard(currIndex, pokemonUrl);
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

async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  return await response.json();
}

// Pokemon Names Search Field
async function searchPokemon() {
  const input = document.getElementById("search_input").value.toLowerCase();
  clearTimeout(searchTimeout);

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
      const card = createPokemonCard(i, pokemonDetails, pokemonUrl);
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
  pokemonDetails = await fetchPokemonDetails(pokemonUrl);
  return pokemonDetails;
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
