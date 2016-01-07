'use strict';

var bank = {
  freeMoney: 1000000,

  currencyType: '$',

  giveLotsOfMoney: function() {
    console.log('Bank gives ' + this.freeMoney + this.currencyType);
    console.log('Please, take this free money!');

    return this.freeMoney;
  }
};

module.exports = bank;