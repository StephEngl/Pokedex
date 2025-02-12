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
      document
        .getElementById("detail_card")
        .classList.add("detail_card", `bg_${pokemonType}`);
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
  
  // Get Stats from API and create Radar Chart
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
  
  function extractStats(pokemonDetails) {
    return pokemonDetails.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {});
  }
  
  // Radar Chart for stats
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
  
  function getRGBAColor(pokemonType) {
    const backgroundColor = getComputedStyle(
      document.querySelector(`.bg_${pokemonType}`)
    ).backgroundColor;
    return backgroundColor.replace("rgb", "rgba").replace(")", ", 0.4)");
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