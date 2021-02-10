'use strict'

const Serie = require('../models/serie');
const Usuario = require('../models/usuario');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

//Función para redondear a los decimales 
function redondeo(value, exp) {
    value = +value;
    exp = +exp;

    value = value.toString().split('e');
    value = Math['round'](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));

    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

//Calcular nota media de la serie
function notaPelicula(serie) {
    let notas = 0;
    let n = 0;
    serie.criticas.forEach(element => {
        notas = notas + element.nota;
        n++;
    });
    return notas / n;
}

const controller = {

    //Buscar una serie por el identificador
    getIdSerie: function (req, res) {
        const serieId = req.params.id;

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (!serie) {
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
    getTituloSerie: function (req, res) {
        const tituloparam = req.params.titulo;

        Serie.find({ titulo: tituloparam }, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (serie == "") {
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
    getSeries: function (req, res) {

        Serie.find({}).sort({ "inicio": -1 }).limit(5).exec((err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (!serie) {
                return res.status(404).send({
                    message: "No hay ninguna serie en la base de datos"
                });
            }
            return res.status(200).send({
                serie
            });
        });
    },

    //Guardar una crítica nueva en el documento embebido de crítica
    saveCritica: function (req, res) {
        const params = req.body;
        console.log(params);
        const serieId = params.serieId;
        console.log(serieId);
        const usuarioId = params.usuarioId;
        const fecha = new Date();
        let notaMedia = 0;

        //Se busca la serie a la que se le pone la crítica
        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error serie"
                });
            } else {
                //Se busca al usuario que escribe la crítica
                Usuario.findById(usuarioId, (err, usuario) => {
                    if (err) {
                        console.log("cosas");
                        return res.status(500).send({
                            message: "Error usuario"
                        });
                    } else {
                        //Se añaden los datos de la crítica a la serie
                        serie.criticas.push({
                            nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                            texto: params.texto, fecha: fecha, usuario: usuarioId
                        });

                        //Se añade los datos de la crítica al usuario
                        usuario.series.push({
                            titulo: serie.titulo, imagen: serie.imagen,
                            nota: params.nota, serie: serieId
                        });
                        serie.save();
                        usuario.save();
                        notaMedia = notaPelicula(serie);
                        notaMedia = redondeo(notaMedia, -1);
                        let notaUp = {
                            $set: {
                                nota_media: notaMedia
                            }
                        };
                        //Se actualiza la nota media de la serie
                        Serie.findByIdAndUpdate(serieId, notaUp, { new: true }, (err, notaUpdate) => {
                            if (err) {
                                return res.status(500).send({
                                    message: "Error al guardar la nota media"
                                });
                            } else {
                                return res.status(200).send({
                                    message: "Guardado"
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    saveComentario: function(req, res){
        const params = req.body;
        console.log(params);
        const serieId = params.serieId;
        const usuarioId = params.usuarioId;
        const fecha = new Date();

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
                        serie.comentarios.push({nick:usuario.nick, texto: params.texto, fecha: fecha, usuario: usuarioId});
                        serie.save();
                        return res.status(200).send({
                            message: "Guardado"
                        });
                    }
                });
            }
        });
    },

    middlewareCritica: function(req, res){
        const params = req.body;
        const serieId = params.serieId;
        const usuarioId = params.usuarioId;
        let status = true;
        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error serie"
                });
            } 
            else{
                serie.criticas.forEach(element => {
                    if(usuarioId == element.usuario){
                        status = false;
                        console.log('Actualizar critica');
                    }
                });
                if(status == true){
                    console.log('Guardar critica');
                }
            }
        });
    }

};

module.exports = controller;