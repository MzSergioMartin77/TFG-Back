'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'The_Legend_of_Zelda';

exports.createToken = function(usuario){
    const payload = {
        sub: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        descripcion: usuario.descripcion,
        nick: usuario.nick,
        imagen: usuario.imagen,
        iat: moment().unix(),
        exp: moment().add(10, 'days').unix
    };
    return jwt.encode(payload, secret);
};