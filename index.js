'use strict'

//Conexión con mongoDB usando mongoose
const mongoose = require('mongoose');
const app = require('./app');
const port = 3700; //Puerto del servidor

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TFGdb',
    {useNewUrlParser: true,
    useUnifiedTopology: true})
    .then(() => {
        console.log("La conexión se ha realizado con exito");
        //Iniciar servidor
        app.listen(port, () => {
            console.log("Servidor iniciado");
        });
    })
    .catch(err => console.log(err));