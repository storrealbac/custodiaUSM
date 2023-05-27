const moment = require('moment');
const Datastore = require('nedb');
const { penaltyUsersDB } = require('../database');

class PenaltyUser {
  constructor(n_penalizacion, rol, nombre, inicio_penalizacion, fin_penalizacion) {
    this.n_penalizacion = n_penalizacion;
    this.rol = rol;
    this.nombre = nombre;
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
    const db = new Datastore({ filename: 'PenaltyUsersDB', autoload: true });
    return new Promise((resolve, reject) => {
      db.find({}, (err, users) => {
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
    console.log('[penaltyUsers] Tiempo total de penalizaciÃ³n:', tiempoTotal);
    return tiempoTotal;
  }
}

module.exports = PenaltyUser;