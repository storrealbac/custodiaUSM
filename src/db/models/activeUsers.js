const moment = require('moment');

const { activeUsersDB } = require('../database');

class ActiveUser {
  constructor(casillero, rol, nombre, entrada, salida, celular, correo) {
    this.casillero = casillero;
    this.rol = rol;
    this.nombre = nombre;
    this.entrada = entrada;
    this.salida = salida;
    this.celular = celular;
    this.correo = correo;
  }

  save() {
    return new Promise((resolve, reject) => {
      activeUsersDB.insert(this, (err, newActiveUser) => {
        if (err) {
          reject(err);
        } else {
          console.log('[activeUsers] Usuario guardado:', newActiveUser);
          resolve(newActiveUser);
        }
      });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      activeUsersDB.find({}, (err, activeUsers) => {
        if (err) {
          reject(err);
        } else {
          console.log("[activeUsers] Se han obtenido todos los usuarios");
          resolve(activeUsers);
        }
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      activeUsersDB.findOne({ _id: id }, (err, activeUser) => {
        if (err) {
          reject(err);
        } else {
          console.log('[activeUsers] Usuario encontrado:', activeUser);
          resolve(activeUser);
        }
      });
    });
  }

  updateField(fieldName, value) {
    return new Promise((resolve, reject) => {
      const updateData = { $set: { [fieldName]: value } };
      activeUsersDB.update({ _id: this._id }, updateData, {}, (err, numAffected) => {
        if (err) {
          reject(err);
        } else if (numAffected === 0) {
          console.log('[activeUsers] No se encontró el usuario activo');
          reject(new Error('[activeUsers] No se encontró el usuario activo'));
        } else {
          console.log('[activeUsers] Campo actualizado:', fieldName, value);
          resolve(numAffected);
        }
      });
    });
  }

  delete() {
    return new Promise((resolve, reject) => {
      activeUsersDB.remove({ _id: this._id }, {}, (err, numRemoved) => {
        if (err) {
          reject(err);
        } else if (numRemoved === 0) {
          console.log('[activeUsers] No se encontro el usuario activo');
          reject(new Error('[activeUsers] No se encontro el usuario activo'));
        } else {
          console.log('[activeUsers] Usuario eliminado:', this);
          resolve(numRemoved);
        }
      });
    });
  }

  getEntradaFormatted() {
    const formattedEntrada = moment(this.entrada).format('YYYY-MM-DD HH:mm:ss');
    console.log('[activeUsers] Entrada formateada:', formattedEntrada);
    return formattedEntrada;
  }

  getSalidaFormatted() {
    const formattedSalida = moment(this.salida).format('YYYY-MM-DD HH:mm:ss');
    console.log('[activeUsers] Salida formateada:', formattedSalida);
    return formattedSalida;
  }
}

module.exports = ActiveUser;