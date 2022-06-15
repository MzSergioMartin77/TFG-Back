'use strict'

const Pelicula = require('../models/pelicula');
const Usuario = require('../models/usuario');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

function redondeo(value, exp) {
    value = +value;
    exp = +exp;

    value = value.toString().split('e');
    value = Math['round'](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));

    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

function notaPelicula(pelicula) {
    let notas = 0;
    let n = 0;
    console.log(pelicula.criticas.length);
    if (pelicula.criticas.length == 0) {
        console.log("entra");
        return null;
    } else {
        pelicula.criticas.forEach(element => {
            notas = notas + element.nota;
            n++;
        });
        return notas / n;
    }
}

const controller = {

    //Buscar una película por el identificador
    getIdPeli: function (req, res) {
        const peliId = req.params.id;

        Pelicula.findById(peliId, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (!pelicula) {
                return res.status(404).send({
                    message: "No existe ningúna Película con este identificador"
                });
            }
            return res.status(200).send({
                pelicula
            });
        });
    },

    //Buscar una película por el título
    getTituloPeli: function (req, res) {
        const tituloparam = req.params.titulo;

        Pelicula.find({ titulo: tituloparam }, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (pelicula == "") {
                return res.status(404).send({
                    message: "No existe ningúna Película con este título"
                });
            }
            return res.status(200).send({
                pelicula
            });
        });
    },

    getBuscarPeli: function (req, res) {
        const tituloparam = req.params.titulo;
        let buscar = "(?i)^" + tituloparam;

        Pelicula.find({
            $or: [
                { $text: { $search: tituloparam, $diacriticSensitive: false } },
                { titulo: { $regex: buscar } }
            ]
        }, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (pelicula == "") {
                return res.status(404).send({
                    message: "No existe ningúna Película con este título"
                });
            }
            return res.status(200).send({
                pelicula
            });
        });
    },

    //Buscar películas por el genero
    getBuscarPeliG: function (req, res) {
        let generoparam = req.params.genero;
        console.log(generoparam);
        if(generoparam === 'accion'){
            generoparam = 'acción'
        }
        if(generoparam === 'ciencia ficcion'){
            generoparam = 'ciencia ficción'
        }
        if(generoparam === 'fantasia'){
            generoparam = 'fantasía'
        }
        if(generoparam === 'animacion'){
            generoparam = 'animación'
        }
        Pelicula.find({
           generos: { $regex: "(?i)"+generoparam }
        }, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (pelicula == "") {
                return res.status(404).send({
                    message: "No existe ningúna Película de este género"
                });
            }
            return res.status(200).send({
                pelicula
            });
        });
    },

    //Coge las 6 películas más nuevas 
    getPeliculas: function (req, res) {

        Pelicula.find({}).sort({ "fecha_estreno": -1 }).limit(6).exec((err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (!pelicula) {
                return res.status(404).send({
                    message: "No hay ninguna película en la base de datos"
                });
            }
            return res.status(200).send({
                pelicula
            });
        });
    },

    //Coge las 6 películas con mejor nota media
    getPelisP: function (req, res) {

        Pelicula.find({}).sort({ "nota_media": -1 }).limit(6).exec((err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (!pelicula) {
                return res.status(404).send({
                    message: "No hay ninguna película en la base de datos"
                });
            }
            return res.status(200).send({
                pelicula
            });
        });
    },

    getCriticaUser: function (req, res) {
        const peliId = req.params.pelicula;
        const userId = req.params.usuario;

        Pelicula.findById(peliId, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if (!pelicula) {
                return res.status(404).send({
                    message: "No hay ninguna película en la base de datos"
                });
            }
            else {
                for (let i = 0; i < pelicula.criticas.length; i++) {
                    if (pelicula.criticas[i].usuario == userId) {
                        if (pelicula.criticas[i].texto != null) {
                            return res.status(200).send({
                                critica: pelicula.criticas[i]
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

    getCritica: function (req, res) {
        const peliId = req.params.pelicula;
        const criticaId = req.params.critica;

        Pelicula.findById(peliId, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if (!pelicula) {
                return res.status(404).send({
                    message: "No hay ninguna película en la base de datos"
                });
            }
            else {
                const critica = pelicula.criticas.id(criticaId);
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

    saveCritica: function (params, pelicula, res) {
        const peliId = params.peliculaId;
        const usuarioId = params.usuario;
        const fecha = new Date();
        let notaMedia = 0;


        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                console.log("cosas");
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if (!usuario) {
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else {
                console.log('entra');
                pelicula.criticas.push({
                    nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                    texto: params.texto, fecha: fecha, usuario_model: usuario.id_model, usuario: usuarioId
                });

                usuario.peliculas.push({
                    titulo: pelicula.titulo, imagen: pelicula.imagen,
                    nota: params.nota, id_model: pelicula.id_model, pelicula: peliId
                });
                pelicula.save();
                usuario.save();
                notaMedia = notaPelicula(pelicula);
                notaMedia = redondeo(notaMedia, -1);
                console.log(notaMedia);
                Pelicula.findByIdAndUpdate(peliId, { nota_media: notaMedia }, { new: true }, (err, notaUpdate) => {
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

    updateCritica: function (req, res) {
        const params = req.body;
        const peliId = params.peliculaId;
        const usuarioId = params.usuario;
        const fecha = new Date();
        let notaMedia = 0;
        let status = false;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }
        console.log('primero');
        Pelicula.findById(peliId, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if (!pelicula) {
                return res.status(404).send({
                    message: "Esta película no se encuentra en la plataforma"
                });
            } else {
                for (let i = 0; i < pelicula.criticas.length; i++) {
                    if (pelicula.criticas[i].usuario == usuarioId) {
                        status = true;
                        break;
                    }
                }
                if (!status) {
                    return res.status(404).send({
                        message: "Este usuario no ha escrito una crítica en esta película"
                    });
                }
                console.log('cont');
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
                        for (let i = 0; i < pelicula.criticas.length; i++) {
                            if (pelicula.criticas[i].usuario == usuarioId) {
                                pelicula.criticas.set(i, {
                                    nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                                    texto: params.texto, fecha: fecha, usuario_model: usuario.id_model, usuario: usuarioId
                                });
                                break;
                            }
                        }

                        for (let i = 0; i < usuario.peliculas.length; i++) {
                            if (usuario.peliculas[i].pelicula == peliId) {
                                usuario.peliculas.set(i, {
                                    titulo: pelicula.titulo, imagen: pelicula.imagen,
                                    nota: params.nota, id_model: pelicula.id_model, pelicula: peliId
                                });
                                break;
                            }
                        }
                        console.log('-------');
                        pelicula.save();
                        usuario.save();
                        notaMedia = notaPelicula(pelicula);
                        notaMedia = redondeo(notaMedia, -1);
                        console.log(notaMedia);
                        Pelicula.findByIdAndUpdate(peliId, { nota_media: notaMedia }, { new: true }, (err, notaUpdate) => {
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

    deleteCritica: function (req, res) {
        const peliId = req.params.pelicula;
        const usuarioId = req.params.usuario;
        let notaMedia = 0;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }

        Pelicula.findById(peliId, (err, pelicula) => {
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
                        pelicula.criticas.forEach((element) => {
                            if (element.usuario == usuarioId) {
                                element.remove();
                            }
                        });

                        usuario.peliculas.forEach((element) => {
                            if (element.pelicula == peliId) {
                                element.remove();
                            }
                        });
                        console.log('-------');
                        pelicula.save();
                        usuario.save();
                        console.log(notaMedia);
                        notaMedia = notaPelicula(pelicula);
                        if (notaMedia != null) {
                            notaMedia = redondeo(notaMedia, -1);
                        }
                        console.log(notaMedia);
                        let notaUp = {
                            $set: {
                                nota_media: notaMedia
                            }
                        };
                        Pelicula.findByIdAndUpdate(peliId, notaUp, { new: true }, (err, notaUpdate) => {
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

    saveComentario: function (req, res) {
        const params = req.body;
        console.log(params);
        const peliId = params.peliculaId;
        const usuarioId = params.usuarioId;
        const fecha = new Date();

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir un comentario"
            });
        }

        Pelicula.findById(peliId, (err, pelicula) => {
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
                        pelicula.comentarios.push({
                            usuario: usuarioId, nick: usuario.nick, texto: params.texto,
                            fecha: fecha, editado: false
                        });
                        pelicula.save();
                        return res.status(200).send({
                            message: "Guardado"
                        });
                    }
                });
            }
        });
    },


    updateComentario: function (req, res) {
        const params = req.body;
        const comentario = params.comentarioId;
        const peliId = params.peliculaId;
        const usuarioId = params.usuarioId;
        const fecha = new Date();
        let status = false;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir un comentario"
            });
        }

        Pelicula.findById(peliId, (err, pelicula) => {
            console.log('-----')
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            else if (!pelicula) {
                return res.status(404).send({
                    message: "No se ha encontrado la película"
                });
            }
            else {
                console.log('prueba')
                /*for(let i=0; i<pelicula.comentarios; i++){
                    if (pelicula.comenatios[i]._id == comentario && pelicula.comentarios[i].usuario == usuarioId) {
                        console.log('entramos');
                        pelicula.comentarios.set(i, {_id: comentario, usuario: usuarioId, nick: element.nick,
                            texto: params.texto, fecha: fecha, editado: true });
                        status = true;
                    }      
                }*/

                pelicula.comentarios.forEach((element, i) => {
                    if (element._id == comentario && element.usuario == usuarioId) {
                        console.log(element._id)
                        pelicula.comentarios.set(i, {
                            _id: comentario, usuario: usuarioId, nick: element.nick,
                            texto: params.texto, fecha: fecha, editado: true
                        })
                        status = true;
                    }
                });

                if (status == true) {
                    console.log('entra')
                    pelicula.save();
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

    deleteComentario: function (req, res) {
        const peliId = req.params.pelicula;
        const usuarioId = req.params.usuario;
        const comentario = req.params.comentario;
        let status = false;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }

        Pelicula.findById(peliId, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else {
                /*for (let i = 0; i < pelicula.comentarios; i++) {
                    if (pelicula.comenatios[i]._id == comentario && pelicula.comentarios[i].usuario == usuarioId) {
                        element.remove();
                        console.log('elimina')
                        status = true;
                        break;
                    }
                }*/

                pelicula.comentarios.forEach((element) => {
                    if (element._id == comentario && element.usuario == usuarioId) {
                        console.log(element._id)
                        element.remove();
                        console.log('elimina')
                        status = true;
                    }
                });

                if (status == true) {
                    console.log('entra')
                    pelicula.save();
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

    //Guardar la nota que pone el usuario a una película
    saveNota: function (params, pelicula, res) {
        const usuarioId = params.usuario;
        const peliId = params.peliculaId;
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
                pelicula.criticas.push({
                    nota: params.nota, nick: usuario.nick, fecha: fecha,
                    usuario_model: usuario.id_model, usuario: usuarioId
                });

                //Se añade los datos de la serie y la nota del usuario
                usuario.peliculas.push({
                    titulo: pelicula.titulo, imagen: pelicula.imagen,
                    nota: params.nota, id_model: pelicula.id_model, pelicula: peliId
                });

                pelicula.save();
                usuario.save();
                notaMedia = notaPelicula(pelicula);
                notaMedia = redondeo(notaMedia, -1);
                let notaUp = {
                    $set: {
                        nota_media: notaMedia
                    }
                };
                //Se actualiza la nota media de la serie
                Pelicula.findByIdAndUpdate(peliId, notaUp, { new: true }, (err, notaUpdate) => {
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
    updateNota: function (params, pelicula, res) {
        const usuarioId = params.usuario;
        const fecha = new Date();
        const peliId = params.peliculaId;
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
                for (let i = 0; i < pelicula.criticas.length; i++) {
                    if (pelicula.criticas[i].usuario == usuarioId) {
                        if (pelicula.criticas[i].texto != null) {
                            pelicula.criticas.set(i, {
                                nota: params.nota, nick: usuario.nick, titulo: pelicula.criticas[i].titulo,
                                texto: pelicula.criticas[i].texto, fecha: fecha, usuario_model: usuario.id_model, usuario: usuarioId
                            });
                        }
                        else {
                            pelicula.criticas.set(i, {
                                nota: params.nota, nick: usuario.nick, fecha: fecha,
                                usuario_model: usuario.id_model, usuario: usuarioId
                            });
                        }
                        break;
                    }
                }

                for (let i = 0; i < usuario.peliculas.length; i++) {
                    if (usuario.peliculas[i].pelicula == peliId) {
                        usuario.peliculas.set(i, {
                            titulo: pelicula.titulo, imagen: pelicula.imagen,
                            nota: params.nota, id_model: pelicula.id_model, pelicula: peliId
                        });
                        break;
                    }
                }

                console.log('-------');
                pelicula.save();
                usuario.save();
                notaMedia = notaPelicula(pelicula);
                notaMedia = redondeo(notaMedia, -1);
                console.log(notaMedia);
                let notaUp = {
                    $set: {
                        nota_media: notaMedia
                    }
                };
                Pelicula.findByIdAndUpdate(peliId, notaUp, { new: true }, (err, notaUpdate) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error al guardar la nota media"
                        });
                    } else {
                        console.log('salta')
                        return res.status(200).send({
                            message: "Guardado"
                        });
                    }
                });

            }
        });
    },

    deleteNota: function (params, pelicula, res) {
        const usuarioId = params.usuario;
        const peliId = params.peliculaId;
        let notaMedia = 0;
        console.log('eliminar')

        /*function cambioNota() {
            console.log(notaMedia);
            notaMedia = notaPelicula(pelicula);
            if (notaMedia != null) {
                notaMedia = redondeo(notaMedia, -1);
            }
            console.log(notaMedia);
            let notaUp = {
                $set: {
                    nota_media: notaMedia
                }
            };
            Pelicula.findByIdAndUpdate(peliId, notaUp, { new: true }, (err, notaUpdate) => {
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

        function deleteN() {
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
                    pelicula.criticas.forEach((element) => {
                        if (element.usuario == usuarioId) {
                            element.remove();
                            console.log('elminarP')
                        }
                    });

                    usuario.peliculas.forEach((element) => {
                        if (element.pelicula == peliId) {
                            element.remove();
                            console.log('elminarU')
                        }
                    });

                    console.log('-------');
                    pelicula.save();
                    usuario.save();

                    cambioNota();
                }
            });
        }

        deleteN(); */
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
                pelicula.criticas.forEach((element) => {
                    if (element.usuario == usuarioId) {
                        element.remove();
                        console.log('elminarP')
                    }
                });

                usuario.peliculas.forEach((element) => {
                    if (element.pelicula == peliId) {
                        element.remove();
                        console.log('elminarU')
                    }
                });

                console.log('-------');
                pelicula.save();
                usuario.save();

                console.log(notaMedia);
                notaMedia = notaPelicula(pelicula);
                if (notaMedia != null) {
                    notaMedia = redondeo(notaMedia, -1);
                }
                console.log(notaMedia);
                let notaUp = {
                    $set: {
                        nota_media: notaMedia
                    }
                };
                Pelicula.findByIdAndUpdate(peliId, notaUp, { new: true }, (err, notaUpdate) => {
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
        const peliId = params.peliculaId;
        const usuarioId = params.usuario;
        console.log(usuarioId);
        let status = 'new';

        if (usuarioId != req.usuario.sub) {
            console.log(req.usuario.sub);
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }

        Pelicula.findById(peliId, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error pelicula"
                });
            }
            else if (!pelicula) {
                return res.status(404).send({
                    message: "Esta película no se encuentra en la plataforma"
                });
            }
            else {
                for (let i = 0; i < pelicula.criticas.length; i++) {
                    if (pelicula.criticas[i].usuario == usuarioId) {
                        status = 'update';
                        if (pelicula.criticas[i].texto != null) {
                            status = 'false';
                            break;
                        }
                        break;
                    }
                }
            }
            if (status == 'new') {
                console.log('nueva');
                controller.saveCritica(params, pelicula, res);
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
        const peliId = params.peliculaId;
        let status = 'new';
        const nota = params.nota;
        console.log(nota);

        if (usuarioId != req.usuario.sub) {
            console.log(req.usuario.sub);
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }

        Pelicula.findById(peliId, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error pelicula"
                });
            }
            else if (!pelicula) {
                return res.status(404).send({
                    message: "Esta película no se encuentra en la plataforma"
                });
            }
            else {
                for (let i = 0; i < pelicula.criticas.length; i++) {
                    if (pelicula.criticas[i].usuario == usuarioId) {
                        status = 'update';
                        break;
                    }
                }
            }
            if (nota == 'No vista') {

                pelicula.criticas.forEach((element) => {
                    if (element.usuario == usuarioId) {
                        if (element.texto != null) {
                            status = 'false';
                        }
                    }
                });

                /*for (let i = 0; i < pelicula.criticas.length; i++) {
                    if (pelicula.criticas[i].usuario == usuarioId) {
                        if (pelicula.criticas[i].texto != null) {
                            status = 'false';
                            break;
                        }
                        break;
                    }
                }*/
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
                        controller.deleteNota(params, pelicula, res)
                    }
                }
            }
            if (status == 'new') {
                controller.saveNota(params, pelicula, res);
            }
            if (status == 'update') {
                controller.updateNota(params, pelicula, res);
            }
        });
    }

};

module.exports = controller;