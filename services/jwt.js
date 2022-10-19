'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'The_Legend_of_Zelda';

//Se crea el token que sirve para autenticar al usuario en el servidor
exports.createToken = function(usuario){
    const payload = {
        sub: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        nick: usuario.nick,
        iat: moment().unix(),
        exp: moment().add(10, 'days').unix
    };
    return jwt.encode(payload, secret);
};