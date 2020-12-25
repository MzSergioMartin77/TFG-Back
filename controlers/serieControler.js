'use strict'

const Serie = require('../models/serie');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

const controller = {

    //Buscar una serie por el identificador
    getIdSerie: function(req, res){
        const serieId = req.params.id;

        Serie.findById(serieId, (err, serie) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(!serie){
                return res.status(404).send({
                    message: "No existe ningúna Serie con este identificador"
                });
            }
            return res.status(200).send({
                serie
            });
        });
    },

    //Buscar una serie por el título 
    getTituloSerie: function(req, res){
        const tituloparam = req.params.titulo;

        Serie.find({titulo:tituloparam}, (err, serie) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(serie == ""){
                return res.status(404).send({
                    message: "No existe ningúna Serie con este título"
                });
            }
            return res.status(200).send({
                serie
            });
        });
    },

    //Coge las 5 series más nuevas 
    getSeries: function(req, res){
        
        Serie.find({}).sort({"inicio": -1}).limit(5).exec((err, serie) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(!serie){
                return res.status(404).send({
                    message: "No hay ninguna serie en la base de datos"
                });
            }
            return res.status(200).send({
                serie
            });
        });
    }

};

module.exports = controller;