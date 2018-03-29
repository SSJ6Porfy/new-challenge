const path = require('path');

module.exports = {
  entry: './squares.js',
  output: {
    filename: 'bundle.js'
  },
  mode: 'development',
  module: {
    rules: [
      { test: /\.jsx$/, 
        use: 'babel-loader', 
        exclude: /node_modules/
         }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    port: 8000,
    hot: true
  }
};