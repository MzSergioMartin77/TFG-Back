'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'The_Legend_of_Zelda';

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'No se tiene la cabecera de autentificacion'});
    }

    let token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        var payload = jwt.decode(token, secret);

        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }
        //req.usuario = payload;
    }catch(ex){
        return res.status(404).send({message: 'El token no es valido'});
    }
    
    req.usuario = payload;

    next();
}