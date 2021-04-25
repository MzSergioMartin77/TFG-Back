'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfesionalSchema = new Schema({
    id_TMDB: Number,
    nombre: String,
    biografia: String,
    imagen: String,
    nacimiento: Date,
    filmografia: [{
        titulo: String,
        rol: String,
        tipo: String,
        personaje: String,
    }]
});

module.exports = mongoose.model('profesionales', ProfesionalSchema);