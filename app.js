'use strict'

//Inicialización y configuración de expresss
var express = require('express'); //Para trabajar con rutas
var bodyParser = require('body-parser'); //Para realizar la conversión de las poticiones

var app = express();

//middelwares, métdos que se ejecutan antes de llegar al controlador
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json()); //Pasar lo que nos llega por la url a JSON

//ruta de prueba 
app.get('/prueba', (req, res) => {
    res.status(200).send({
        message: 'Probando esto '
    });
});

//exportar para poder llamar a este fichero en cualquier parte del proyecto
module.exports = app;