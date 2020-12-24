'use strict'

const Pelicula = require('../models/pelicula');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

const controller = {

    getID: function(req, res){
        const peliId = req.params.id;

        Pelicula.findById(peliId, (err, peli) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(!peli){
                return res.status(404).send({
                    message: "No existe ningúna Película con este identificador"
                });
            }
            return res.status(200).send({
                peli
            });
        });
    },

    getTitulo: function(req, res){
        const tituloparam = req.params.titulo;

        Pelicula.find({titulo:tituloparam}, (err, peli) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(peli == ""){
                return res.status(404).send({
                    message: "No existe ningúna Película con este título"
                });
            }
            return res.status(200).send({
                peli
            });
        });
    },

    getPeliculas: function(req, res){
        
        Pelicula.find({}).sort({"fecha_estreno": -1}).limit(5).exec((err, peli) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(!peli){
                return res.status(404).send({
                    message: "No hay ninguna película en la base de datos"
                });
            }
            return res.status(200).send({
                peli
            });
        });
    }

};

module.exports = controller;