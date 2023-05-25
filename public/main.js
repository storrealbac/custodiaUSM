const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

let dummyData = [
  {
    id: 1,
    casillero: "1",
    rol: "202173027-3",
    nombre: "Sebastian",
    correo: "sebastian.torrealba@usm.cl",
    celular: "9560982387",
    entrada: "10am",
    salida: "5pm"
  },
  {
    id: 2,
    casillero: "2",
    rol: "22342327-3",
    nombre: "Seba",
    correo: "sebasrrealba@usm.cl",
    celular: "9560982387",
    entrada: "12am",
    salida: "5pm"
  },
  {
    id: 3,
    casillero: "3",
    rol: "300073027-3",
    nombre: "Sebastian",
    correo: "sebastian@usm.cl",
    celular: "9560982387",
    entrada: "8am",
    salida: "5pm"
  },
  {
    id: 4,
    casillero: "4",
    rol: "202123427-3",
    nombre: "tito",
    correo: "tito.torrealba@usm.cl",
    celular: "9560982387",
    entrada: "10am",
    salida: "5pm"
  },
  {
    id: 5,
    casillero: "5",
    rol: "202173027-3",
    nombre: "Sin",
    correo: "sealba@usm.cl",
    celular: "9560982387",
    entrada: "10am",
    salida: "5pm"
  },
  {
    id: 6,
    casillero: "4",
    rol: "202123427-3",
    nombre: "tito",
    correo: "tito.torrealba@usm.cl",
    celular: "9560982387",
    entrada: "10am",
    salida: "5pm"
  },
  {
    id: 7,
    casillero: "4",
    rol: "202123427-3",
    nombre: "tito",
    correo: "tito.torrealba@usm.cl",
    celular: "9560982387",
    entrada: "10am",
    salida: "5pm"
  },
];

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

  // Tab activeUsers
  Alpine.data("activeUsers", () => ({
    data: dummyData,

  }));

  // Tab addUser
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

  Alpine.data("addUserForm", () => ({
    nombre: "",
    apellido: "",
    casillero: "",
    entrada: "",
    salida: "",
    observacion: "No hay observaciones",
    celular: "",
    correo: "",

    verifyEmail: function () {
      return emailRegex.test(this.correo)
    },

    submitForm: function () {

      let is_invalid = false;
      let missing = "Son invalidos los siguientes campos: "
      if(!this.verifyEmail()) {
        missing += "\n - Correo invalido, no cumple con el formato de un correo"
        is_invalid = true;
      }
      
      if (is_invalid) {
        alert(missing);
        return;
      }

      // Avisar que se agrego correctamente
      alert("Se agrego correctamente");

      // Resetear los campos
      this.nombre = "";
      this.apellido = "";
      this.casillero = "";
      this.entrada = "";
      this.salida = "";
      this.observacion = "No hay observaciones";
      this.correo = "";
      this.celular = "";
    }
    
  }));

});