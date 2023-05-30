const express = require('express');
const apiRouter = express.Router();

const activeUsers = require("./routes/activeUsers");
const penaltyUsers = require("./routes/penaltyUsers");
const historical = require("./routes/historical");

// Ejemplo de ruta en la API
apiRouter.get('/', (req, res) => {
  // Lógica para manejar la ruta /api/users
  res.send("Epa, acá no está la API, vaya pa otro lao");
});


apiRouter.use("/penalty-users", penaltyUsers);
apiRouter.use("/active-users", activeUsers);
apiRouter.use("/historical", historical);

module.exports = apiRouter;
