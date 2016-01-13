'use strict';

module.exports = require('./sp-load').getModules(module.parent);

delete require.cache[__filename];