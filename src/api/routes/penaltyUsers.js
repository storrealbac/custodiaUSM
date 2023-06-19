const express = require('express');
const router = express.Router();

const PenaltyUser = require("../../db/models/penaltyUsers");

// Ruta para guardar un nuevo usuario penalizado
router.post('/', async (req, res) => {
  const { id, casillero, rol, nombre, correo, celular, inicio_penalizacion, fin_penalizacion } = req.body;

  const penaltyUser = new PenaltyUser(id, casillero, rol, nombre, correo, celular, inicio_penalizacion, fin_penalizacion);

  try {
    const savedUser = await penaltyUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Ruta para obtener todos los usuarios penalizados
router.get('/', async (req, res) => {
  try {
    const users = await PenaltyUser.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar un campo de un usuario penalizado
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  try {
    const user = await PenaltyUser.getById(id);
    if (!user) {
      res.status(404).json({ error: 'Usuario penalizado no encontrado' });
    } else {
      await user.updateField(field, value);
      res.json({ message: 'Campo actualizado correctamente' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar un usuario penalizado
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  console.log("ID -> ", id);
  try {
    const user = await PenaltyUser.getById(id);
    console.log(user);
    if (!user) {
      res.status(404).json({ error: 'Usuario penalizado no encontrado' });
    } else {
      await PenaltyUser.deleteById(id);
      res.json({ message: 'Usuario eliminado correctamente' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
