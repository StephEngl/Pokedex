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
