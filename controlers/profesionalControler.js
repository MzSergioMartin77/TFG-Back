'use strict'

const Profesional = require('../models/profesional');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

const controller = {

    //Buscar una profesional por el identificador
    getIdPro: function(req, res){
        const proId = req.params.id;

        Profesional.findById(proId, (err, profesional) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(!profesional){
                return res.status(404).send({
                    message: "No existe ningún Profesional con este identificador"
                });
            }
            return res.status(200).send({
                profesional
            });
        });
    },

    //Buscar una serie por el nombre
    getNombrePro: function(req, res){
        const nombreparam = req.params.nombre;

        Profesional.find({ nombre: {$regex: nombreparam} }, (err, profesional) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(profesional == ""){
                return res.status(404).send({
                    message: "No existe ningún Profesional con este título"
                });
            }
            return res.status(200).send({
                profesional
            });
        });
    },

    getBuscarPro: function(req, res){
        const nombreparam = req.params.nombre;
        let buscar = "(?i)^"+nombreparam;

        Profesional.find({ $or: [
            {$text: {$search: nombreparam, $diacriticSensitive: false}},
            {nombre: {$regex: buscar}}
        ]}, (err, profesional) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if(profesional == ""){
                return res.status(404).send({
                    message: "No existe ningún Profesional con este título"
                });
            }
            return res.status(200).send({
                profesional
            });
        });
    }
    

};

module.exports = controller;