
const Pelicula = require('../models/pelicula');
const Serie = require('../models/serie');
const Profesional = require('../models/profesional');
const Usuario = require('../models/usuario');
const mdb = require('moviedb')('1acd0c7bc48f18ba631625da81edf46a');
const https = require('https');
const fs = require('fs');
const PythonS = require('python-shell');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);


function streamingPeli(id, peli, state, rest) {
    let url = 'https://api.themoviedb.org/3/movie/' + id + '/watch/providers?api_key=1acd0c7bc48f18ba631625da81edf46a';
    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            if (JSON.parse(data).results.ES) {
                if (JSON.parse(data).results.ES.flatrate) {
                    JSON.parse(data).results.ES.flatrate.forEach(element => {
                        if (element.provider_name != 'HBO') {
                            peli.plataformas.push({
                                nombre: element.provider_name,
                                icono: "https://www.themoviedb.org/t/p/original" + element.logo_path
                            })
                        }
                    })
                }
            }
            peli.save();
            if (state == 'add') {
                console.log("Película Guardada");
                return rest.status(200).send({
                    peli
                });
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function videoPeli(id, peli, rest) {
    mdb.movieVideos({ id: id, language: 'es' }, (err, res) => {
        let trailer;
        if (res.results.length != 0) {
            trailer = "https://www.youtube.com/embed/" + res.results[0].key;
            peli.trailer_es = trailer;
        }
        mdb.movieVideos({ id: id }, (err, res) => {
            let trailer2;
            if (res.results.length != 0) {
                trailer2 = "https://www.youtube.com/embed/" + res.results[0].key;
                peli.trailer_en = trailer2;
            }
            streamingPeli(id, peli, 'add', rest);
        });
    });

}

function castPeli(id, peli, rest) {
    mdb.movieCredits({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            res.cast.forEach(element => {
                peli.actores.push({ nombre: element.name, personaje: element.character });
            });
            res.crew.forEach(element => {
                if (element.job == 'Director') {
                    peli.directores.push(element.name);
                }
            });
        }
        videoPeli(id, peli, rest);
    });
}

function streamingSerie(id, serie, state, rest) {
    let url = 'https://api.themoviedb.org/3/tv/' + id + '/watch/providers?api_key=1acd0c7bc48f18ba631625da81edf46a';
    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            if (JSON.parse(data).results.ES) {
                if (JSON.parse(data).results.ES.flatrate) {
                    JSON.parse(data).results.ES.flatrate.forEach(element => {
                        if (element.provider_name != 'HBO') {
                            serie.plataformas.push({
                                nombre: element.provider_name,
                                icono: "https://www.themoviedb.org/t/p/original" + element.logo_path
                            })
                        }
                    })
                }
            }
            serie.save();

            if (state == 'add') {
                console.log("Serie Guardada");
                return rest.status(200).send({
                    serie
                });
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function videoSerie(id, serie, rest) {
    mdb.tvVideos({ id: id, language: 'es' }, (err, res) => {
        let trailer;
        if (res.results.length != 0) {
            trailer = "https://www.youtube.com/embed/" + res.results[0].key;
            serie.trailer_es = trailer;
        }
        mdb.tvVideos({ id: id }, (err, res) => {
            let trailer2;
            if (res.results.length != 0) {
                trailer2 = "https://www.youtube.com/embed/" + res.results[0].key;
                serie.trailer_en = trailer2;
            }
            streamingSerie(id, serie, 'add', rest);
        });
    });
}

function castSerie(id, serie, rest) {
    let url = 'https://api.themoviedb.org/3/tv/' + id + '/aggregate_credits?api_key=1acd0c7bc48f18ba631625da81edf46a';

    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            JSON.parse(data).cast.forEach(element => {
                serie.actores.push({
                    nombre: element.name,
                    personaje: element.roles[0].character
                })
            });
            videoSerie(id, serie, rest);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

function castPr(id, profesional, rest) {
    mdb.personCombinedCredits({ id: id, language: 'es' }, (err, res) => {
        if (res) {
            res.cast.forEach(element => {
                if (element.media_type == 'movie') {
                    profesional.filmografia.push({
                        titulo: element.title,
                        rol: 'Actor',
                        tipo: 'Película',
                        personaje: element.character
                    });
                }
                if (element.media_type == 'tv') {
                    profesional.filmografia.push({
                        titulo: element.name,
                        rol: 'Actor',
                        tipo: 'Serie',
                        personaje: element.character
                    });
                }
            });
            res.crew.forEach(element => {
                if (element.job == 'Director') {
                    if (element.media_type == 'movie') {
                        profesional.filmografia.push({
                            titulo: element.title,
                            rol: 'Director',
                            tipo: 'Película',
                        });
                    }
                }
                if (element.job == 'Creator') {
                    if (element.media_type == 'tv') {
                        profesional.filmografia.push({
                            titulo: element.name,
                            rol: 'Creador',
                            tipo: 'Serie',
                        });
                    }
                }

            });
        }
        profesional.save();
        return rest.status(200).send({
            profesional
        });
    });
}

function actualizarModelotf(res) {

    const options = {
        mode: 'text',
        pythonPath: 'C:/Users/Sergi/Anaconda3/envs/tensorflowks/python.exe',
        pythonOptions: ['-u'],
        scriptPath: 'C:/Users/Sergi/Documents/Proyectos/TFG/BackTFG/model_py',
        args: ['']
    };
    

    PythonS.PythonShell.run('recomendadorjson.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('Resultado Python');
        console.log(results);
        return res.status(200).send({
            message: "Actualizado"
        });
    });
}

const controller = {

    addPeli: function (req, rest) {
        console.log('entra1')
        const params = req.body;
        const usuarioId = params.adminId;
        const id = params.idPeli;

        let peli = new Pelicula();

        if (usuarioId != req.usuario.sub) {
            return rest.status(500).send({
                message: "No tienes permisos"
            });
        }

        Pelicula.countDocuments({}, (err, count1) => {
            Serie.countDocuments({}, (err, count2) => {
                peli.id_model = count1 + count2 + 1;
            });
        });

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                console.log("cosas");
                return rest.status(500).send({
                    message: "Error usuario"
                });
            } else if (!usuario) {
                return rest.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else if (usuario.rol != 'admin') {
                return rest.status(500).send({
                    message: "No tienes permisos para realiar esta acción"
                });
            } else {
                mdb.movieInfo({ id: id, language: 'es' }, (err, res) => {
                    if (res) {
                        peli.id_TMDB = res.id;
                        peli.titulo = res.title;
                        peli.titulo_original = res.original_title;
                        peli.sinopsis = res.overview;
                        peli.nota_media = null;
                        peli.duracion = res.runtime;
                        peli.fecha_estreno = res.release_date;
                        peli.imagen = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + res.poster_path;
                        res.genres.forEach(element => {
                            if (element.name == 'Action & Adventure') {
                                peli.generos.push('Acción & Aventura')
                            }
                            else if (element.name == 'Sci-Fi & Fantasy') {
                                peli.generos.push('Ciencia Ficción & Fantástico')
                            } else {
                                peli.generos.push(element.name);
                            }
                        });
                        castPeli(id, peli, rest);
                    }
                    else {
                        return rest.status(200).send({
                            message: "No-Peli"
                        });
                    }
            
                });
            }

        });
    },

    addSerie: function (req, rest) {
        console.log('entra2');
        const params = req.body;
        const id = params.idSerie;
        const usuarioId = params.adminId;

        let serie = new Serie();

        if (usuarioId != req.usuario.sub) {
            return rest.status(500).send({
                message: "No tienes permisos"
            });
        }

        Pelicula.countDocuments({}, (err, count1) => {
            Serie.countDocuments({}, (err, count2) => {
                serie.id_model = count1 + count2 + 1;
            });
        });

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                console.log("cosas");
                return rest.status(500).send({
                    message: "Error usuario"
                });
            } else if (!usuario) {
                return rest.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else if (usuario.rol != 'admin') {
                return rest.status(500).send({
                    message: "No tienes permisos para realiar esta acción"
                });
            } else {
                mdb.tvInfo({ id: id, language: 'es' }, (err, res) => {
                    if (res) {
                        serie.id_TMDB = res.id;
                        serie.titulo = res.name;
                        serie.titulo_original = res.original_name;
                        serie.sinopsis = res.overview;
                        serie.nota_media = null;
                        serie.temporadas = res.number_of_seasons;
                        serie.capitulos = res.number_of_episodes;
                        serie.inicio = res.first_air_date;
                        serie.final = res.last_air_date;
                        serie.imagen = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + res.poster_path;
                        res.created_by.forEach(element => {
                            serie.creadores.push(element.name);
                        });
                        res.genres.forEach(element => {
                            if (element.name == 'Action & Adventure') {
                                serie.generos.push('Acción & Aventura')
                            }
                            else if (element.name == 'Sci-Fi & Fantasy') {
                                serie.generos.push('Ciencia Ficción & Fantástico')
                            } else {
                                serie.generos.push(element.name);
                            }
                        });
                        castSerie(id, serie, rest);
                    }
                    else {
                        return rest.status(200).send({
                            message: "No-Serie"
                        });
                    }
            
                });
            }
        });
        
    },

    addProf: function(req, rest) {
        console.log('entra3');
        const params = req.body;
        const id = params.idProf;
        const usuarioId = params.adminId;

        let profesional = new Profesional();

        if (usuarioId != req.usuario.sub) {
            return rest.status(500).send({
                message: "No tienes permisos"
            });
        }

        Profesional.countDocuments({}, (err, count) => {
            profesional.id_profesional = count + 1;
        });

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                console.log("cosas");
                return rest.status(500).send({
                    message: "Error usuario"
                });
            } else if (!usuario) {
                return rest.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else if (usuario.rol != 'admin') {
                return rest.status(500).send({
                    message: "No tienes permisos para realiar esta acción"
                });
            } else {
                mdb.personInfo({ id: id, language: 'es' }, (err, res) => {
                    if (res) {
                        profesional.id_TMDB = res.id;
                        profesional.nombre = res.name;
                        profesional.biografia = res.biography;
                        profesional.fecha_nacimiento = res.birthday;
                        profesional.lugar_nacimiento = res.place_of_birth;
                        profesional.imagen = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + res.profile_path;
            
                        castPr(id, profesional, rest);
            
                    } else {
                        return res.status(200).send({
                            message: "No-Prof"
                        });
                    }
            
                });
            }

        });

    },

    upPlataformaPeli: function(req, res) {
        const usuarioId = req.params.admin;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos"
            });
        }

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                console.log("cosas");
                return res.status(500).send({
                    message: "Error usuario"
                });
            } else if (!usuario) {
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else if (usuario.rol != 'admin') {
                return res.status(500).send({
                    message: "No tienes permisos para realiar esta acción"
                });
            } else {
                Pelicula.find((err, peliculas) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error peliculas"
                        });
                    }
                    if (!peliculas) {
                        return res.status(404).send({
                            message: "No hay películas en la plataforma"
                        });
                    }
                    peliculas.forEach(element => {
                        element.plataformas.splice(0)
                        streamingPeli(element.id_TMDB, element, 'update', res)
                    });
                    return res.status(200).send({
                        message: "Actualizado"
                    });
                });
            }
        });
        
    },
    
    upPlataformaSerie: function(req, res) {
        const usuarioId = req.params.admin;

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos"
            });
        }

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                return res.status(500).send({
                    message: "Error usuario"
                });
            } else if (!usuario) {
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else if (usuario.rol != 'admin') {
                return res.status(500).send({
                    message: "No tienes permisos para realiar esta acción"
                });
            } else {
                Serie.find((err, series) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error series"
                        });
                    }
                    if (!series) {
                        return res.status(404).send({
                            message: "No hay series en la plataforma"
                        });
                    }
                    series.forEach(element => {
                        element.plataformas.splice(0)
                        streamingSerie(element.id_TMDB, element, 'update', res)
                    });
                    return res.status(200).send({
                        message: "Actualizado"
                    });
                });
            }
        });
        
    },

    datosModelo: function(req, res) {
        const usuarioId = req.params.admin;
        console.log(usuarioId);
        let datos = [];

        if (usuarioId != req.usuario.sub) {
            return res.status(500).send({
                message: "No tienes permisos"
            });
        }

        Usuario.findById(usuarioId, (err, usuario) => {
            if (err) {
                return res.status(500).send({
                    message: "Error usuario"
                });
            } else if (!usuario) {
                return res.status(404).send({
                    message: "Este usuario no se encuentra en la plataforma"
                });
            } else if (usuario.rol != 'admin') {
                return res.status(403).send({
                    message: "No tienes permisos para realiar esta acción"
                });
            } else {
                Pelicula.find({}, (err, peliculas) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error peliculas"
                        });
                    }
                    if (!peliculas) {
                        return res.status(404).send({
                            message: "No hay películas en la plataforma"
                        });
                    }
            
                    for (let i = 0; i < peliculas.length; i++) {
                        for (let j = 0; j < peliculas[i].criticas.length; j++) {
                            datos.push({
                                movieId: peliculas[i].id_model,
                                userId: peliculas[i].criticas[j].usuario_model,
                                nota: peliculas[i].criticas[j].nota
                            })
                        }
                    }
            
                    Serie.find({}, (err, series) => {
                        if (err) {
                            return res.status(500).send({
                                message: "Error series"
                            });
                        }
                        if (!series) {
                            return res.status(404).send({
                                message: "No hay ninguna serie en la plataforma"
                            });
                        }
            
                        for (let i = 0; i < series.length; i++) {
                            for (let j = 0; j < series[i].criticas.length; j++) {
                                datos.push({
                                    movieId: series[i].id_model,
                                    userId: series[i].criticas[j].usuario_model,
                                    nota: series[i].criticas[j].nota
                                })
                            }
                        }
            
                        console.log(datos);
                        const datosJSON = JSON.stringify(datos);
                        //console.log(datosJSON);
                        fs.writeFile("../model_tf/datos.json", datosJSON, () => {
                            console.log('Fiechero de datos creado correctamente');
                            actualizarModelotf(res);
                        })
                    });
            
                });
            }
    
        });
    }

};

module.exports = controller;