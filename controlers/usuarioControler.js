'use strict'

const Usuario = require('../models/usuario');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
const bcrypt = require('bcrypt');
const rondas = 10;
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');
const { exists } = require('../models/usuario');

const controller = {

    pruebas: function (req, res) {
        return res.status(200).send({ message: 'Prueba de funcionamiento' });
    },

    saveUsuario: function (req, res) {
        const params = req.body;
        const usuario = new Usuario();

        if (params.nombre && params.nick && params.email && params.pass) {
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
                        else{
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

    getNickUsuario: function(req, res){
        const nickParam = req.params.nick;
        let buscar = "(?i)"+nickParam;

        Usuario.find({ nick: {$regex: buscar} }, (err, usuario) => {
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

        delete update.pass;

        if (userId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos para modificar los datos"
            });
        }

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
    },

    seguirUsuario: function (req, res){
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
            }else{
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
                    }else{
                        console.log(identificado.seguidos.length);
                        for(let i=0; i<identificado.seguidos.length; i++){
                            if(identificado.seguidos[i].usuario == usuarioId){
                                console.log('Ya esta');
                                status = false;
                                break;
                            }
                        }
                        if(status){
                            identificado.seguidos.push({
                                nick: usuario.nick, usuario: usuarioId
                            });
                            usuario.seguidores.push({
                                nick: identificado.nick, usuario: identificadoId
                            });
                            identificado.save();
                            usuario.save();
                            return res.status(200).send({
                                message: "Guardado"
                            });
                        }else{
                            return res.status(404).send({
                                message: "Ya sigue ha este usuario"
                            });
                        }
                    }  
                });
            }
            
        });
    },

    dejarSeguir: function (req, res){
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
            }else{
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
                    }else{
                        console.log(identificado.seguidos.length);
                        for(let i=0; i<identificado.seguidos.length; i++){
                            if(identificado.seguidos[i].usuario == usuarioId){
                                status1 = true;
                                identificado.seguidos[i].remove();                               
                                break;
                            }
                        }
                        for(let i=0; i<usuario.seguidores.length; i++){
                            if(usuario.seguidores[i].usuario == identificadoId){
                                status2 = true;
                                usuario.seguidores[i].remove();
                                break;
                            }
                        }
                        if(status1 && status2){
                            identificado.save();
                            usuario.save();
                            return res.status(200).send({
                                message: "Guardado"
                            });
                        }else{
                            return res.status(404).send({
                                message: "Algo ha fallado"
                            });
                        }
                    }  
                });
            }
            
        });
    },

    uploadImagen: function(req, res) {
        const userId = req.params.usuario;

        if(req.files){
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

            if(file_ext === 'jpg' || file_ext === 'JPG' || file_ext === 'png' || file_ext === 'PNG'
             || file_ext === 'jpeg' || file_ext === 'JPEG' || file_ext === 'gif' || file_ext === 'GIF'){
                return Usuario.findByIdAndUpdate(userId, { imagen: file_name }, {new: true}, (err, userUpdate) => {
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
        const file = './imagen/usuario/'+imagen_file;

        fs.access(file, (err) => {
            console.log(file);
            if(err){
                console.log('entra');
                res.status(200).send({message: 'No existe la imagen'});
            } else{
                res.sendFile(path.resolve(file));
            }
        })
    }
}

module.exports = controller;