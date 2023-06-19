const moment = require('moment');
const Datastore = require('nedb');
const { penaltyUsersDB } = require('../database');

class PenaltyUser {
  constructor(id, casillero, rol, nombre, correo, celular, inicio_penalizacion, fin_penalizacion) {
    this.id = id;
    this.casillero = casillero;
    this.rol = rol;
    this.nombre = nombre;
    this.correo = correo;
    this.celular = celular;
    this.inicio_penalizacion = inicio_penalizacion;
    this.fin_penalizacion = fin_penalizacion;
  }

  save() {
    return new Promise((resolve, reject) => {
      penaltyUsersDB.insert(this, (err, savedUser) => {
        if (err) {
          console.error('[penaltyUsers] Error al guardar el usuario:', err);
          reject(err);
        } else {
          console.log('[penaltyUsers] Usuario guardado:', savedUser);
          resolve(savedUser);
        }
      });
    });
  }

  static deleteById(id) {
    console.log("_id ->", id);
  
    return new Promise((resolve, reject) => {
      penaltyUsersDB.remove({ id }, {}, (err, numRemoved) => {
        if (err) {
          reject(err);
        } else if (numRemoved === 0) {
          console.log('[penaltyUsers] No se encontró el usuario penalizado');
          reject(new Error('[penaltyUsers] No se encontró el usuario penalizado'));
        } else {
          console.log('[penaltyUsers] Usuario eliminado:', id);
          resolve(numRemoved);
        }
      });
    });
  }

  updateField(field, value) {
    return new Promise((resolve, reject) => {
      this[field] = value;
      penaltyUsersDB.update({ _id: this._id }, { $set: { [field]: value } }, {}, (err, numUpdated) => {
        if (err) {
          console.error('[penaltyUsers] Error al actualizar el campo:', err);
          reject(err);
        } else {
          console.log('[penaltyUsers] Campo actualizado:', field, value);
          resolve(numUpdated);
        }
      });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      penaltyUsersDB.find({}, (err, users) => {
        if (err) {
          console.error('[penaltyUsers] Error al obtener los usuarios:', err);
          reject(err);
        } else {
          console.log('[penaltyUsers] Todos los usuarios:', users);
          resolve(users);
        }
      });
    });
  }

  static getById(id) {
    console.log("Testing ->", id);
    return new Promise((resolve, reject) => {
      penaltyUsersDB.findOne({ id: id }, (err, penaltyUser) => {
        if (err) {
          reject(err);
        } else {
          console.log('[penaltyUsers] Usuario encontrado:', penaltyUser);
          resolve(penaltyUser);
        }
      });
    });
  }

  delete() {
    return new Promise((resolve, reject) => {
      penaltyUsersDB.remove({ _id: this._id }, {}, (err, numRemoved) => {
        if (err) {
          console.error('[penaltyUsers] Error al eliminar el usuario:', err);
          reject(err);
        } else {
          console.log('[penaltyUsers] Usuario eliminado:', this);
          resolve(numRemoved);
        }
      });
    });
  }

  getTotalTime() {
    const inicio = moment(this.inicio_penalizacion);
    const fin = moment(this.fin_penalizacion);
    const tiempoTotal = fin.diff(inicio, 'minutes');
    console.log('[penaltyUsers] Tiempo total de penalización:', tiempoTotal);
    return tiempoTotal;
  }
}

module.exports = PenaltyUser;
