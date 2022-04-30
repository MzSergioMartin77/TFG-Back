'use strict'

//Inicialización y configuración de expresss
var express = require('express'); //Para trabajar con rutas
var bodyParser = require('body-parser'); //Para realizar la conversión de las peticiones


const rutas = require('./routes/routes');
const cors = require('cors');

const config = {
    application: {
        cors: {
            server: [
                {
                    origin: "localhost:4200", //servidor al que se le va a permitir acceder a la API rest
                    credentials: true
                }
            ]
        }
    }
}

var app = express();


//middelwares, métdos que se ejecutan antes de llegar al controlador

app.use(bodyParser.json({limit: '50mb'})); //Pasar lo que nos llega por la url a JSON
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));  
app.use(cors(
    config.application.cors.server
));



//ruta de prueba 
app.get('/prueba', (req, res) => {
    res.status(200).send({
        message: 'Probando esto '
    });
});



app.use('/',rutas);

//exportar para poder llamar a este fichero en cualquier parte del proyecto
module.exports = app;