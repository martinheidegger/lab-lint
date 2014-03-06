lab-lint
========

This small library offers JsLinting for the [spumko/lab](https://github.com/spumko/lab) testing framework. 

usage
=====

Install the library using npm:

```
npm i lab-lint --save-dev
```

Create a unit test in your /test folder and add following lines:

```
"use strict";

/*jslint nomen: true*/
var dirname = __dirname;
/*jslint nomen: false */

require("lab-lint")(dirname);
```

This will automatically add linting of all .js files in the /lib and /test folder of your project. (yes, it is opinionated :-p)

configuration
=============

You can setup your guidelines by adding a .jslint file to your project folder. It's a json file and accepts all settings that jslint
accepts.
