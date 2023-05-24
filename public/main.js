
const loadComponent = (component_name) => {
  Alpine.data(`${component_name}Component`, () => ({
    html_data: "Cargando...",

    init() {
      fetch(`components/${component_name}.html`)
        .then(response => response.text())
        .then(html => {
          this.html_data = html;
          console.log(`[HTML Loader] Se cargo el archivo ${component_name}.html`);
        })
        .catch(error => {
          console.error(`Error al obtener el HTML de ${component_name}`, error);
        });
    }
  }));
}


document.addEventListener('alpine:init', () => {
  loadComponent("addUser");
  loadComponent("activeUsers");
  loadComponent("downloadReport");
  loadComponent("penalizedUsers");
  loadComponent("signOut");

  Alpine.data("formFilled", () => ({
    disabled: true,

    init() {

      const inputs = [...document.querySelectorAll("input[name]")];
      inputs.forEach((input) => {
        input.addEventListener("input", () => {
          console.log("->", this.disabled);
          this.disabled = !inputs.every((input) => input.value.trim() !== "");
        });
      });
    }
  }));

});