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
function notaSerie(serie) {
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

    getBuscarSerie: function (req, res) {
        const tituloparam = req.params.titulo;
        let buscar = "(?i)"+tituloparam;

        Serie.find({ titulo: {$regex: buscar} }, (err, serie) => {
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

    //Coge las 6 series más nuevas 
    getSeries: function (req, res) {

        Serie.find({}).sort({ "inicio": -1 }).limit(6).exec((err, serie) => {
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

    //Buscar una crítica usando el id del usuario
    getCriticaUser: function (req, res){
        const serieId = req.params.serie;
        const userId = req.params.usuario;

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if(!serie){
                return res.status(404).send({
                    message: "No hay ninguna serie con este identificador en la base de datos"
                });
            }
            else{
                for(let i=0; i<serie.criticas.length; i++){
                    if(serie.criticas[i].usuario == userId){
                        if(serie.criticas[i].texto != null){
                            return res.status(200).send({
                                critica: serie.criticas[i]
                            }); 
                        } else{
                            return res.status(200).send({
                                message: "Nada"
                            });
                        }
                    }
                }
                return res.status(200).send({
                    message: "Nada"
                }); 
            }
            
        });
    },

    //Buscar una crítica de una serie
    getCritica: function (req, res){
        const serieId = req.params.serie;
        const criticaId = req.params.critica;

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            else if(!serie){
                return res.status(404).send({
                    message: "No hay ninguna serie con este identificador en la base de datos"
                });
            }
            else{
                const critica = serie.criticas.id(criticaId);
                console.log(critica);
                if (!critica) {
                    return res.status(404).send({
                        message: "No existe ningúna Crítica con este identificador"
                    });
                }
                console.log(critica);
                return res.status(200).send({
                    critica
                });
            }
            
        });
    },


    //Guardar una crítica nueva en el documento embebido de crítica
    saveCritica: function (params, serie, res) {
        //const params = req.body;
        console.log(params);
        const serieId = params.serieId;
        console.log(serieId);
        const usuarioId = params.usuario;
        const fecha = new Date();
        let notaMedia = 0;

        //Se busca la serie a la que se le pone la crítica
        /*Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error serie"
                });
            } else if (!serie) {
                return res.status(404).send({
                    message: "Esta serie no se encuentra en la plataforma"
                });
            }else {*/
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
            //}
        //});
    },

    //Actualizar la crítica 
    updateCritica: function (req, res) {
        const params = req.body;
        console.log('primero')
        console.log(params);
        const serieId = params.serieId;
        const usuarioId = params.usuario;
        console.log(usuarioId);
        const fecha = new Date();
        let notaMedia = 0;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else {
                Usuario.findById(usuarioId, (err, usuario) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error al mostrar los datos"
                        });
                    } else {
                        serie.criticas.forEach((element, index) => {
                            console.log(element.titulo);
                            if (element.usuario == usuarioId) {
                                serie.criticas.set(index, {
                                    nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                                    texto: params.texto, fecha: fecha, usuario: usuarioId
                                });
                            }
                        });

                        usuario.series.forEach((element, index) => {
                            console.log('Criticas');
                            if (element.serie == serieId) {
                                usuario.series.set(index, {
                                    titulo: serie.titulo, imagen: serie.imagen,
                                    nota: params.nota, serie: serieId
                                });
                            }
                        });
                        console.log('-------');
                        serie.save();
                        usuario.save();
                        notaMedia = notaSerie(serie);
                        notaMedia = redondeo(notaMedia, -1);
                        console.log(notaMedia);
                        let notaUp = {
                            $set: {
                                nota_media: notaMedia
                            }
                        };
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

    //Eliminar la crítica 
    deleteCritica: function (req, res) {
        const serieId = req.params.serie;
        const usuarioId = req.params.usuario;
        let notaMedia = 0;

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else {
                Usuario.findById(usuarioId, (err, usuario) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error al mostrar los datos"
                        });
                    } else {
                        serie.criticas.forEach((element) => {
                            if (element.usuario == usuarioId) {
                                element.remove();
                            }
                        });

                        usuario.series.forEach((element) => {
                            if (element.serie == serieId) {
                                element.remove();
                            }
                        });
                        console.log('-------');
                        serie.save();
                        usuario.save();
                        console.log(notaMedia);
                        notaMedia = notaSerie(serie);
                        if (notaMedia != null) {
                            notaMedia = redondeo(notaMedia, -1);
                        }
                        console.log(notaMedia);
                        let notaUp = {
                            $set: {
                                nota_media: notaMedia
                            }
                        };
                        Serie.findByIdAndUpdate(serieId, notaUp, { new: true }, (err, notaUpdate) => {
                            if (err) {
                                return res.status(500).send({
                                    message: "Error al guardar la nota media"
                                });
                            } else {
                                return res.status(200).send({
                                    message: "Eliminada"
                                });
                            }
                        });

                    }
                });
            }
        });

    },

    //Guardar comentario
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

    saveNota: function(params, serie, res) {
        const usuarioId = params.usuario;
        const fecha = new Date();
        let notaMedia = 0;
        
        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                console.log("cosas");
                return res.status(500).send({
                    message: "Error usuario"
                });
            } else if(!usuario){
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else {
                //Se añade la nota que ha puesto el usuario con sus datos
                serie.criticas.push({
                    nota: params.nota, nick: usuario.nick, fecha: fecha, usuario: usuarioId
                });

                //Se añade los datos de la serie y la nota del usuario
                usuario.series.push({
                    titulo: serie.titulo, imagen: serie.imagen,
                    nota: params.nota, serie: serieId
                });

                serie.save();
                usuario.save();
                notaMedia = notaSerie(serie);
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
    },

    updateNota: function(params, serie, res){
        const usuarioId = params.usuario;
        const fecha = new Date();
        const serieId = params.serieId;
        let notaMedia = 0;

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if(!usuario){
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else {
                serie.criticas.forEach((element, index) => {
                    console.log(element.titulo);
                    if (element.usuario == usuarioId) {
                        if(element.texto != null){
                            serie.criticas.set(index, {
                                nota: params.nota, nick: usuario.nick, titulo: element.titulo,
                                texto: element.texto, fecha: fecha, usuario: usuarioId
                            });
                        } else{
                            serie.criticas.set(index, {
                                nota: params.nota, nick: usuario.nick, fecha: fecha, usuario: usuarioId
                            });
                        }                
                    }
                });

                usuario.series.forEach((element, index) => {
                    console.log('Criticas');
                    if (element.serie == serieId) {
                        usuario.series.set(index, {
                            titulo: serie.titulo, imagen: serie.imagen,
                            nota: params.nota, serie: serieId
                        });
                    }
                });
                console.log('-------');
                serie.save();
                usuario.save();
                notaMedia = notaSerie(serie);
                notaMedia = redondeo(notaMedia, -1);
                console.log(notaMedia);
                let notaUp = {
                    $set: {
                        nota_media: notaMedia
                    }
                };
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
    },

    middlewareCritica: function(req, res){
        const params = req.body;
        console.log(params);
        const serieId = params.serieId;
        const usuarioId = params.usuario;
        console.log(usuarioId);
        let status = 'new';

        if (usuarioId != req.usuario.sub) {
            console.log(req.usuario.sub);
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error serie"
                });
            } 
            else if (!serie) {
                return res.status(404).send({
                    message: "Esta serie no se encuentra en la plataforma"
                });
            }
            else{
                for (let i = 0; i < serie.criticas.length; i++) {
                    if (serie.criticas[i].usuario == usuarioId) {
                        status = 'update';
                        if (serie.criticas[i].texto != null) {
                            status = 'false';
                            break;
                        }
                        break;
                    }
                }
            }
            if(status == 'new'){
                controller.saveCritica(params, serie, res);
                //this.saveCritica(params, serie, res);
            }
            if(status == 'update'){
                controller.updateCritica(req, res);
            }
            if(status == 'false'){
                return res.status(404).send({
                    message: "Este usuario ya tiene escrita una crítica"
                });
            }
        });
    },

    middlewareNota: function(req, res) {
        const params = req.body;
        const usuarioId = params.usuario;
        const serieId = params.serieId;
        let status = 'new';
         
        if (usuarioId != req.usuario.sub) {
            console.log(req.usuario.sub);
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error serie"
                });
            } 
            else if (!serie) {
                return res.status(404).send({
                    message: "Esta serie no se encuentra en la plataforma"
                });
            }
            else{
                for (let i = 0; i < serie.criticas.length; i++) {
                    if (serie.criticas[i].usuario == usuarioId) {
                        status = 'update';
                        break;
                    }
                }
            }
            if(status == 'new'){
                controller.saveNota(params, serie, res);
                //this.saveCritica(params, serie, res);
            }
            if(status == 'update'){
                controller.updateNota(params, serie, res);
            }
        });
    }

};

module.exports = controller;