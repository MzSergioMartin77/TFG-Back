let { model} = require('@tensorflow/tfjs-node');
const tf = require('@tensorflow/tfjs-node');
const Serie = require('../models/serie');
const Pelicula = require('../models/pelicula');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
const modelJSON = require('./datos.json');
//const movie_len = movieM();
//const movie_arr = tf.range(0, movie_len);

function movieM(){
    const datosJson = JSON.parse(JSON.stringify(modelJSON));
    let listMovie = [];
    datosJson.forEach(element => {
        listMovie.push(element.movieId);
    });
    const setMovie = new Set(listMovie);
    return setMovie.size;
}

async function movieList(){
    let movies = 0;
    let series = 0;

    await Pelicula.countDocuments({}, (err, count_movie) => {
        if(!err){
            console.log(count_movie)
            movies = count_movie;
        }
    })
    await Serie.countDocuments({}, (err, count_serie) => {
        if(!err){
            series = count_serie;
        }
    })

    return movies + series;
}

async function loadModel() {
    console.log('Loading Model...')
    model = await tf.loadLayersModel("file:///Users/Sergi/Documents/Proyectos/TFG/model_tf2/model.json", false);
    console.log('Modelo cargado')
    // model.summary()
}

exports.recommend = async function recommend(userId, vistas) {
    console.log('-----------------------------------------');
    const movie_len = await movieList();
    console.log(movie_len)
    const movie_arr = tf.range(0, 100);
    console.log(movie_arr);
    let user = tf.fill([100], Number(userId))
    console.log(user)
    await loadModel()
    pred_tensor = await model.predict([movie_arr, user]).reshape([1000]);
    console.log('prediccion');
    pred = pred_tensor.arraySync()

    let recommendations = []
    let rating = [{id_model: Number, nota: Number}]

    notas = pred.slice(0, movie_len);
    console.log(vistas);
    console.log(notas.length);
    for(let i=0; i<notas.length; i++){
        rating.push({id_model: i+1, nota: notas[i]})
    }

    console.log(rating[1])

    for(let j in vistas){  
        for(let i in rating){
            if(rating[i].id_model == vistas[j]){
                rating.splice(i, 1)
            }
        }    
    }
    console.log('-------------------');
    //console.log(rating)
    rating.sort((a, b) => b.nota - a.nota);

    recommendations.push(rating[1]);
    recommendations.push(rating[2]);
    recommendations.push(rating[3]);
    recommendations.push(rating[4]);
    recommendations.push(rating[5]);
    recommendations.push(rating[6]);
    recommendations.push(rating[7]);
    recommendations.push(rating[8]);
    recommendations.push(rating[9]);
    recommendations.push(rating[10]);

    console.log('RECOMENDACIONES')
    console.log(recommendations);
    return recommendations;

}