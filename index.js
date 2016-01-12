'use strict';

var spLoad = require('./sp-load'),
  spLoadProxy = function() {
    return spLoad(module.parent);
  };

module.exports = spLoadProxy();

delete require.cache[__filename];