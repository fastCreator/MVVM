'use strict'

const webpack = require('webpack') 
const path = require('path') 
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
     path: path.resolve(__dirname,'../dist'),
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
  },
  plugins:[
    new HtmlWebpackPlugin({ 
      template: path.resolve(__dirname, 'index.html'),
      filename: 'test.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
        port:3000
  }
}
