const moment = require('moment');
const { historicalDB } = require('../database');

class HistoricalUser {
  constructor(casillero, rol, nombre, entrada, salida, celular, correo) {
    this.casillero = casillero;
    this.rol = rol;
    this.nombre = nombre;
    this.entrada = entrada;
    this.salida = salida;
    this.celular = celular;
    this.correo = correo;

    const date = moment();
    this.dia = date.format('DD/MM/YYYY');
  }

  save() {
    return new Promise((resolve, reject) => {
      historicalDB.insert(this, (err, newHistoricalUser) => {
        if (err) {
          reject(err);
        } else {
          console.log('[historicalUsers] Usuario guardado:', newHistoricalUser);
          resolve(newHistoricalUser);
        }
      });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      historicalDB.find({}, (err, historicalUsers) => {
        if (err) {
          reject(err);
        } else {
          console.log('[historicalUsers] Se han obtenido todos los usuarios');
          resolve(historicalUsers);
        }
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      historicalDB.findOne({ _id: id }, (err, historicalUser) => {
        if (err) {
          reject(err);
        } else {
          console.log('[historicalUsers] Usuario encontrado:', historicalUser);
          resolve(historicalUser);
        }
      });
    });
  }

  static getUsersBetweenDates(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const start = moment(startDate, 'YYYY-MM-DD').startOf('day').toDate();
      const end = moment(endDate, 'YYYY-MM-DD').endOf('day').toDate();

      historicalDB.find({ entrada: { $gte: start, $lte: end } }, (err, historicalUsers) => {
        if (err) {
          reject(err);
        } else {
          console.log('[historicalUsers] Usuarios encontrados entre fechas:', startDate, endDate);
          resolve(historicalUsers);
        }
      });
    });
  }

  updateField(fieldName, value) {
    return new Promise((resolve, reject) => {
      const updateData = { $set: { [fieldName]: value } };
      historicalDB.update({ _id: this._id }, updateData, {}, (err, numAffected) => {
        if (err) {
          reject(err);
        } else if (numAffected === 0) {
          console.log('[historicalUsers] No se encontró el usuario histórico');
          reject(new Error('[historicalUsers] No se encontró el usuario histórico'));
        } else {
          console.log('[historicalUsers] Campo actualizado:', fieldName, value);
          resolve(numAffected);
        }
      });
    });
  }

  delete() {
    return new Promise((resolve, reject) => {
      historicalDB.remove({ _id: this._id }, {}, (err, numRemoved) => {
        if (err) {
          reject(err);
        } else if (numRemoved === 0) {
          console.log('[historicalUsers] No se encontró el usuario histórico');
          reject(new Error('[historicalUsers] No se encontró el usuario histórico'));
        } else {
          console.log('[historicalUsers] Usuario eliminado:', this);
          resolve(numRemoved);
        }
      });
    });
  }

  getEntradaFormatted() {
    const formattedEntrada = moment(this.entrada).format('YYYY-MM-DD HH:mm:ss');
    console.log('[historicalUsers] Entrada formateada:', formattedEntrada);
    return formattedEntrada;
  }

  getSalidaFormatted() {
    const formattedSalida = moment(this.salida).format('YYYY-MM-DD HH:mm:ss');
    console.log('[historicalUsers] Salida formateada:', formattedSalida);
    return formattedSalida;
  }
}

module.exports = HistoricalUser;
