// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// module dependencies
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const markedConfig = require('./marked.config');
const helpers = require('./helpers');

const title = 'Platform for AI';
const version = require('../package.json').version;
const FABRIC_DIR = path.resolve(__dirname, '../src/app/job/job-view/fabric');

function generateHtml(opt) {
  return new HtmlWebpackPlugin(Object.assign({
    title: title,
    version: version,
    template: './src/app/layout/layout.component.ejs',
    minify: {
      collapseWhitespace: true,
      html5: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeTagWhitespace: true,
    },
  }, opt));
}

const config = (env, argv) => ({
  entry: {
    'index': './src/app/index.js',
    'layout': './src/app/layout/layout.component.js',
    'register': './src/app/user/user-register/user-register.component.js',
    'userView': './src/app/user/user-view/user-view.component.js',
    'login': './src/app/user/user-login/user-login.component.js',
    'changePassword': './src/app/user/change-password/change-password.component.js',
    'dashboard': './src/app/dashboard/dashboard.component.js',
    'submit': './src/app/job/job-submit/job-submit.component.js',
    'jobList': './src/app/job/job-view/fabric/job-list.jsx',
    'jobDetail': './src/app/job/job-view/fabric/job-detail.jsx',
    'virtualClusters': './src/app/vc/vc.component.js',
    'services': './src/app/cluster-view/services/services.component.js',
    'hardware': './src/app/cluster-view/hardware/hardware.component.js',
    'hardwareDetail': './src/app/cluster-view/hardware/hardware-detail.component.js',
    'k8s': './src/app/cluster-view/k8s/k8s.component.js',
    'docs': './src/app/job/job-docs/job-docs.component.js',
    'jobSubmit': './src/app/marketplace/job-submit/job-submit.component.js',
    'changeGitHubPAT': './src/app/user/change-github-pat/change-github-pat.component.js',
    'howToConfigGitHubPAT': './src/app/user/how-to-config-github-pat/how-to-config-github-pat.component.js',
    'plugin': './src/app/plugin/plugin.component.js',
    'plugins/marketplace': './src/plugins/marketplace',
  },
  output: {
    path: helpers.root('dist'),
    filename: 'scripts/[name].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [helpers.root('node_modules'), helpers.root('src')],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['lodash'],
            presets: ['@babel/preset-react',
              ['@babel/preset-env', {
                useBuiltIns: 'entry',
                corejs: 3,
              }],
            ],
          },
        },
      },
      {
        test: /\.txt$/,
        loader: 'raw-loader',
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'markdown-loader',
            options: {
              pedantic: true,
              renderer: markedConfig.renderer,
            },
          },
        ],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.ejs$/,
        loader: 'ejs-loader',
      },
      {
        test: /\.(css|scss)$/,
        include: FABRIC_DIR,
        use: [
          argv.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: true,
              minimize: true,
              sourceMap: true,
              modules: true,
              camelCase: true,
              localIdentName: '[name]-[local]--[hash:base64:5]',
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(css|scss)$/,
        exclude: FABRIC_DIR,
        use: [
          argv.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: true,
              minimize: true,
              sourceMap: true,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(jpg|png|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              publicPath: '/assets/img/',
              outputPath: 'assets/img/',
            },
          },
        ],
      },
      {
        test: /\.(eot|woff2?|svg|ttf)([?]?.*)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              publicPath: '/assets/font/',
              outputPath: 'assets/font/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.WatchIgnorePlugin([
      /css\.d\.ts$/,
    ]),
    new MonacoWebpackPlugin({
      languages: ['json', 'css', 'ts', 'html'],
    }),
    new CopyWebpackPlugin([
      {from: 'src/assets', to: 'assets'},
      {from: 'src/assets/img/favicon.ico', to: 'favicon.ico'},
    ]),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].bundle.css',
    }),
    // required by ejs loader
    new webpack.ProvidePlugin({
      _: 'lodash',
    }),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery',
    }),
    new webpack.ProvidePlugin({
      'cookies': 'js-cookie',
      'window.cookies': 'js-cookie',
    }),
    generateHtml({
      filename: 'index.html',
      chunks: ['layout', 'index'],
    }),
    generateHtml({
      filename: 'register.html',
      chunks: ['layout', 'register'],
    }),
    generateHtml({
      filename: 'user-view.html',
      chunks: ['layout', 'userView'],
    }),
    generateHtml({
      filename: 'login.html',
      chunks: ['layout', 'login'],
    }),
    generateHtml({
      filename: 'change-password.html',
      chunks: ['layout', 'changePassword'],
    }),
    generateHtml({
      filename: 'dashboard.html',
      chunks: ['layout', 'dashboard'],
    }),
    generateHtml({
      filename: 'submit.html',
      chunks: ['layout', 'submit'],
    }),
    generateHtml({
      filename: 'job-list.html',
      chunks: ['layout', 'jobList'],
    }),
    generateHtml({
      filename: 'job-detail.html',
      chunks: ['layout', 'jobDetail'],
    }),
    generateHtml({
      filename: 'virtual-clusters.html',
      chunks: ['layout', 'virtualClusters'],
    }),
    generateHtml({
      filename: 'cluster-view/services.html',
      chunks: ['layout', 'services'],
    }),
    generateHtml({
      filename: 'cluster-view/hardware.html',
      chunks: ['layout', 'hardware'],
    }),
    generateHtml({
      filename: 'cluster-view/k8s.html',
      chunks: ['layout', 'k8s'],
    }),
    generateHtml({
      filename: 'cluster-view/hardware/detail.html',
      chunks: ['layout', 'hardwareDetail'],
    }),
    generateHtml({
      filename: 'docs.html',
      chunks: ['layout', 'docs'],
    }),
    generateHtml({
      filename: 'submit-v2.html',
      chunks: ['layout', 'jobSubmit'],
    }),
    generateHtml({
      filename: 'change-github-pat.html',
      chunks: ['layout', 'changeGitHubPAT'],
    }),
    generateHtml({
      filename: 'how-to-config-github-pat.html',
      chunks: ['layout', 'howToConfigGitHubPAT'],
    }),
    generateHtml({
      filename: 'plugin.html',
      chunks: ['layout', 'plugin'],
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '..', 'dist'),
    port: 9286,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
      }),
    ],
  },
  node: {
    global: true,
    fs: 'empty',
    process: true,
    module: false,
  },
});

module.exports = config;
