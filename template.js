function getCardsTemplate(i, type) {
    return /*html*/ `
        <div onclick="openDetailCard()" class="cards_content bg_${type}" id="cards_content_${i}">
                    <div class="pokemon_info" id="pokemon_info_${i}">
                        <p class="pokemon_id" id="pokemon_id_${i}">#0001</p>
                        <h3 id="pokemon_name_${i}">Bisasam</h3>
                    </div>
                    <img src="assets/img/pokeball.svg" alt="Pokeball" class="pokeball-background">
                    <img src="assets/img/pokemon_open.png" alt="Pokeball" class="pokemon_image" id="pokemon_image_${i}">
        </div>
    `;
  }

function getTypesTemplate(j, type) {
  return /*html*/ `
        <p class="pokemon_type" id="type_${j}">${type}</p>
    `;
}
