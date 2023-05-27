const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const getAllActiveUsers = async () => {
  try {
    const response = await fetch('/api/active-users');
    if (response.ok) {
      const activeUsers = await response.json();
      return activeUsers;
    } else {
      throw new Error('Error al obtener los usuarios activos');
    }
  } catch (error) {
    console.error("[getAllActiveUsers]", error);
    return null;
  }
};

// lol
const addDummyActiveUser = async () => {
  try {
    const randomName = generateRandomName();
    const randomCellphone = generateRandomCellphone();
    const randomEmail = generateRandomEmail();
    const randomLocker = generateRandomLocker();

    const newUser = {
      casillero: randomLocker,
      rol: 'Usuario',
      nombre: randomName,
      entrada: new Date(),
      salida: new Date(),
      celular: randomCellphone,
      correo: randomEmail
    };

    const response = await fetch('/api/active-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    });

    if (response.ok) {
      const addedUser = await response.json();
      console.log('Usuario activo añadido:', addedUser);
    } else {
      throw new Error('Error al agregar el usuario activo');
    }
  } catch (error) {
    console.error(error);
  }
};

const generateRandomName = () => {
  const names = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Olivia'];
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
};

const generateRandomCellphone = () => {
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
  return String(randomDigits);
};

const generateRandomEmail = () => {
  const domains = ['example.com', 'test.com', 'domain.com'];
  const randomIndex = Math.floor(Math.random() * domains.length);
  const randomName = generateRandomName().toLowerCase();
  return `${randomName}@${domains[randomIndex]}`;
};

const generateRandomLocker = () => {
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return String(randomDigits);
};
addDummyActiveUser();
// lolaso



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
    data: [],

    retirar: function(row) {
      // id, casillero, rol, nombre, correo, celular, entrada, salida
      // Recuerda que tienes que usarlo como si fuera un diccionario
    },

    editar: function(row) {
      let row_data = row.__raw;
      console.log("Editar", row_data)
    },

    async onMount() {
      const activeUsers = await getAllActiveUsers();
      activeUsers.forEach( (e) => {
        e.entrada = new Date(e.entrada).toLocaleTimeString();
        e.salida = new Date(e.salida).toLocaleTimeString();
        this.data.push(e);
      })
    }

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