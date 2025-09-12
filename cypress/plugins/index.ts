/// <reference types="cypress" />

const webpack = require('@cypress/webpack-preprocessor');

module.exports = (on: any) => {
  const options = {
    webpackOptions: {
      resolve: { extensions: ['.ts', '.js'] },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/],
            use: [{ loader: 'ts-loader' }]
          }
        ]
      }
    }
  };

  on('file:preprocessor', webpack(options));
};
