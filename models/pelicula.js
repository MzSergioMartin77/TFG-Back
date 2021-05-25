'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//esquema de los datos de las críticas 
const CriticaSchema = new Schema({
    nota: Number,
    nick: String,
    titulo: String,
    texto: String,
    fecha: Date,
    usuario_model: Number,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'}
});

//esquema de los datos de los comentarios
const ComentarioSchema = new Schema({
    nick: String,
    texto: String,
    fecha: Date,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'},
    respuesta: [{type: mongoose.Schema.Types.ObjectId, ref: 'comentario'}]
})

//esquema de los datos de las películas
const PeliSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id_model: Number,
    id_TMDB: Number,
    titulo: String,
    titulo_original: String,
    sinopsis: String,
    nota_media: Number,
    generos: [String],
    imagen: String,
    trailer_es: String,
    trailer_en: String,
    duracion: Number,
    fecha_estreno: Date,
    actores: [{
        nombre: String,
        personaje: String
    }],
    plataformas: [{
        nombre: String,
        icono: String
    }],
    directores: [String],
    criticas: [CriticaSchema],
    comentarios: [ComentarioSchema]
});

module.exports = mongoose.model('peliculas', PeliSchema);