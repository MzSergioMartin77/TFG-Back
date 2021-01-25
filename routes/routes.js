'use strict'

const express = require('express');
const peliController = require('../controlers/peliculaControler');
const serieController = require('../controlers/serieControler');
const proController = require('../controlers/profesionalControler');
const usuarioController = require('../controlers/usuarioControler');
const md_aut = require('../middlewares/autenticacion');

const router = express.Router();

//Rutas para películas
router.get('/pelicula/:id', peliController.getIdPeli);
router.get('/pelicula/t/:titulo', peliController.getTituloPeli);
router.get('/peliculas', peliController.getPeliculas);
router.post('/peliCritica', peliController.saveCritica);

//Rutas para series
router.get('/serie/:id', serieController.getIdSerie);
router.get('/serie/t/:titulo',serieController.getTituloSerie);
router.get('/series',serieController.getSeries);
router.post('/serieCritica', serieController.saveCritica);

//Rutas para profesionales
router.get('/profesional/:id', proController.getIdPro);
router.get('/profesional/n/:nombre', proController.getNombrePro);

//Rutas para usuario
router.get('/pruebas', md_aut.ensureAuth, usuarioController.pruebas);
router.post('/registro', usuarioController.saveUsuario);
router.post('/login', usuarioController.usuarioLogin);
router.get('/usuario/:id', md_aut.ensureAuth, usuarioController.getIdUsuario);
router.put('/updateUsuario/:id', md_aut.ensureAuth, usuarioController.updateUsuario);

module.exports = router;