"use strict";

/*jslint nomen: true*/
var dirname = __dirname;
/*jslint nomen: false */

var Lab = require("lab"),
    lintTest = require("../"),
    fs = require("fs");

lintTest(Lab, dirname);
lintTest(Lab, dirname + "/test_lint_config/test");

Lab.experiment("Not easily testable stuff:", function () {

    Lab.test("Error wrapper should be able to deal with strings", function (done) {
        try {
            lintTest.throwErrorWrapper(null)("hi");
        } catch (error) {
            if (error.message === "hi") {
                done();
                return;
            }
        }
        throw new Error("error not thrown");
    });

    Lab.test("Error wrapper should be able to deal with errors", function (done) {
        try {
            lintTest.throwErrorWrapper(null)(new Error("hi"));
        } catch (error) {
            if (error.message === "hi") {
                done();
                return;
            }
        }
        throw new Error("error not thrown");
    });

    Lab.test("Loading a not existant config should return an error", function (done) {
        var testFolder = dirname + "/test_lint_config",
            jsLintFile = testFolder + "/.jslint";
        fs.chmod(jsLintFile, "0s200", function (error) {
            Lab.expect(error).to.equal(null);
            lintTest.loadConfig(testFolder + "/test", function (testError) {
                fs.chmod(jsLintFile, "0644", function (error) {
                    Lab.expect(error).to.equal(null);
                    Lab.expect(testError).to.not.equal(null);
                    done();
                });
            });
        });
    });

    Lab.test("Linting not existant file", function (done) {
        lintTest.lintFile(dirname + "/not_existing", {}, function (error) {
            Lab.expect(error).to.not.equal(null);
            done();
        });
    });

    Lab.test("Linting a broken file should return an error", function (done) {
        lintTest.lintFile(dirname + "/notLintValid.js.hidden", {}, function (error) {
            Lab.expect(error).to.not.equal(null);
            done();
        });
    });

    Lab.test("Loading a broken config should return an error", function (done) {
        lintTest.loadConfig(dirname + "/test_broken_lint_config/test", function (error) {
            Lab.expect(error).to.not.equal(null);
            done();
        });
    });
});