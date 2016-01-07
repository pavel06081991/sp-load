'use strict';

require('./modules-loading');

var spLoad = require('sp-load'),
  $ = spLoad.getModules(__dirname);

$.mike.sayHello();
$.mike.takeMoneyInBank();

$.pasha.sayHello();
$.pasha.askMikeToTakeMoneyInBank();

$._.forOwn($.pasha.futureChildren, function(childCharacteristics, childId) {
  $.pasha.tellAboutChild(childId);
});