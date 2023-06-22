const express = require("express");
const moment = require("moment");
const excel = require("excel4node");

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
router.get("/download-informe", async (req, res) => {
  const { startDate, endDate } = req.query;

  const epoch_start = moment(startDate).valueOf();
  const epoch_end = moment(endDate).valueOf();

  const retrieved_users = await HistoricalUser.getAllBetweenDates(epoch_start, epoch_end);

  const excel_workbook = new excel.Workbook();
  const sheet = excel_workbook.addWorksheet("Informe");

  const boldFormat = excel_workbook.createStyle({
    font: {
      bold: true,
    },
    fill: { type: 'pattern', patternType: 'solid', fgColor: "C4D1ED" }
  });


  const oddStyle = excel_workbook.createStyle({ fill: { type: 'pattern', patternType: 'solid', fgColor: "E2E2E2" } });
  const evenStyle = excel_workbook.createStyle({ fill: { type: 'pattern', patternType: 'solid', fgColor: "F2F2F2" } });

  const MAX_COL = 7;
  
  // Base
  sheet.cell(1, 1).string("Rol");
  sheet.cell(1, 2).string("Nombre");
  sheet.cell(1, 3).string("Celular");
  sheet.cell(1, 4).string("Correo");
  sheet.cell(1, 5).string("Entrada");
  sheet.cell(1, 6).string("Salida");
  sheet.cell(1, 7).string("Dia");

  sheet.column(1).setWidth(15);
  sheet.column(2).setWidth(20);
  sheet.column(3).setWidth(15);
  sheet.column(4).setWidth(30);
  sheet.column(5).setWidth(15);
  sheet.column(6).setWidth(15);
  sheet.column(7).setWidth(15);
  

  for (let col = 1; col <= MAX_COL; col++)
    sheet.cell(1, col).style(boldFormat);

  let row = 2;
  for (let user of retrieved_users) {
    sheet.cell(row, 1).string(user["casillero"]);
    sheet.cell(row, 2).string(user["nombre"]);
    sheet.cell(row, 3).string(user["celular"]);
    sheet.cell(row, 4).string(user["correo"]);
    sheet.cell(row, 5).string(user["entrada"]);
    sheet.cell(row, 6).string(user["salida"]);
    sheet.cell(row, 7).string(user["dia"]);

    // Aplicar tonalidades de azul diferentes a posiciones pares e impares
    if (row & 1)
      for (let col = 1; col <= MAX_COL; col++)
        sheet.cell(row, col).style(oddStyle);
    else
      for (let col = 1; col <= MAX_COL; col++)
        sheet.cell(row, col).style(evenStyle);
    row += 1;
  }

  // Generar el archivo de Excel como buffer
  excel_workbook.writeToBuffer().then(buffer => {
    // Obtener el nombre de archivo dinámicamente
    const fileName = `informe-${startDate}_${endDate}.xlsx`;

    // Establecer los encabezados de la respuesta para la descarga del archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviar el buffer como respuesta
    res.send(buffer);
  }).catch(err => {
    console.error("Error al generar el archivo de Excel:", err);
    res.status(500).send("Error al generar el archivo de Excel");
  });
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

module.exports = router;
