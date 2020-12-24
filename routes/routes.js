'use strict'

const express = require('express');
const peliController = require('../controlers/peliculaControler');

const router = express.Router();

router.get('/pelicula/:id', peliController.getID);
router.get('/pelicula/t/:titulo', peliController.getTitulo);
router.get('/peliculas', peliController.getPeliculas);

module.exports = router;