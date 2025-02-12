function getPokemonCardTemplate(
  i,
  pokemonId,
  pokemonName,
  pokemonImage,
  types
) {
  return `
    <div class="pokemon_info" id="pokemon_info_${i}">
      <p class="pokemon_id" id="pokemon_id_${i}">#${pokemonId}</p>
      <h3 id="pokemon_name_${i}">${pokemonName}</h3>
      ${getTypesTemplate(types)}
    </div>
    <img src="assets/img/pokeball.svg" alt="Pokeball" class="pokeball-background">
    <div class="pokemon_image_container">
      <img src="${pokemonImage}" alt="${pokemonName}" class="pokemon_image d_none" id="pokemon_image_${i}">
      <p class="loading_hint" id="loading_hint_${i}">Lädt...</p>
    </div>
    `;
}

function getTypesTemplate(types) {
  return types
    .map(
      (type, j) => `
          <div class="pokemon_type_container">
            <img 
              src="assets/icons/${type.type.name}.svg" 
              alt="${type.type.name}" 
              class="pokemon_type_icon"
            />
            <p class="pokemon_type" id="type_${j}">${type.type.name}</p>
          </div>
        `
    )
    .join("");
}

function getDetailCardHeadTemplate(
  pokemonType,
  pokemonName,
  pokemonId,
  pokemonCry,
  imgUrl
) {
  return `
    <div class="img_control">
      <div id="btn_left">
        <img onclick="getPreviousDetailCard(${pokemonId})"
          class="btn"
          src="./assets/icons/arrow_prev.svg"
          alt="Pfeil nach links"
        />
      </div>
      <div id="btn_right">
        <img onclick="getNextDetailCard(${pokemonId})"
          class="btn"
          src="./assets/icons/arrow_next.svg"
          alt="Pfeil nach rechts"
        />
      </div>
    </div>
    <div class="detail_card_infos_container">
      <div class="detail_card_infos">
        <h3 id="detail_card_name">${pokemonName}</h3>
        <div id="detail_card_pokemon_id">#${("000" + pokemonId).slice(-4)}</div>
      </div>
      <button
        onclick="playPokemonCry('${pokemonCry}')"
        class="pokemon_cry"
        id="pokemon_cry"
      >
        <img
          src="assets/icons/speaker_button.svg"
          alt="Lautsprecher Symbol"
        />
      </button>
    </div>
    <div id="detail_card_pokemon_image_container">
      <img
        src="${imgUrl}"
        alt=""
        id="detail_card_pokemon_image"
        class="detail_card_pokemon_image"
      />
    </div>
`;
}

function getDetailCardBodyTemplate(
  heightInCentimeters,
  weightInKilograms,
  regionName,
  generationNumber,
  shinyImage,
  types
) {
  return `
    <!-- Detail Container -->
      <div class="detail_card_details_container">
        <div class="details_slider">
          <p onclick="showCardContent('detail_card_details', 'slider_infos')" id="slider_infos" class="active">Infos</p>
          <p onclick="showCardContent('detail_card_stats', 'slider_stats')" id="slider_stats">Statuswerte</p>
          <p onclick="showCardContent('evolution_chain', 'slider_evolution')" id="slider_evolution">Entwicklung</p>
          <p onclick="showCardContent('shiny_form', 'slider_forms')" id="slider_forms">Schillernde Form</p>
        </div>
        <!-- About Section -->
        <div class="detail_card_details" id="detail_card_details">
          <div class="detail_card_types" id="detail_card_types">
            ${getTypesTemplate(types)}
          </div>
          <div class="about" id="about">
            <table class="about_table" id="about_table">
              <tr>
                <td>Größe</td>
                <td id="pokemon_height">${heightInCentimeters} cm</td>
              </tr>
              <tr>
                <td>Gewicht</td>
                <td id="pokemon_weight">${weightInKilograms} kg</td>
              </tr>
              <tr>
                <td>Generation</td>
                <td id="pokemon_generation">${generationNumber}</td>
              </tr>
              <tr>
                <td>Region</td>
                <td id="pokemon_region">${regionName}</td>
              </tr>
            </table>
          </div>
        </div>
        <!-- Stats Section -->
        <div class="detail_card_stats d_none" id="detail_card_stats">
          <canvas id="myChart"></canvas>
        </div>
        <!-- Evolution Chain -->
        <div class="evolution_chain d_none" id="evolution_chain"></div>
        <!-- Forms Section -->
        <div class="forms_container d_none" id="shiny_form">
          <img src="${shinyImage}" alt="" id="shiny_image" />
        </div>
      </div>
    
  `;
}

function getRadarChartConfig(statValues, rgbaColor, backgroundColor) {
  return {
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
          display: false,
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          pointLabels: {
            font: {
              weight: "bold",
            },
            color: "grey",
          },
          ticks: {
            stepSize: 20,
          },
        },
      },
      animation: {
        duration: 0, // show instantly without Animation
      },
    },
  };
}