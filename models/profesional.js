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
        pelicula: {type: mongoose.Schema.Types.ObjectId, ref: 'Pelicula'},
        serie: {type: mongoose.Schema.Types.ObjectId, ref: 'Serie'}
    }]
});

module.exports = mongoose.model('Profesional', ProfesionalSchema);