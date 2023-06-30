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
// Función para formatear la fecha en el formato deseado (YYYY-MM-DD HH:mm:ss)
function formatDate(date) {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Función para agregar un cero al inicio si el valor es menor que 10
function padZero(value) {
  return value < 10 ? `0${value}` : value;
}

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

async function getAllPenalizedUsers() {
  try {
    const response = await fetch('/api/penalty-users');
    if (!response.ok) {
      throw new Error('Error al obtener los usuarios penalizados');
    }
    const penalizedUsers = await response.json();
    console.log(penalizedUsers);
    return penalizedUsers;
  } catch (error) {
    console.error(error);
    // Manejar el error al obtener los usuarios penalizados
    return [];
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

  // Tab penalizedUsers
  Alpine.data("penalizedUsers", () => {
    return {
      data: [],
  
      async updateTable() {
        this.data = await getAllPenalizedUsers();
      },
  
      async onMount() {
        eventBus.$on("penalizedUserAdded", () => {
          this.updateTable();
        });
  
        eventBus.$on("updatePenalizedUsersTable", () => {
          this.updateTable();
        });
  
        this.updateTable();
      },

      quitar: function(row) {
        if (confirm("¿Estás seguro de que deseas quitar a esta persona de la lista de penalizados?")) {
          const userId = row["id"];
          fetch(`/api/penalty-users/${userId}`, { method: "DELETE" })
            .then(response => {
              if (response.ok) {
                // Actualizar la tabla después de eliminar al usuario
                this.updateTable();
              } else {
                throw new Error('Error al eliminar al usuario de la lista de penalizados');
              }
            })
            .catch(error => {
              console.error(error);
              // Manejar el error al eliminar al usuario de la lista de penalizados
            });
        }
      }
    };
  });
  

  // Tab activeUsers
  Alpine.data("activeUsers", () => ({
    data: [],

    retirar: function (row) {
      const userId = row["_id"];
    
      // Solicitar confirmación al usuario
      const confirmRetirar = window.confirm('¿Estás seguro de que deseas retirar este usuario?');
      if (!confirmRetirar) return;

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
    
    eliminar: function (row) {
      const userId = row["_id"];
      
      // Solicitar confirmación al usuario
      const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
      
      if (confirmDelete) {
        // Realizar la petición para eliminar al usuario de la lista de usuarios activos
        fetch(`/api/active-users/${userId}`, { method: 'DELETE' })
          .then(response => {
            console.log(response);
            if (response.ok) {
              // Eliminar el usuario del arreglo de datos en el cliente
              const userIndex = this.data.findIndex(user => user.id === userId);
              this.data.splice(userIndex, 1);
            } else {
              throw new Error('Error al retirar al usuario de la lista de usuarios activos');
            }
          })
          .catch(error => {
            console.error(error);
            // Manejar el error al retirar al usuario de la lista de usuarios activos
          });
      }
    },    

    editar: function (row) {
      // Not today bby
    },

    penalizar: function (row) {
      const userId = row["_id"];
    
      const dias = window.prompt("Ingrese la cantidad de dias para la penalización:");
    
      // Verificar si se ingresó una cantidad de horas válida
      if (!dias || isNaN(dias)) {
        console.log('Cantidad de dias inválida.');
        return;
      }
    
      const fechaActual = new Date();
      const inicioPenalizacion = fechaActual.getTime();
      const finalPenalizacion = fechaActual.getTime() + (dias * 24 * 60 * 60 * 1000); // Convertir horas a milisegundos
    
      console.log("row ->", row);

      const usuarioPenalizado = {
        id: row["_id"],
        casillero: row.casillero,
        nombre: row.nombre,
        correo: row.correo,
        celular: row.celular,
        inicio_penalizacion: formatDate(new Date(inicioPenalizacion)),
        fin_penalizacion: formatDate(new Date(finalPenalizacion))
      };
    
      console.log(usuarioPenalizado);

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

      fetch(`/api/active-users/${userId}`, { method: 'DELETE' })
        .then(response => {
          console.log(response);
          if (response.ok) {
            // Eliminar el usuario del arreglo de datos en el cliente
            const userIndex = this.data.findIndex(user => user.id === userId);
            this.data.splice(userIndex, 1);
    
            // Realizar la petición para agregar el usuario a los usuarios penalizados
            fetch('/api/penalty-users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(usuarioPenalizado)
            })
              .then(response => {
                if (response.ok) {
                  // Emitir el evento para actualizar la tabla de usuarios activos
                  eventBus.$emit('updateActiveUsersTable');
                  eventBus.$emit('updatePenalizedUsersTable');
                } else {
                  throw new Error('Error al agregar el usuario a los usuarios penalizados');
                }
              })
              .catch(error => {
                console.error(error);
                // Manejar el error al agregar el usuario a los usuarios penalizados
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
    
    async updateTable() {
      this.data = [];
      const activeUsers = await getAllActiveUsers();
      activeUsers.forEach((e) => {
        this.data.push(e);
      });

      activeUsers.sort(function(a, b) {
        if (a.casillero < b.casillero) return -1;
        else if (a.casillero > b.casillero) return 1;
        return 0;
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
    casillero: "",
    entrada: "",
    salida: "",
    observaciones: "No hay observaciones",
    celular: "",
    correo: "",

    verifyEmail: function () {
      return emailRegex.test(this.correo);
    },
    submitForm: function () {
      let is_invalid = false;
      let missing = "Son invalidos los siguientes campos: ";
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
        casillero: this.casillero,
        entrada: this.entrada,
        salida: this.salida,
        observaciones: this.observaciones,
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
      this.casillero = "";
      this.entrada = "";
      this.salida = "";
      this.observaciones = "No hay observaciones";
      this.correo = "";
      this.celular = "";
    },
  }));
});
