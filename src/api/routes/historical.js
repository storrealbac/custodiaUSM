const express = require('express');
const router = express.Router();

const HistoricalUser = require('../../db/models/historical');

// Ruta para guardar un nuevo usuario histórico
router.post('/', async (req, res) => {
  const { casillero, rol, nombre, entrada, salida, celular, correo } = req.body;

  const historicalUser = new HistoricalUser(casillero, rol, nombre, entrada, salida, celular, correo);

  try {
    const savedUser = await historicalUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener todos los usuarios históricos
router.get('/', async (req, res) => {
  try {
    const users = await HistoricalUser.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener un usuario histórico por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await HistoricalUser.getById(id);
    if (!user) {
      res.status(404).json({ error: 'Usuario histórico no encontrado' });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar un campo de un usuario histórico
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fieldName, value } = req.body;

  try {
    const user = await HistoricalUser.getById(id);
    if (!user) {
      res.status(404).json({ error: 'Usuario histórico no encontrado' });
    } else {
      await user.updateField(fieldName, value);
      res.json({ message: 'Campo actualizado correctamente' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar un usuario histórico
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await HistoricalUser.getById(id);
    if (!user) {
      res.status(404).json({ error: 'Usuario histórico no encontrado' });
    } else {
      await user.delete();
      res.json({ message: 'Usuario eliminado correctamente' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener registros históricos entre dos fechas
router.get('/between-dates', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const users = await HistoricalUser.getUsersBetweenDates(startDate, endDate);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
