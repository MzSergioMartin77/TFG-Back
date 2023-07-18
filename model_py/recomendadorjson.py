#!/usr/bin/env python 
# -*- coding: utf-8 -*-

# Commented out IPython magic to ensure Python compatibility.
from gettext import install
from typing import Dict, Text

import numpy as np
import pandas as pd
import os
import warnings

warnings.filterwarnings('ignore')
# %matplotlib inline

import tensorflow as tf

# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

ratings_df = pd.read_json(r"C:\Users\Sergi\Documents\Proyectos\TFG\BackTFG\model_tf\datos.json") 

# ratings_df.isna().sum()

movie_ids = ratings_df['movieId'].unique()
movie2idx = {o:i for i,o in enumerate(movie_ids)}
ratings_df.movieId = ratings_df.movieId.apply(lambda x: movie2idx[x])

nmovie_id = ratings_df.movieId.nunique()
nuser_id = ratings_df.userId.nunique()

#movie input network
input_movies = tf.keras.layers.Input(shape=[1])
print(input_movies)
embed_movies = tf.keras.layers.Embedding(nmovie_id + 1, 15)(input_movies)
movies_out = tf.keras.layers.Flatten()(embed_movies)

#user input network
input_users = tf.keras.layers.Input(shape=[1])
embed_users = tf.keras.layers.Embedding(nuser_id + 1, 15)(input_users)
users_out = tf.keras.layers.Flatten()(embed_users)

conc_layer = tf.keras.layers.Concatenate()([movies_out, users_out])
x = tf.keras.layers.Dense(128, activation='relu')(conc_layer)
x_out = tf.keras.layers.Dense(1, activation='relu')(x)
model = tf.keras.Model([input_movies, input_users], x_out)

opt = tf.keras.optimizers.Adam(learning_rate=0.001)
model.compile(optimizer=opt, loss='mean_squared_error')
model.summary()

model.fit([ratings_df.movieId, ratings_df.userId], ratings_df.nota, batch_size=30, epochs=10, verbose=1)

model.save(('../modelpy.h5'))
print("Modelo guardado")

os.system("conda activate C:/Users/Sergi/Anaconda3/envs/tensorflowks & tensorflowjs_converter --input=keras  ../modelpy.h5 ../modeltf")
print("Model pasado a js")
