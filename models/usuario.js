'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const peliculaSchema = new Schema({
    pelicula: {type: mongoose.Schema.Types.ObjectId, ref: 'Pelicula'},
    titulo: String,
    imagen: String,
    nota: Number
});

const serieSchema = new Schema({
    serie: {type: mongoose.Schema.Types.ObjectId, ref: 'Serie'},
    titulo: String,
    imagen: String,
    nota: Number
});

//esquema de los datos de los usuarios
const UsuarioSchema = Schema({
    nombre: String,
    email: String,
    pass: String,
    descripcion: String,
    nick: String,
    imagen: String,
    seguidores: Array[{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario'
    }],
    seguidos: Array[{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario'
    }],
    peliculas: Array[peliculaSchema],
    serie: Array[serieSchema]
});

module.exports = mongoose.model('Usuario', UsuarioSchema);