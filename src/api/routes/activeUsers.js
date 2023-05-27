const express = require("express");
const router = express.Router();

const ActiveUser = require("../../db/models/activeUsers");

// Ruta para guardar un nuevo usuario activo
router.post("/", async (req, res) => {
  const { casillero, rol, nombre, entrada, salida, celular, correo } = req.body;

  const activeUser = new ActiveUser(casillero, rol, nombre, entrada, salida, celular, correo);

  try {
    const newActiveUser = await activeUser.save();
    res.status(201).json(newActiveUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener todos los usuarios activos
router.get("/", async (req, res) => {
  try {
    const activeUsers = await ActiveUser.getAll();
    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener un usuario activo por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const activeUser = await ActiveUser.getById(id);
    if (!activeUser) {
      res.status(404).json({ error: "Usuario activo no encontrado" });
    } else {
      res.json(activeUser);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar un campo de un usuario activo
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fieldName, value } = req.body;

  try {
    const activeUser = await ActiveUser.getById(id);
    if (!activeUser) {
      res.status(404).json({ error: "Usuario activo no encontrado" });
    } else {
      await activeUser.updateField(fieldName, value);
      res.json({ message: "Campo actualizado correctamente" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar un usuario activo
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const activeUser = await ActiveUser.getById(id);
    if (!activeUser) {
      res.status(404).json({ error: "Usuario activo no encontrado" });
    } else {
      await activeUser.delete();
      res.json({ message: "Usuario eliminado correctamente" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
