const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Creando un sistema de eventos que permita comunicacion
const eventBus = {
  listeners: {},
  $on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  $emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  },
};


const getAllActiveUsers = async () => {
  try {
    const response = await fetch("/api/active-users");
    if (response.ok) {
      const activeUsers = await response.json();
      return activeUsers;
    } else {
      throw new Error("Error al obtener los usuarios activos");
    }
  } catch (error) {
    console.error("[getAllActiveUsers]", error);
    return null;
  }
};

const loadComponent = (component_name) => {
  Alpine.data(`${component_name}Component`, () => ({
    html_data: "Cargando...",

    init() {
      fetch(`components/${component_name}.html`)
        .then((response) => response.text())
        .then((html) => {
          this.html_data = html;
          console.log(
            `[HTML Loader] Se cargo el archivo ${component_name}.html`
          );
        })
        .catch((error) => {
          console.error(`Error al obtener el HTML de ${component_name}`, error);
        });
    },
  }));
};

document.addEventListener("alpine:init", () => {
  loadComponent("addUser");
  loadComponent("activeUsers");
  loadComponent("downloadReport");
  loadComponent("penalizedUsers");
  loadComponent("signOut");

  // Tab activeUsers
  Alpine.data("activeUsers", () => ({
    data: [],

    retirar: function (row) {
      const userId = row["_id"];
    
      // Realizar la petición para retirar al usuario de la lista de usuarios activos
      fetch(`/api/active-users/${userId}`, { method: 'DELETE' })
        .then(response => {
          console.log(response);
          if (response.ok) {
            // Eliminar el usuario del arreglo de datos en el cliente
            const userIndex = this.data.findIndex(user => user.id === userId);
            this.data.splice(userIndex, 1);
    
            // Realizar la petición para agregar el usuario a los registros históricos
            fetch('/api/historical', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(row)
            })
              .then(response => {
                if (response.ok) {
                  // Emitir el evento para actualizar la tabla de usuarios activos
                  eventBus.$emit('updateActiveUsersTable');
                } else {
                  throw new Error('Error al agregar el usuario a los registros históricos');
                }
              })
              .catch(error => {
                console.error(error);
                // Manejar el error al agregar el usuario a los registros históricos
              });
          } else {
            throw new Error('Error al retirar al usuario de la lista de usuarios activos');
          }
        })
        .catch(error => {
          console.error(error);
          // Manejar el error al retirar al usuario de la lista de usuarios activos
        });
    },
    

    editar: function (row) {
      let row_data = row.__raw;
      console.log("Editar", row_data);
    },

    async updateTable() {
      this.data = [];
      const activeUsers = await getAllActiveUsers();
      activeUsers.forEach((e) => {
        this.data.push(e);
      });
    },

    async onMount() {
      eventBus.$on("userAdded", () => {
        this.updateTable();
      });

      eventBus.$on("updateActiveUsersTable", () => {
        this.updateTable();
      });

      this.updateTable();
    },
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
    },
  }));

  Alpine.data("addUserForm", () => ({
    nombre: "",
    rol: "",
    casillero: "",
    entrada: "",
    salida: "",
    observacion: "No hay observaciones",
    celular: "",
    correo: "",

    verifyEmail: function () {
      return emailRegex.test(this.correo);
    },
    submitForm: function () {
      let is_invalid = false;
      let missing = "Son invalidos los siguientes campos: ";
      rol
      if (!this.verifyEmail()) {
        missing +=
          "\n - Correo invalido, no cumple con el formato de un correo";
        is_invalid = true;
      }

      if (is_invalid) {
        alert(missing);
        return;
      }

      // Realizar la petición para agregar el usuario
      const newUser = {
        nombre: this.nombre,
        rol: this.rol,
        casillero: this.casillero,
        entrada: this.entrada,
        salida: this.salida,
        observacion: this.observacion,
        correo: this.correo,
        celular: this.celular,
      };

      fetch("/api/active-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })
        .then((response) => {
          console.log(response);
          if (response.ok) {
            // Avisar que se agregó correctamente
            alert("Se agregó correctamente el usuario");
            
            // Se emite el evento
            eventBus.$emit("userAdded", newUser);
          } else {
            throw new Error("Error al agregar el usuario");
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Ocurrió un error al agregar el usuario");
        });

      // Resetear los campos
      this.nombre = "";
      this.rol = "";
      this.casillero = "";
      this.entrada = "";
      this.salida = "";
      this.observacion = "No hay observaciones";
      this.correo = "";
      this.celular = "";
    },
  }));
});
