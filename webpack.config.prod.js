const path = require('path');

module.exports = {
  mode: 'production',

  entry: './_assets/ts/index.ts',

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },

  output: {
    path: path.resolve(__dirname, 'assets/js'),
    filename: 'app.js'
  }
};
