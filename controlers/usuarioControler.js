'use strict'

const Usuario = require('../models/usuario');
const Serie = require('../models/serie');
const Pelicula = require('../models/pelicula');
const modelo = require('../model_tf/modelo');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
const bcrypt = require('bcrypt');
const rondas = 10;
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');
const pelicula = require('../models/pelicula');
//const userModel = 25;

function criticasUser(usuario, criticas) {
    console.log('las criticas')
    console.log(usuario._id)

    return new Promise((resolve) => {
        console.log('promesa')
        usuario.peliculas.forEach(element => {
            criticas.push(element.id_model)
        });
        usuario.series.forEach(element => {
            criticas.push(element.id_model)
        });

        resolve(criticas);
    })
}

function buscarRecom(recom, recomendaciones, res) {
    console.log('primero')
    //console.log(recom)
    let x = 0;
    for (let i in recom) {
        //console.log(recom[i].id_model)
        Pelicula.find({ id_model: recom[i].id_model }, (err, peli) => {
            if (err) {
                console.log('Se ha producido un error')
            }
            if (peli != '') {
                console.log(peli[0].titulo)
                recomendaciones.push({ id: peli[0]._id, titulo: peli[0].titulo, imagen: peli[0].imagen, tipo: 'pelicula' });
            }
        })
        Serie.find({ id_model: recom[i].id_model }, (err, serie) => {
            if (err) {
                console.log('Se ha producido un error')
            }
            if (serie != '') {
                console.log(serie[0].titulo)
                recomendaciones.push({ id: serie[0]._id, titulo: serie[0].titulo, imagen: serie[0].imagen, tipo: 'serie' });
            }
            x += 1;
            console.log(x);
            if (x == recom.length) {
                return res.status(200).send({
                    recomendaciones
                })
            }
        })

    }
    /*for (let j = 0; j < recom.length; j++) {
        Serie.find({ id_model: recom[j].id_model }, (err, serie) => {
            if (err) {
                console.log('Se ha producido un error')
            }
            if (serie != '') {
                //console.log(serie)
                recomendaciones.push({ id: serie[0]._id, titulo: serie[0].titulo, imagen: serie[0].imagen, tipo: 'serie' });
            }
        })
    }*/

}

const controller = {

    pruebas: function (req, res) {
        return res.status(200).send({ message: 'Prueba de funcionamiento' });
    },

    saveUsuario: function (req, res) {
        const params = req.body;
        const usuario = new Usuario();

        if (params.nombre && params.nick && params.email && params.pass) {
            Usuario.countDocuments({}, (err, count) => {
                usuario.id_model = count + 1;
            });
            usuario.nombre = params.nombre;
            usuario.nick = params.nick;
            usuario.email = params.email;
            usuario.descripcion = params.descripcion;
            usuario.imagen = null;

            Usuario.find({ email: usuario.email.toLowerCase() }).exec((err, usuarios) => {
                if (err) return res.status(500).send({ message: 'Error al buscar' });

                if (usuarios && usuarios.length >= 1) {
                    return res.status(200).send({ message: 'Email-Error' });
                }
                else {
                    Usuario.find({ nick: usuario.nick }).exec((err, usuarios) => {
                        if (err) return res.status(500).send({ message: 'Error al buscar' });

                        if (usuarios && usuarios.length >= 1) {
                            return res.status(200).send({ message: 'Nick-Error' });
                        }
                        else {
                            /* Se utiliza la libreria bcrypt para realizar un hash sobre la contraseña
                            y la variable rondas inidca el número de hashes que se realizan en ella en 
                            este caso realizamos 10 para que sea más seguro */
                            bcrypt.hash(params.pass, rondas, (err, hash) => {
                                usuario.pass = hash;

                                usuario.save((err, usuarioS) => {
                                    if (err) {
                                        return res.status(500).send({ message: 'Error al guardar el usuario' });
                                    }
                                    if (!usuarioS) {
                                        res.status(404).send({ message: 'El usuario no se ha registrado' });
                                    }
                                    else {
                                        res.status(200).send({ usuario: usuarioS });
                                    }
                                });
                            });
                        }
                    });
                }
            })

        }
        else {
            res.status(200).send({
                message: 'Completa todos los campos obligatorios'
            });
        }
    },

    usuarioLogin: function (req, res) {
        const params = req.body;

        let email = params.email;
        let pass = params.pass;

        Usuario.findOne({ email: email }, (err, usuario) => {
            if (err) return res.status(500).send({ message: 'Error al realizar la petición' });

            if (usuario) {
                bcrypt.compare(pass, usuario.pass, (err, check) => {
                    if (check) {

                        if (params.token) {
                            //generar y devolver token
                            return res.status(200).send({
                                token: jwt.createToken(usuario)
                            });
                        }
                        else {
                            //Ponemos la contraseña como undefined para que no se pase al front
                            usuario.pass = undefined;
                            return res.status(200).send({ usuario });
                        }

                    }
                    else {
                        return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
                    }
                });
            }
            else {
                return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
            }
        });

    },

    getNickUsuario: function (req, res) {
        const nickparam = req.params.nick;
        let buscar = "(?i)^" + nickparam;
        //Usuario.find({ nick: { $regex: buscar } }, (err, usuario)
        Usuario.find({ $or: [
            {$text: {$search: nickparam, $diacriticSensitive: false} },
            {nick: {$regex: buscar}}
        ]}, (err, usuario) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (usuario == "") {
                return res.status(404).send({
                    message: "No existe ningún Usuario con este nick"
                });
            }
            return res.status(200).send({
                usuario
            });
        });
    },

    getIdUsuario: function (req, res) {
        const userId = req.params.id;

        Usuario.findById(userId, (err, usuario) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            if (!usuario) {
                return res.status(404).send({
                    message: "No existe ningúna usuario con este identificador"
                });
            }
            return res.status(200).send({
                usuario
            });
        });
    },

    updateUsuario: function (req, res) {
        const userId = req.params.id;
        let update = req.body;

        if (userId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para modificar los datos"
            });
        }

        delete update.pass;
        delete update.nick;

        if(update.nombre == ''){
            delete update.nombre;
        }

        if(update.email == ''){
            delete update.email;
            updateUser();
        } else {
            console.log(update.email.toLowerCase())
            Usuario.find({ email: update.email.toLowerCase() }, (err, usuario) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error al mostrar los datos"
                    });
                }
                if (usuario.length >= 1) {
                    console.log(usuario[0]._id)
                    console.log('---------')
                    console.log(userId)
                    if(usuario[0]._id == userId){
                        console.log('email bien');
                        updateUser();
                    } else{
                        console.log('email mal');
                        return res.status(200).send({
                            message: 'Email-Error' 
                        });
                    }
                    
                } else {
                    console.log('email bien');
                    updateUser();
                }
                
            });
        }

        function updateUser() {
            Usuario.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error al actualizar los datos"
                    });
                }
                if (!userUpdate) {
                    return res.status(404).send({
                        message: "No se ha podido actualizar al usuario"
                    });
                }
                return res.status(200).send({
                    userUpdate
                });
            });
        }
        
    },

    seguirUsuario: function (req, res) {
        const identificadoId = req.params.identificado;
        const usuarioId = req.params.usuario;
        let status = true;

        Usuario.findById(identificadoId, (err, identificado) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            else if (!identificado) {
                return res.status(404).send({
                    message: "No existe ningúna usuario con este identificador"
                });
            } else {
                Usuario.findById(usuarioId, (err, usuario) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error al mostrar los datos"
                        });
                    }
                    else if (!usuario) {
                        return res.status(404).send({
                            message: "No existe ningúna usuario con este identificador"
                        });
                    } else {
                        console.log(identificado.seguidos.length);
                        for (let i = 0; i < identificado.seguidos.length; i++) {
                            if (identificado.seguidos[i].usuario == usuarioId) {
                                console.log('Ya esta');
                                status = false;
                                break;
                            }
                        }
                        if (status) {
                            identificado.seguidos.push({
                                nick: usuario.nick, usuario: usuarioId
                            });
                            usuario.seguidores.push({
                                nick: identificado.nick, usuario: identificadoId
                            });
                            identificado.save();
                            usuario.save();
                            console.log('seguir');
                            return res.status(200).send({
                                message: "Guardado"
                            });
                        } else {
                            return res.status(404).send({
                                message: "Ya sigue ha este usuario"
                            });
                        }
                    }
                });
            }

        });
    },

    dejarSeguir: function (req, res) {
        const identificadoId = req.params.identificado;
        const usuarioId = req.params.usuario;
        let status1 = false;
        let status2 = false;

        Usuario.findById(identificadoId, (err, identificado) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            else if (!identificado) {
                return res.status(404).send({
                    message: "No existe ningúna usuario con este identificador"
                });
            } else {
                Usuario.findById(usuarioId, (err, usuario) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error al mostrar los datos"
                        });
                    }
                    else if (!usuario) {
                        return res.status(404).send({
                            message: "No existe ningúna usuario con este identificador"
                        });
                    } else {
                        console.log(identificado.seguidos.length);
                        for (let i = 0; i < identificado.seguidos.length; i++) {
                            if (identificado.seguidos[i].usuario == usuarioId) {
                                status1 = true;
                                identificado.seguidos[i].remove();
                                break;
                            }
                        }
                        for (let i = 0; i < usuario.seguidores.length; i++) {
                            if (usuario.seguidores[i].usuario == identificadoId) {
                                status2 = true;
                                usuario.seguidores[i].remove();
                                break;
                            }
                        }
                        if (status1 && status2) {
                            identificado.save();
                            usuario.save();
                            return res.status(200).send({
                                message: "Guardado"
                            });
                        } else {
                            return res.status(404).send({
                                message: "Algo ha fallado"
                            });
                        }
                    }
                });
            }

        });
    },

    uploadImagen: function (req, res) {
        const userId = req.params.usuario;

        if (req.files) {
            let file_path = req.files.imagen.path;
            let file_split = file_path.split('\\');
            console.log(file_split);

            let file_name = file_split[2];
            console.log(file_name);
            let ext_split = file_name.split('\.');
            let file_ext = ext_split[1];
            console.log(file_ext);

            if (userId != req.usuario.sub) {
                console.log('fallo');
                return fs.unlink(file_path, () => {
                    return res.status(200).send({
                        message: "No tienes permisos para poner una imagen de perfil"
                    });
                });
            }

            if (file_ext === 'jpg' || file_ext === 'JPG' || file_ext === 'png' || file_ext === 'PNG'
                || file_ext === 'jpeg' || file_ext === 'JPEG' || file_ext === 'gif' || file_ext === 'GIF') {
                return Usuario.findByIdAndUpdate(userId, { imagen: file_name }, { new: true }, (err, userUpdate) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error al actualizar los datos"
                        });
                    }
                    if (!userUpdate) {
                        return res.status(404).send({
                            message: "No se ha podido actualizar al usuario"
                        });
                    }
                    return res.status(200).send({
                        userUpdate
                    });
                });
            }
            else {
                return fs.unlink(file_path, () => {
                    return res.status(200).send({
                        message: "La extensión no es válida"
                    });
                });

            }
        }
        else {
            return res.status(200).send({
                message: "No se ha subido ningúna imagen"
            });
        }
    },

    getImagen: function (req, res) {
        const imagen_file = req.params.imagen;
        const file = './imagen/usuario/' + imagen_file;

        fs.access(file, (err) => {
            console.log(file);
            if (err) {
                console.log('entra');
                res.status(200).send({ message: 'No existe la imagen' });
            } else {
                res.sendFile(path.resolve(file));
            }
        })
    },

    recomendar: async function (req, res) {
        const userId = req.params.id;
        let criticas = [];
        let recomendaciones = [{ id: String, titulo: String, imagen: String, tipo: String }];

        if (userId != req.usuario.sub) {
            return res.status(403).send({
                message: "No tienes permisos"
            });
        }

        Usuario.findById(userId, (err, usuario) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al mostrar los datos"
                });
            }
            else if (!usuario) {
                return res.status(404).send({
                    message: "No existe ningúna usuario con este identificador"
                });
            } else {
                let obras = usuario.peliculas.length + usuario.series.length
                if(obras < 10){
                    Pelicula.find({}).sort({ "nota_media": -1 }).limit(10).exec((err, pelicula) => {
                        Serie.find({}).sort({ "nota_media": -1 }).limit(10).exec((err, serie) => {
                            console.log(pelicula[0]._id);
                            for(let i=0; i<10; i++){
                                console.log(pelicula[i]._id);
                                recomendaciones.push({ id: pelicula[i]._id, titulo: pelicula[i].titulo, imagen: pelicula[i].imagen, tipo: 'pelicula' });
                                recomendaciones.push({ id: serie[i]._id, titulo: serie[i].titulo, imagen: serie[i].imagen, tipo: 'serie' });
                            }
                            console.log(recomendaciones[0])
                            for(let j in recomendaciones){
                                console.log('---')
                                for(let i in usuario.peliculas){
                                    if(recomendaciones[j].titulo == usuario.peliculas[i].titulo){
                                        console.log('entra')
                                        recomendaciones.splice(j, 1)
                                    }
                                }
                                for(let x in usuario.series){
                                    console.log('ser')
                                    if(recomendaciones[j].titulo == usuario.series[x].titulo){
                                        recomendaciones.splice(j, 1)
                                    }
                                }    
                            }
                            /*let borrar = 10 - recomendaciones.length;
                            recomendaciones.slice(5, borrar)*/
                            //console.log(recomendaciones);
                            return res.status(200).send({
                                recomendaciones
                            });
                        });
                    });
                    
                }else{
                criticasUser(usuario, criticas).then(() => {
                    modelo.recommend(usuario.id_model, criticas).then((recom) => {
                        buscarRecom(recom, recomendaciones, res)
                        /*for (let i in recom) {
                            console.log(recom[i].id_model)
                            Pelicula.find({ id_model: recom[i].id_model }, (err, peli) => {
                                if (err) {
                                    console.log('Se ha producido un error')
                                }
                                if (peli != '') {
                                    console.log(peli[0].titulo)
                                    recomendaciones.push({ id: peli[0]._id, titulo: peli[0].titulo, imagen: peli[0].imagen, tipo: 'pelicula' });
                                }
                            })
                            Serie.find({ id_model: recom[i].id_model }, (err, serie) => {
                                if (err) {
                                    console.log('Se ha producido un error')
                                }
                                if (serie != '') {
                                    //console.log(serie)
                                    recomendaciones.push({ id: serie[0]._id, titulo: serie[0].titulo, imagen: serie[0].imagen, tipo: 'serie' });
                                }
                            })
                        }*/

                    })
                })
            }


                /*criticasUser(usuario, criticas).then(() => {
                    let recom = await modelo.recommend(usuario.id_model, criticas)
                    buscarRecom(recom, recomendaciones).then(() => {
                        console.log('entra')
                        return res.status(200).send({
                            recomendaciones
                        })
                    })
                }) */

            }

        })
        

        /*recom.forEach(element => {
            Serie.find({id_model: element.id_model}, (err, serie) => {
                if(serie){
                    recomendaciones.push({id: serie._id, titulo: serie.titulo, imagen: serie.imagen, tipo: 'serie'});
                }
            })
            Pelicula.find({id_model: element.id_model}, (err, peli) => {
                if(peli){
                    recomendaciones.push({id: peli._id, titulo: peli.titulo, imagen: peli.imagen, tipo: 'pelicula'});
                }
            })
        })*/
    }
}

module.exports = controller;