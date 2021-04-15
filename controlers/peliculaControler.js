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
        let buscar = "(?i)" + tituloparam;

        Pelicula.find({ titulo: { $regex: buscar } }, (err, pelicula) => {
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

    saveCritica: function (req, res) {
        const params = req.body;
        const peliId = params.peliculaId;
        const usuarioId = params.usuarioId;
        const fecha = new Date();
        let notaMedia = 0;
        let status = true;

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
            } else if (!pelicula) {
                return res.status(404).send({
                    message: "Esta película no se encuentra en la plataforma"
                });
            }
            else {
                for (let i = 0; i < pelicula.criticas.length; i++) {
                    if (pelicula.criticas[i].usuario == usuarioId) {
                        if (pelicula.criticas[i].texto != null) {
                            status = false;
                            break;
                        }
                    }
                }
                if (!status) {
                    return res.status(404).send({
                        message: "Este usuario ya tiene escrita una crítica de esta película"
                    });
                } 
                else { 
                    Usuario.findById(usuarioId, (err, usuario) => {
                        if (err) {
                            console.log("cosas");
                            return res.status(500).send({
                                message: "Error al mostrar los datos"
                            });
                        } else if(!usuario){
                            return res.status(404).send({
                                message: "Este usuario no se encuentra en la plataforma"
                            });
                        } else {
                            pelicula.criticas.push({
                                nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                                texto: params.texto, fecha: fecha, usuario: usuarioId
                            });

                            usuario.peliculas.push({
                                titulo: pelicula.titulo, imagen: pelicula.imagen,
                                nota: params.nota, pelicula: peliId
                            });
                            pelicula.save();
                            usuario.save();
                            notaMedia = notaPelicula(pelicula);
                            notaMedia = redondeo(notaMedia, -1);
                            console.log(notaMedia);
                            Pelicula.findByIdAndUpdate(peliId, {nota_media: notaMedia}, { new: true }, (err, notaUpdate) => {
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
            }
        });
    },

    updateCritica: function (req, res) {
        const params = req.body;
        const peliId = params.peliculaId;
        const usuarioId = params.usuarioId;
        const fecha = new Date();
        let notaMedia = 0;
        let status = false;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para escribir una crítica"
            });
        }
        console.log('primero')
        Pelicula.findById(peliId, (err, pelicula) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            } else if(!pelicula){
                return res.status(404).send({
                    message: "Esta película no se encuentra en la plataforma"
                });
            } else {
                for (let i = 0; i < pelicula.criticas.length; i++) {
                    if (pelicula.criticas[i].usuario == usuarioId) {
                        if (pelicula.criticas[i].texto != null) {
                            status = true;
                            break;
                        }
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
                    } else if(!usuario){
                        return res.status(404).send({
                            message: "Este usuario no se encuentra en la plataforma "
                        });
                    } else {
                        for (let i = 0; i < pelicula.criticas.length; i++) {
                            if (pelicula.criticas[i].usuario == usuarioId) {
                                if (pelicula.criticas[i].texto != null) {
                                    pelicula.criticas.set(i, {
                                        nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                                        texto: params.texto, fecha: fecha, usuario: usuarioId
                                    });
                                    break;
                                }
                            }
                        }
                        /*pelicula.criticas.forEach((element, index) => {
                            console.log(element.titulo);
                            if (element.usuario == usuarioId) {
                                pelicula.criticas.set(index, {
                                    nota: params.nota, nick: usuario.nick, titulo: params.titulo,
                                    texto: params.texto, fecha: fecha, usuario: usuarioId
                                });
                            }
                        });*/

                        for(let i=0; i<usuario.peliculas.length; i++){
                            if(usuario.peliculas[i].pelicula == peliId){
                                usuario.peliculas.set(i, {
                                    titulo: pelicula.titulo, imagen: pelicula.imagen,
                                    nota: params.nota, pelicula: peliId
                                });
                                break;
                            }
                        }
                        /*usuario.peliculas.forEach((element, index) => {
                            if (element.pelicula == peliId) {
                                usuario.peliculas.set(index, {
                                    titulo: pelicula.titulo, imagen: pelicula.imagen,
                                    nota: params.nota, pelicula: peliId
                                });
                            }
                        });*/
                        console.log('-------');
                        pelicula.save();
                        usuario.save();
                        notaMedia = notaPelicula(pelicula);
                        notaMedia = redondeo(notaMedia, -1);
                        console.log(notaMedia);
                        Pelicula.findByIdAndUpdate(peliId, {nota_media: notaMedia}, { new: true }, (err, notaUpdate) => {
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
                        console.log("cosas");
                        return res.status(500).send({
                            message: "Error al mostrar los datos"
                        });
                    } else {
                        pelicula.comentarios.push({ nick: usuario.nick, texto: params.texto, fecha: fecha, usuario: usuarioId });
                        pelicula.save();
                        return res.status(200).send({
                            message: "Guardado"
                        });
                    }
                });
            }
        });
    }

};

module.exports = controller;