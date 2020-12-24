'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfesionalSchema = new Schema({
    nombre: String,
    biografia: String,
    imagen: String,
    filmografia: [{
        titulo: String,
        rol: String,
        tipo: String,
        personaje: String,
    }]
});

module.exports = mongoose.model('profesionales', ProfesionalSchema);