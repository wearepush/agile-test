process.noDeprecation = true;

require('babel-polyfill');

// Webpack config for creating the production bundle.
var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var strip = require('strip-loader');

var projectRootPath = path.resolve(__dirname, '../');
var assetsPath = path.resolve(projectRootPath, './static/dist');
var host = process.env.HOST || '';
var bootstrapEntryPoints = require('./../webpack.bootstrap.config.js');

// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools'));

module.exports = {
  devtool: 'source-map',
  context: path.resolve(__dirname, '..'),
  entry: {
    'main': [
      bootstrapEntryPoints.prod,
      './src/client.js'
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: (host != '' ? 'https://' + host : '') + '/dist/'
  },
  module: {
    rules: [

      {
        test: /\.js?$/,
        use: [
          {
            loader: 'strip-loader',
            options: {
              strip: ['debug']
            }
          },
          {
            loader: 'babel-loader'
          }
        ],
        exclude: /node_modules/
      },

      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },

      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: {
                modules: true,
                importLoaders: 2,
                sourceMap: true,
                localIdentName: '[local]__[hash:base64:5]'
              }
            },
            {
              loader: 'postcss-loader',
              query: {
                browsers: 'last 2 version',
                plugins: function () {
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            },
            {
              loader: 'resolve-url-loader',
            },
            {
              loader: 'sass-loader',
              query: {
                outputStyle: 'expanded',
                sourceMap: true,
                sourceMapContents: true,
              }
            }
          ]
        })
      },

      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'application/font-woff'
        }
      },

      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'application/octet-stream'
        }
      },

      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },

      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'image/svg+xml'
        }
      },

      {
        test: webpackIsomorphicToolsPlugin.regular_expression('images'),
        loader: 'url-loader',
        options: {
          limit: 10240
        }
      }
    ]
  },
  resolve: {
    modules: [
      'src',
      'node_modules'
    ]
  },
  plugins: [
    new CleanPlugin([assetsPath], { root: projectRootPath }),

    // css files from the extract-text-plugin loader
    new ExtractTextPlugin({
      filename: '[name]-[chunkhash].css',
      // disable: false,
      allChunks: true
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
        APIHOST: `"${process.env.APIHOST}"`,
        APIPORT: `"${process.env.APIPORT}"`
      },

      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false
    }),

    // ignore dev config
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),

    // optimizations
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),

    webpackIsomorphicToolsPlugin

  ]
};
