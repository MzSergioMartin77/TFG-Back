let { model} = require('@tensorflow/tfjs-node');
const tf = require('@tensorflow/tfjs-node');
const modelJSON = require('./datos.json');
const movie_len = movieM();
const movie_arr = tf.range(0, movie_len);

function movieM(){
    const datosJson = JSON.parse(JSON.stringify(modelJSON));
    let listMovie = [];
    datosJson.forEach(element => {
        listMovie.push(element.movieId);
    });
    const setMovie = new Set(listMovie);
    
    return setMovie.size;
}

async function loadModel() {
    console.log('Loading Model...')
    model = await tf.loadLayersModel("file:///Users/Sergi/Documents/Proyectos/TFG/BackTFG/model_tf/model.json", false);
    console.log('Modelo cargado')
    // model.summary()
}

exports.recommend = async function recommend(userId, vistas) {
    console.log('-----------------------------------------');
    let user = tf.fill([movie_len], Number(userId))
    console.log('paso')
    await loadModel()
    pred_tensor = await model.predict([movie_arr, user]).reshape([movie_len]);
    //console.log(pred_tensor);
    pred = pred_tensor.arraySync()

    let recommendations = []
    let rating = [{id_model: Number, nota: Number}]

    notas = pred_tensor.arraySync();
    console.log(vistas);
    console.log(notas.length);
    /*for(let i=0; i<notas.length; i++){
        for(let j=0; j<vistas.length; j++){
            if(i+1 != vistas[j]){
                //console.log(i+' - '+vistas[j])
                rating.push({id_model: i+1, nota: notas[i]});
            }   
        }   
    }*/
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
    //console.log(rating);
    console.log('-------------------');
    console.log(rating)
    rating.sort((a, b) => b.nota - a.nota);

    recommendations.push(rating[1]);
    recommendations.push(rating[2]);
    recommendations.push(rating[3]);
    recommendations.push(rating[4]);
    recommendations.push(rating[5]);

    console.log(recommendations);
    return recommendations;

}