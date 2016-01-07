##CommonJS modules loading on demand.
==============
Written on **ECMAScript® 2015 Language Specification**.

Using **lodash**, **findup-sync** and other as *devDependencies* (See more on the *package.json*).

You could also download module with examples from [npm](https://www.npmjs.com/package/sp-load)

```javascript
'use strict';

require('./modules-loading');

/**load and setup sp-load*/
let spLoad = require('sp-load'),
  $ = spLoad.getModules(__dirname);
  
/**use it*/
$.mike.sayHello();
$.mike.takeMoneyInBank();

/**
* You could also find detailed examples in module folder*
*/

```

Stable version with new secret :wink: and veeeeeeeerrry useful  features comming soon... 

:sunglasses: @pavel06081991

:neckbeard: @viktordavidovich
