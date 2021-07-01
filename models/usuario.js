'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const peliculaSchema = new Schema({
    pelicula: {type: mongoose.Schema.Types.ObjectId, ref: 'pelicula'},
    titulo: String,
    imagen: String,
    nota: Number,
    id_model: Number
});

const serieSchema = new Schema({
    serie: {type: mongoose.Schema.Types.ObjectId, ref: 'serie'},
    titulo: String,
    imagen: String,
    nota: Number,
    id_model: Number
});

//esquema de los datos de los usuarios
const UsuarioSchema = Schema({
    id_model: Number,
    nombre: String,
    email: String,
    pass: String,
    descripcion: String,
    nick: String,
    imagen: String,
    seguidores: [{ 
        nick: String,
        usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'}
    }],
    seguidos: [{
        nick: String, 
        usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'}
    }],
    peliculas: [peliculaSchema],
    series: [serieSchema]
});

module.exports = mongoose.model('usuario', UsuarioSchema);