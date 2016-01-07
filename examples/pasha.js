'use strict';

var spLoad = require('sp-load'),
  $ = spLoad.getModules(__dirname);

var Pasha = {
  futureChildren: {
    '1': {
      name: 'Anna',
      birthday: '10.06.2018',
      'about me': 'my future father is great!'
    }
  },

  tellAboutChild: function (childId) {
    $._.forOwn(this.futureChildren[childId], function(characteristic, characteristicName) {
      console.log(characteristicName + ': ' + characteristic);
    });
  },

  sayHello: function() {
    console.log('Hello, I\'m Pasha!');
  },

  askMikeToTakeMoneyInBank: function() {
    console.log('Pasha asks Mike to give money in bank.');

    $.mike.takeMoneyInBank();
  }
};

module.exports = Pasha;