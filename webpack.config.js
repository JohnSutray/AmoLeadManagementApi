const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'amo-integration.js',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    contentBase: 'dist',
    compress: true,
    port: 3001,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'source-map-loader',
      },
      { test: /\.ts?$/, use: 'ts-loader' },
      { test: /\.js?$/, use: 'babel-loader' },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
      },
    }),
  ],
};
