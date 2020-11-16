'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    }]
});

module.exports = mongoose.model('Usuario', UsuarioSchema);