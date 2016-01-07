'use strict';

var spLoad = require('sp-load'),
  $ = spLoad.getModules(__dirname);

var Mike = {
  money: 123,

  currencyType: '$',

  sayHello: function() {
    console.log('Hello, I\'m Mike!');

    this.countMoney();
  },

  countMoney: function() {
    console.log('Now Mike has ' + this.money + this.currencyType);
  },

  takeMoneyInBank: function() {
    console.log('Mike is getting money in bank.');

    this.saveMoney($.bank.giveLotsOfMoney());
  },

  saveMoney: function(money) {
    this.money += money;

    this.countMoney();
  }
};

module.exports = Mike;