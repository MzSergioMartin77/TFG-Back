'use strict'

const express = require('express');
const peliController = require('../controlers/peliculaControler');
const serieController = require('../controlers/serieControler');
const proController = require('../controlers/profesionalControler');
const usuarioController = require('../controlers/usuarioControler');
const adminController = require('../controlers/adminControler');
const md_aut = require('../middlewares/autenticacion');

const multipart = require('connect-multiparty');
const md_imagen = multipart({uploadDir: './imagen/usuario'});

const router = express.Router();

//Rutas para películas
router.get('/pelicula/:id', peliController.getIdPeli);
router.get('/pelicula/t/:titulo', peliController.getTituloPeli);
router.get('/peliculas', peliController.getPeliculas);
router.get('/peliculasP', peliController.getPelisP);
router.post('/peliCritica', md_aut.ensureAuth, peliController.middlewareCritica);
router.post('/peliComentario', md_aut.ensureAuth, peliController.saveComentario);
router.put('/comentarioPupdate', md_aut.ensureAuth, peliController.updateComentario);
router.delete('/deletePcomentario/:pelicula/:usuario/:comentario', md_aut.ensureAuth, peliController.deleteComentario);
router.put('/criticaPupdate', md_aut.ensureAuth, peliController.updateCritica);
router.delete('/deletePcritica/:pelicula/:usuario/:critica', md_aut.ensureAuth, peliController.deleteCritica);
router.get('/criticaPeli/:pelicula/:critica', peliController.getCritica);
router.get('/buscarPeli/:titulo', peliController.getBuscarPeli);
router.get('/buscarPeliG/:genero',peliController.getBuscarPeliG);
router.get('/criticaPeliUser/:pelicula/:usuario', peliController.getCriticaUser);
router.post('/peliculaNota', md_aut.ensureAuth, peliController.middlewareNota);

//Rutas para series
router.get('/serie/:id', serieController.getIdSerie);
router.get('/serie/t/:titulo',serieController.getTituloSerie);
router.get('/series',serieController.getSeries);
router.get('/seriesP',serieController.getSeriesP);
//router.post('/serieCritica', md_aut.ensureAuth, serieController.saveCritica);
router.post('/serieComentario', md_aut.ensureAuth, serieController.saveComentario);
router.put('/comentarioCupdate', md_aut.ensureAuth, serieController.updateComentario);
router.delete('/deleteCcomentario/:serie/:usuario/:comentario', md_aut.ensureAuth, serieController.deleteComentario);
router.post('/serieCritica', md_aut.ensureAuth, serieController.middlewareCritica);
router.put('/criticaSupdate', md_aut.ensureAuth, serieController.updateCritica);
router.delete('/deleteScritica/:serie/:usuario/:critica', md_aut.ensureAuth, serieController.deleteCritica);
router.get('/criticaSerie/:serie/:critica', serieController.getCritica);
router.get('/buscarSerie/:titulo', serieController.getBuscarSerie);
router.get('/buscarSerieG/:genero', serieController.getBuscarSerieG);
router.get('/criticaSerieUser/:serie/:usuario', serieController.getCriticaUser);
router.post('/serieNota', md_aut.ensureAuth, serieController.middlewareNota);

//Rutas para profesionales
router.get('/profesional/:id', proController.getIdPro);
router.get('/profesional/n/:nombre', proController.getNombrePro);
router.get('/buscarPro/:nombre', proController.getBuscarPro);

//Rutas para usuario
router.get('/pruebas', md_aut.ensureAuth, usuarioController.pruebas);
router.post('/registro', usuarioController.saveUsuario);
router.post('/login', usuarioController.usuarioLogin);
router.get('/usuario/:id', md_aut.ensureAuth, usuarioController.getIdUsuario);
router.get('/usuarioNick/:nick', usuarioController.getNickUsuario);
router.get('/otroUsuario/:id', usuarioController.getIdUsuario);
router.put('/updateUsuario/:id', md_aut.ensureAuth, usuarioController.updateUsuario);
router.get('/seguir/:identificado/:usuario', md_aut.ensureAuth, usuarioController.seguirUsuario);
router.delete('/dejarSeguir/:identificado/:usuario', md_aut.ensureAuth, usuarioController.dejarSeguir);
router.post('/uploadImagen/:usuario', [md_aut.ensureAuth, md_imagen], usuarioController.uploadImagen);
//router.post('/uploadImagen/:usuario', md_aut.ensureAuth, usuarioController.uploadImagen);
router.get('/getImagen/:imagen', usuarioController.getImagen);
router.get('/recomendaciones/:id', md_aut.ensureAuth, usuarioController.recomendar);

//Rutas para administrador
router.post('/addPelicula', md_aut.ensureAuth, adminController.addPeli);
router.post('/addSerie', md_aut.ensureAuth, adminController.addSerie);
router.post('/addProfesional', md_aut.ensureAuth, adminController.addProf);
router.get('/upPlataformasPeli/:admin', md_aut.ensureAuth, adminController.upPlataformaPeli);
router.get('/upPlataformasSerie/:admin', md_aut.ensureAuth, adminController.upPlataformaSerie);
router.get('/upRecomendador/:admin', md_aut.ensureAuth, adminController.datosModelo);

module.exports = router;