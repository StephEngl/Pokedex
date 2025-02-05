function getCardsTemplate(i, type) {
    return /*html*/ `
        <div class="cards_content bg_${type}" id="cards_content_${i}">
                    <div class="pokemon_info_${i}" id="pokemon_info_${i}">
                        <h3 id="pokemon_name_${i}">Bisasam</h3>
                    </div>
                    <img src="assets/img/pokeball.svg" alt="Pokeball" class="pokeball-background">
        </div>
    `;
  }

function getTypesTemplate(j, type) {
  return /*html*/ `
        <div id="type_${j}">${type}</div>
    `;
}
