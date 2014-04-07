"use strict";

var jslint = require("jslint").load("latest"),
    glob = require('glob'),
    fs = require('fs'),
    reporter = require('jslint/lib/reporter');

function rethrow(error) {
    var message = error;
    if (error.message) {
        message = error.message;
    }
    throw new Error(message);
}


function LabLint(Lab, dirname) {
    Lab.experiment("Linting of file", function () {
        var files = glob.sync(dirname + "/../{lib,test}/**/*.js"),
            jslintOptions = LabLint.loadConfig(dirname);
        files.forEach(function (file) {
            Lab.test(file, function (done) {
                LabLint.lintFile(file, jslintOptions, LabLint.throwErrorWrapper(done));
            });
        });
    });
}

LabLint.throwErrorWrapper = function (wrapped) {
    return function (error) {
        if (error) {
            rethrow(error);
        } else {
            var args = [],
                i;
            for (i = arguments.length - 1; i >= 1; i -= 1) {
                args[i - 1] = arguments[i];
            }
            wrapped.apply(null, args);
        }
    };
};

LabLint.loadConfig = function (dirname) {
    var lintConfig = dirname + '/../.jslint',
        file,
        jslintOptions;
    /*jslint stupid: true*/
    if (fs.existsSync(lintConfig)) {

        try {
            file = fs.readFileSync(lintConfig);
        } catch (e) {
            return {node: true};
        }

        try {
            jslintOptions = JSON.parse(file);
        } catch (e) {
            throw new Error("Error while parsing .jslint file: " + e.stack);
        }
        if (!jslintOptions.hasOwnProperty("node")) {
            jslintOptions.node = true;
        }
        return jslintOptions;
    }
    return {node: true};
};

LabLint.lintFile = function (file, jslintOptions, callback) {
    fs.readFile(file, function (error, result) {
        if (error) {
            return callback(error);
        }
        var fileContent = result.toString(),
            match = jslint(fileContent, jslintOptions),
            loggerOutput = "",
            logger = {
                log: function () {
                    loggerOutput += Array.prototype.join.call(arguments, [" "]) + "\n";
                }
            };

        if (!match) {
            reporter.setLogger(logger);
            reporter.report(file, jslint.data());
            return callback(new Error("Error while linting: \n" + loggerOutput));
        }
        callback(null);
    });
};

module.exports = LabLint;