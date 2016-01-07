'use strict';

var spLoad = require('sp-load');

spLoad.registerModules([
  {
    currentModuleDir: __dirname,

    formatting: {
      renaming: {
        lodash: '_'
      }
    },

    requireFn: require
  },

  {
    currentModuleDir: __dirname,

    modulesListsProperties: [
      '_localDependencies'
    ],

    requireFn: require
  }
]);