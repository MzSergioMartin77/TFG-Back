'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//esquema de los datos de las críticas 
const CriticaSchema = new Schema({
    nota: Number,
    titulo: String,
    texto: String,
    fecha: Date,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'}
});

//esquema de los datos de los comentarios
const ComentarioSchema = new Schema({
    texto: String,
    fecha: Date,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'},
    respuesta: [ComentarioSchema]
})

//esquema de los datos de las películas
const SerieSchema = new Schema({
    titulo: String,
    titulo_original: String,
    sinopsis: String,
    nota_media: Number,
    generos: [String],
    imagen: String,
    trailer: String,
    temporadas: Number,
    capitulos: Number,
    inicio: Number,
    final: Number,
    actores: [{
        nombre: String,
        profesional: {type: mongoose.Schema.Types.ObjectId, ref: 'profesional'}
    }],
    directores: [{
        nombre: String,
        profesional: {type: mongoose.Schema.Types.ObjectId, ref: 'profesional'}
    }],
    criticas: [CriticaSchema],
    comentarios: [ComentarioSchema]
});

module.exports = mongoose.model('serie', SerieSchema);