const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

require("dotenv").config();
const apiRouter = require('./api/api');


// Configuración de la carpeta pública
app.use(express.static(path.join(__dirname, 'public')));

// Inicializando el body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const requiredVariables = ['ACTIVE_USERS_DATABASE', 'PENALTY_USERS_DATABASE', 'HISTORICAL_DATABASE', 'PORT'];
const missingVariables = requiredVariables.filter(variable => !(variable in process.env));

// Si faltan variables, mostrar un mensaje de error y finalizar el programa
if (missingVariables.length > 0) {
  console.error('Faltan variables de entorno requeridas:', missingVariables.join(', '));
  process.exit(1);
}

// Iniciando la base de datos luego de verificar las variables de entorno
const database = require("./db/database");

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// Api router
app.use('/api', apiRouter);

// Puerto de escucha
app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
