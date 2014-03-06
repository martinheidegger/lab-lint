"use strict";

var jslint = require("jslint").load("latest"),
    Lab = require("lab"),
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


function LabLint(dirname) {
    Lab.experiment("Linting of file", function () {
        var files = glob.sync(dirname + "/../{lib,test}/**/*.js"),
            jslintOptions;
        Lab.before(function (done) {
            LabLint.loadConfig(dirname, LabLint.throwErrorWrapper(function (options) {
                jslintOptions = options;
                done();
            }));
        });
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

LabLint.loadConfig = function (dirname, callback) {
    var lintConfig = dirname + '/../.jslint';
    fs.exists(lintConfig, function (exists) {
        if (exists) {
            fs.readFile(lintConfig, function (error, result) {
                if (error) {
                    return callback(error, null);
                }
                var jslintOptions;
                try {
                    jslintOptions = JSON.parse(result);
                } catch (e) {
                    return callback(new Error("Error while parsing .jslint file: " + e.stack), null);
                }
                if (!jslintOptions.hasOwnProperty("node")) {
                    jslintOptions.node = true;
                }
                callback(null, jslintOptions);
            });
        } else {
            callback(null, {node: true});
        }
    });
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