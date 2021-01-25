'use strict'

const Serie = require('../models/serie');
const Usuario = require('../models/usuario');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

function redondeo(value, exp){
    value = +value;
    exp = +exp;

    value = value.toString().split('e');
    value = Math['round'](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));

    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

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
    },

    saveCritica: function(req, res){
        const params = req.body;
        console.log(params);
        const serieId = params.serieId;
        console.log(serieId);
        const usuarioId = params.usuarioId;
        const fecha = new Date();
        let notaMedia = 0;

        function notaPelicula(serie){
            let notas = 0;
            let n = 0;
            serie.criticas.forEach(element => {
                notas = notas+element.nota;
                n++;
            });
            console.log(notas);
            notaMedia = notas/n;
            console.log(notaMedia);
        }

        Serie.findById(serieId, (err, serie) => {
            if(err){
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }else {
                Usuario.findById(usuarioId, (err, usuario) => {
                    if(err){
                        console.log("cosas");
                        return res.status(500).send({
                            message: "Error al mostrar los datos"
                        });
                    }else {
                        serie.criticas.push({nota: params.nota, titulo: params.titulo,
                            texto: params.texto, fecha: fecha, usuario: usuarioId});
                        
                        usuario.series.push({titulo: serie.titulo, imagen: serie.imagen, 
                            nota: params.nota, serie: serieId});
                        serie.save();
                        usuario.save();
                        notaPelicula(serie);
                        notaMedia = redondeo(notaMedia, -1);
                        console.log(notaMedia);
                        let notaUp = {
                            $set: {
                              nota_media: notaMedia
                            }
                        };
                        Serie.findByIdAndUpdate(serieId,  notaUp, {new: true}, (err, notaUpdate) => {
                            if(err){
                                return res.status(500).send({
                                    message: "Error al guardar la nota media"
                                });
                            }else {
                                return res.status(200).send({
                                    message: "Guardados"
                                });
                            }
                        });
                        
                    }
                });
            }
        });
    }

};

module.exports = controller;