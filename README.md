# sp-load

## Description

* Do you hate lots of require calls on the top of your files?
* Do you want to have on demand modules loading(lazy loading)?
* Do you want to have local modules instead of using absolute or relative paths for getting modules?

If the answer is "yes" - the sp-load is what you need! Just read "usage" section and I think you will like this module.

## Install

```sh
$ npm install --save-dev sp-load
```

## Usage

The simplest usage.
For example you have `package.json` file, here is its content:

```json
{
    "name": "your-project",
    "version": "1.0.0",
    "main": "index.js",
    "dependencies": {
        "lodash": "^3.10.1",
        "sp-load": "^1.0.0"
    },
    "devDependencies": {
        "gulp": "^3.9.0",
        "webpack": "^1.12.9"
    },
    "_localDependencies": {
        "core": "./core/core",
        "some-module": "./deep/deep/deep/deep/deep/deep/deep/some-module"
    },
    "_coreDependencies": {
        "path": "path",
        "fs": "fs"
    }
}
```

And you have the next files structure:

```javascript
your-project/
    node_modules
        sp-load/
            ...
        gulp/
            ...
        lodash/
            ...
        webpack/
            ...
    package.json
    core/
        core.js
    deep/
        deep/
            deep/
                deep/
                    deep/
                        deep/
                            deep/
                                some-module.js
    gulpfile.js
    index.js
```

Here is content of gulpfile.js:

```javascript
'use strict';

var $ = require('sp-load'),
    webpackConfig = {};

$.gulp.task("webpack", function (callback) {
  $.webpack(webpackConfig, function (err, stats) {
    callback();
  });
});
```

Here is content of some-module.js:

```javascript
'use strict';

function someModuleFuction() {
    console.log('I\'m some module function call!');
}

module.exports = someModuleFuction;
```

Here is content of core.js:

```javascript
'use strict';

function coreModuleFuction() {
    console.log('I\'m core module function call!');
}

module.exports = coreModuleFuction;
```

Here is content of index.js:

```javascript
'use strict';

var $ = require('sp-load');

$.someModule();

$.core();
```

As you can see all you need to do is "require('sp-load')". It returns object, which contains list of on demand modules.
These modules will be loaded only when you call module name from the object, for example module "gulp" will be loaded
at the moment when you first call $.gulp(...);

Also as you can see in package.json there is a property "_localDependencies". In this property you can define local
modules of your project. Just define module name as key and path of module as value. Path must be relative to
package.json file.

Also as you can see in package.json there is a property "_coreDependencies". In this property you can define core
modules of nodejs, for example "path" or "fs" modules. Just define module name as key and anything as value. Value
is not used but must be defined, so "path": "path" and "path": "abcdefg" will work equally.

If you want to use modules without using "$" object, you can do like in the next examples.
Here is example with using "es6 destructuring assignment". To use es6 features in node js, read node js documenation
how to turn on "es6":

```javascript
'use strict';

var {someModule, core} = require('sp-load');

someModule();

core();
```
Here is example with using "es5":

```javascript
'use strict';

var $ = require('sp-load'),
    someModule = $.someModule,
    core = $.core;

someModule();

core();
```

## Advanced usage

You can configure sp-load. Just add "_sp-load" property in package.json.
Here is example of package.json with configs(description of each config option see in comments):

```javascript
{
    "name": "your-project",
    "version": "1.0.0",
    "main": "index.js",
    "dependencies": {
        "lodash": "^3.10.1",
        "sp-load": "^1.0.0"
    },
    "devDependencies": {
        "gulp": "^3.9.0",
        "webpack": "^1.12.9"
    },
    "_localDependencies": {
        "core": "./core/core",
        "some-module": "./deep/deep/deep/deep/deep/deep/deep/some-module"
    },
    "_coreDependencies": {
        "path": "path",
        "fs": "fs"
    },
    "_sp-load": {
        /*
            if true, modules names will be transformed to camel case,
            for example $.someModule instead of $['some-module'].
            default value is true.
        */
        "camelizing": false,
        /*
            this option renames modules names. for example instead of $.lodash, lodash module will be available as $._
        */
        "renaming": {
            "lodash": "_",
            "gulp": "supergulp"
        },
        /*
            if you want to replace some part of modules names use this option. The key is regular expression(regexp),
            the value is a replace string. For example you have gulp plugins. The names of most gulp plugins start with
            "gulp-" prefix, for example "gulp-concat". And you want to use this plugin as $.concat instead of
            $.gulpConcat
        */
        "replacing": {
            "/^gulp-/": ""
        }
    }
}
```

Maybe you do not want to put configs and local and core modules lists to package.json, you can create _sp-load.json
and put this file to package.json file directory.

```javascript
yourProject/
    package.json
    _sp-load.json
```

Here is example of package.json:

```json
{
    "name": "your-project",
    "version": "1.0.0",
    "main": "index.js",
    "dependencies": {
        "lodash": "^3.10.1",
        "sp-load": "^1.0.0"
    },
    "devDependencies": {
        "gulp": "^3.9.0",
        "webpack": "^1.12.9"
    }
}
```

Here is example of _sp-load.json:

```json
{
    "_localDependencies": {
        "core": "./core/core",
        "some-module": "./deep/deep/deep/deep/deep/deep/deep/some-module"
    },
    "_coreDependencies": {
        "path": "path",
        "fs": "fs"
    },
    "_sp-load": {
        "camelizing": false,
        "renaming": {
            "lodash": "_",
            "gulp": "supergulp"
        },
        "replacing": {
            "/^gulp-/": ""
        }
    }
}
```

Also when you do var $ = require('sp-load');, the object $ has property "_spModulesList" in its prototype object. It
contains object where the keys are modules names(external, core and local modules) and the values are modules paths.
For local modules paths are absolute paths to modules files. For core and external modules paths are modules names.
For examples(camelizing option is set to false):

```javascript
{
    "path": "path",
    "fs": "fs",
    "lodash": "lodash",
    "sp-load": "sp-load",
    "gulp": "gulp",
    "webpack": "webpack",
    "core": "D://your-project//core//core.js",
    "some-module": "D://your-project//deep//deep//deep//deep//deep//deep//deep//some-module.js"
}
```

It may be usefull if you want for example to load some local module using System.js loader.