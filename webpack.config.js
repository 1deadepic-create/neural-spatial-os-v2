const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'NeuroSpatialOS',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|vs|fs)$/,
        type: 'asset/source',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '@core': path.resolve(__dirname, 'src/core/'),
      '@input': path.resolve(__dirname, 'src/input/'),
      '@vision': path.resolve(__dirname, 'src/vision/'),
      '@spatial': path.resolve(__dirname, 'src/spatial/'),
      '@ui': path.resolve(__dirname, 'src/ui/'),
      '@modes': path.resolve(__dirname, 'src/modes/'),
      '@plugins': path.resolve(__dirname, 'src/plugins/'),
      '@ai': path.resolve(__dirname, 'src/ai/'),
      '@connectors': path.resolve(__dirname, 'src/connectors/'),
      '@security': path.resolve(__dirname, 'src/security/'),
      '@render': path.resolve(__dirname, 'src/render/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
    },
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(require('./package.json').version),
    }),
  ],
};
