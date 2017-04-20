'use strict'

const webpack = require('webpack') 
const path = require('path') 
module.exports = {
  entry: './src/index.js',
  output: {
     path: path.join(__dirname,'./dist'),
     filename: 'MVVM.js' 
  }, 
  module: {
    loaders: [ 
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: [/node_modules/]
      }
    ]
  }
}
