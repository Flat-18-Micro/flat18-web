// webpack.config.js
const path = require('path');

module.exports = {
  // entry will be set dynamically in the build script
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'], // Use style-loader to bundle CSS into JS
      },
    ],
  },
};
