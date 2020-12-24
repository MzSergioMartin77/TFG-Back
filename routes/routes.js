'use strict'

const express = require('express');
const peliController = require('../controlers/peliculaControler');
const serieController = require('../controlers/serieControler');
const proController = require('../controlers/profesionalControler');

const router = express.Router();

//Rutas para películas
router.get('/pelicula/:id', peliController.getIdPeli);
router.get('/pelicula/t/:titulo', peliController.getTituloPeli);
router.get('/peliculas', peliController.getPeliculas);

//Rutas para series
router.get('/serie/:id', serieController.getIdSerie);
router.get('/serie/t/:titulo',serieController.getTituloSerie);
router.get('/series',serieController.getSeries);

//Rutas para profesionales
router.get('/profesional/:id', proController.getIdPro);
router.get('/profesional/n/:nombre', proController.getNombrePro);

module.exports = router;