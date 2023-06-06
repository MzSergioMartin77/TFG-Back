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
    if (serie.criticas.length == 0) {
        return null;
    }
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
        let buscar = "(?i)^" + tituloparam;

        Serie.find({ $or: [
            {$text: {$search: tituloparam, $diacriticSensitive: false}},
            {titulo: {$regex: buscar}}
        ] }, (err, serie) => {
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

    //Buscar series por el genero
    getBuscarSerieG: function (req, res) {
        let generoparam = req.params.genero;
        console.log(generoparam);
        if(generoparam === 'accion'){
            generoparam = 'acción'
        }
        if(generoparam === 'ciencia ficcion'){
            generoparam = 'ciencia ficción'
        }
        if(generoparam === 'fantasia'){
            generoparam = 'fantástico'
        }
        if(generoparam === 'animacion'){
            generoparam = 'animación'
        }
        Serie.find({
           generos: { $regex: "(?i)"+generoparam }
        }, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (serie == "") {
                return res.status(404).send({
                    message: "No existe ningúna Serie de este género"
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

    //Coge las 6 series con más nota
    getSeriesP: function (req, res) {

        Serie.find({}).sort({ "nota_media": -1 }).limit(6).exec((err, serie) => {
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
    getCriticaUser: function (req, res) {
        const serieId = req.params.serie;
        const userId = req.params.usuario;

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if (!serie) {
                return res.status(404).send({
                    message: "No hay ninguna serie con este identificador en la base de datos"
                });
            }
            else {
                for (let i = 0; i < serie.criticas.length; i++) {
                    if (serie.criticas[i].usuario == userId) {
                        if (serie.criticas[i].texto != null) {
                            return res.status(200).send({
                                critica: serie.criticas[i]
                            });
                        } else {
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
    getCritica: function (req, res) {
        const serieId = req.params.serie;
        const criticaId = req.params.critica;

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            else if (!serie) {
                return res.status(404).send({
                    message: "No hay ninguna serie con este identificador en la base de datos"
                });
            }
            else {
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

        //Se busca al usuario que escribe la crítica
        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                console.log("cosas");
                return res.status(500).send({
                    message: "Error usuario"
                });
            } else if (!usuario) {
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else {
                //Se añaden los datos de la crítica a la serie
                serie.criticas.push({
                    nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                    texto: params.texto, fecha: fecha, usuario_model: usuario.id_model, usuario: usuarioId
                });

                //Se añade los datos de la crítica al usuario
                usuario.series.push({
                    titulo: serie.titulo, imagen: serie.imagen,
                    nota: params.nota, id_model: serie.id_model, serie: serieId
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
        let status = false;

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
            } else if (!serie) {
                return res.status(404).send({
                    message: "Esta película no se encuentra en la plataforma"
                });
            }
            else {
                for (let i = 0; i < serie.criticas.length; i++) {
                    if (serie.criticas[i].usuario == usuarioId) {
                        status = true;
                        break;
                    }
                }
                if (!status) {
                    return res.status(404).send({
                        message: "Este usuario no ha escrito una crítica en esta película"
                    });
                }
                Usuario.findById(usuarioId, (err, usuario) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error al mostrar los datos"
                        });
                    } else if (!usuario) {
                        return res.status(404).send({
                            message: "Este usuario no se encuentra en la plataforma "
                        });
                    } else {
                        for (let i = 0; i < serie.criticas.length; i++) {
                            if (serie.criticas[i].usuario == usuarioId) {
                                serie.criticas.set(i, {
                                    nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                                    texto: params.texto, fecha: fecha, usuario_model: usuario.id_model, usuario: usuarioId
                                });
                                break;
                            }
                        }

                        for (let i = 0; i < usuario.peliculas.length; i++) {
                            if (usuario.series[i].serie == serieId) {
                                usuario.series.set(i, {
                                    titulo: serie.titulo, imagen: serie.imagen,
                                    nota: params.nota, id_model: serie.id_model, serie: serieId
                                });
                                break;
                            }
                        }

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
    deleteCritica: async function (req, res) {
        const serieId = req.params.serie;
        const usuarioId = req.params.usuario;
        const criticaId = req.params.critica;
        let notaMedia = 0;
        let userCritica;
        let userCriticaId;
        let status = false;
        console.log(criticaId);

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para eliminar una crítica"
            });
        }

        let user = await Usuario.findById(usuarioId, (err, usuario) => {
            if (usuario) {
                return usuario;
            }
            
            return res.status(500).send({
                message: "Error al mostrar los datos"
            });
        });

        let serie = await Serie.findById(serieId, (err, serie) => {
            if (serie) {
                return serie;
            }

            return res.status(500).send({
                message: "Error al mostrar los datos"
            });
        });

        serie.criticas.forEach((element) => {
            if (element._id == criticaId){
                if (element.usuario == usuarioId || user.rol == 'admin') {
                    userCriticaId = element.usuario;
                    console.log(userCritica);
                    element.remove();
                    status = true;
                }
            }
        })

        if (status) {
            if (user.rol == 'admin') {
                userCritica = await Usuario.findById(userCriticaId, (err, usuario) => {
                    if (usuario) {
                        return usuario;
                    }
                    
                    return res.status(500).send({
                        message: "Error al mostrar los datos"
                    });
                });
            } else { userCritica = user; }

            userCritica.series.forEach((element) => {
                if (element.serie == serieId) {
                    element.remove();
                }
            })

            serie.save();
            userCritica.save();
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
        } else {
            return res.status(500).send({
                message: "La crítica no existe o no pertenece al usuario"
            });
        }
    },

    //Guardar comentario
    saveComentario: function (req, res) {
        const params = req.body;
        console.log(params);
        const serieId = params.serieId;
        const usuarioId = params.usuarioId;
        const fecha = new Date();

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir un comentario"
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
                        console.log("cosas");
                        return res.status(500).send({
                            message: "Error al mostrar los datos"
                        });
                    } else {
                        serie.comentarios.push({
                            usuario: usuarioId, nick: usuario.nick, texto: params.texto,
                            fecha: fecha, editado: false
                        });

                        serie.save();
                        return res.status(200).send({
                            message: "Guardado"
                        });
                    }
                });
            }
        });
    },

    //Actualizar un comentario 
    updateComentario: function (req, res) {
        const params = req.body;
        const comentario = params.comentarioId;
        const serieId = params.serieId;
        const usuarioId = params.usuarioId;
        const fecha = new Date();
        let status = false;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir un comentario"
            });
        }

        Serie.findById(serieId, (err, serie) => {
            console.log('-----')
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            else if (!serie) {
                return res.status(404).send({
                    message: "No se ha encontrado la película"
                });
            }
            else {
                console.log('prueba')

                serie.comentarios.forEach((element, i) => {
                    if (element._id == comentario && element.usuario == usuarioId) {
                        console.log(element._id)
                        serie.comentarios.set(i, {
                            _id: comentario, usuario: usuarioId, nick: element.nick,
                            texto: params.texto, fecha: fecha, editado: true
                        })
                        status = true;
                    }
                });

                if (status == true) {
                    console.log('entra')
                    serie.save();
                    return res.status(200).send({
                        message: "Modificado"
                    });
                } else {
                    return res.status(404).send({
                        message: "Este usuario no ha escrito este comentario"
                    });
                }
            }
        });

    },

    //Eliminar un comentario
    deleteComentario: async function (req, res) {
        const serieId = req.params.serie;
        const usuarioId = req.params.usuario;
        const comentario = req.params.comentario;
        let status = false;
        let user = new Usuario();

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }

        user = await Usuario.findById(usuarioId, (err, usuario) => {
            if (usuario) {
                return usuario;
            }
            
            return res.status(500).send({
                message: "Error al mostrar los datos"
            });
        });

        Serie.findById(serieId, (err, serie) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else {
                serie.comentarios.forEach((element) => {
                    if (element._id == comentario) {
                        if (element.usuario == usuarioId || user.rol == 'admin'){
                            element.remove();
                            status = true;
                        }
                        
                    }
                });

                if (status == true) {
                    console.log('entra')
                    serie.save();
                    return res.status(200).send({
                        message: "Eliminado"
                    });
                } else {
                    return res.status(404).send({
                        message: "Este usuario no ha escrito este comentario o no existe el comentario"
                    });
                }
            }
        });
    },


    //Guardar la nota que pone el usuario a una serie
    saveNota: function (params, serie, res) {
        const usuarioId = params.usuario;
        const serieId = params.serieId;
        const fecha = new Date();
        let notaMedia = 0;

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                console.log("cosas");
                return res.status(500).send({
                    message: "Error usuario"
                });
            } else if (!usuario) {
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else {
                //Se añade la nota que ha puesto el usuario con sus datos
                serie.criticas.push({
                    nota: params.nota, nick: usuario.nick, fecha: fecha, 
                    usuario_model: usuario.id_model, usuario: usuarioId
                });

                //Se añade los datos de la serie y la nota del usuario
                usuario.series.push({
                    titulo: serie.titulo, imagen: serie.imagen,
                    nota: params.nota, id_model: serie.id_model, serie: serieId
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

    //Actualizar la nota que pone el usuario a una serie 
    updateNota: function (params, serie, res) {
        const usuarioId = params.usuario;
        const fecha = new Date();
        const serieId = params.serieId;
        let notaMedia = 0;

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if (!usuario) {
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else {
                for (let i = 0; i < serie.criticas.length; i++) {
                    if (serie.criticas[i].usuario == usuarioId) {
                        if (serie.criticas[i].texto != null) {
                            serie.criticas.set(i, {
                                nota: params.nota, nick: usuario.nick, titulo: serie.criticas[i].titulo,
                                texto: serie.criticas[i].texto, fecha: fecha, usuario_model: usuario.id_model, usuario: usuarioId
                            });
                        }
                        else {
                            serie.criticas.set(i, {
                                nota: params.nota, nick: usuario.nick, fecha: fecha, 
                                usuario_model: usuario.id_model, usuario: usuarioId
                            });
                        }
                        break;
                    }
                }

                for (let i = 0; i < usuario.series.length; i++) {
                    if (usuario.series[i].serie == serieId) {
                        usuario.series.set(i, {
                            titulo: serie.titulo, imagen: serie.imagen,
                            nota: params.nota, id_model: serie.id_model, serie: serieId
                        });
                        break;
                    }
                }

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

    //Función para borrar la nota de una crítica 
    deleteNota: function (params, serie, res) {
        const usuarioId = params.usuario;
        const serieId = params.serieId;
        let notaMedia = 0;
        console.log('eliminar')

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if (!usuario) {
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else {
                serie.criticas.forEach((element) => {
                    if (element.usuario == usuarioId) {
                        element.remove();
                        console.log('elminarP')
                    }
                });

                usuario.series.forEach((element) => {
                    if (element.serie == serieId) {
                        element.remove();
                        console.log('elminarU')
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
    },

    // Función que se realizar antes de guardar una crítica para comprobar si el usuario ya ha puesto una nota o no
    middlewareCritica: function (req, res) {
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
            else {
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
            if (status == 'new') {
                controller.saveCritica(params, serie, res);
            }
            if (status == 'update') {
                controller.updateCritica(req, res);
            }
            if (status == 'false') {
                return res.status(404).send({
                    message: "Este usuario ya tiene escrita una crítica"
                });
            }
        });
    },

    // Función que se realiza antes de poner una nota para saber si el usuario ya ha escrito una crítica o no
    middlewareNota: function (req, res) {
        const params = req.body;
        const usuarioId = params.usuario;
        const serieId = params.serieId;
        let status = 'new';
        const nota = params.nota;

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
            else {
                for (let i = 0; i < serie.criticas.length; i++) {
                    if (serie.criticas[i].usuario == usuarioId) {
                        status = 'update';
                        break;
                    }
                }
            }

            if (nota == 'No vista') {

                serie.criticas.forEach((element) => {
                    if (element.usuario == usuarioId) {
                        if (element.texto != null) {
                            status = 'false';
                        }
                    }
                });

                if (status == 'false') {
                    return res.status(200).send({
                        message: "Error-nota"
                    });
                } else {
                    if (status == 'new') {
                        return res.status(200).send({
                            message: "No se guarda la nota"
                        });
                    } else {
                        status = 'true';
                        controller.deleteNota(params, serie, res)
                    }
                }
            }


            if (status == 'new') {
                controller.saveNota(params, serie, res);
            }
            if (status == 'update') {
                controller.updateNota(params, serie, res);
            }
        });
    }

};

module.exports = controller;