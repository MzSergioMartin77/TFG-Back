'use strict'

const Usuario = require('../models/usuario');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
const bcrypt = require('bcrypt');
const rondas = 10;
const jwt = require('../services/jwt');

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
                usuario: userUpdate
            });
        });
    }
}

module.exports = controller;