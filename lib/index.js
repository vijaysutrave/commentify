#!/usr/bin/env node
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var colors = require('colors');
var glob = require('glob');
var fs = require('fs');
var prompt = require('prompt');

var main = void 0;

/**
* Desc: Gets file(s) in the directory specified
* @param dir: The directory / file specified.
*/
var getFiles = function getFiles(dir) {
    return glob.sync(dir, {
        ignore: ['node_modules/**/*', 'lib/**/*', 'dist/**/*']
    });
};

/**
* Desc: Checks if there are comments already on the function.
* @param arr: Array to check if the comments exist
* @param index: Current Index to loop through the array
*/
var checkIfCommentExists = function checkIfCommentExists(arr, index) {
    if (arr[index] || arr[index] === '') {
        if (arr[index].trim() === '' || arr[index] === '' && arr[index - 1]) {
            return checkIfCommentExists(arr, index - 1);
        } else if (arr[index].match(/\*\//)) {
            return true;
        }
        return false;
    }

    return false;
};

/**
* Desc: Check if it is a function call, not declaration
* @param value: The current part of the html string.
*/
var isFunctionCall = function isFunctionCall(value) {
    if (value.match(/=[^\.]*=>/) || value.match(/=\s*(?!\.)*function/) || value.match(/function\s*[a-zA-z]+\(/)) {
        return false;
    }

    return true;
};

var getSpacesToIndent = function getSpacesToIndent(currentItem) {
    console.log(currentItem);
    return currentItem.substring(0, currentItem.search(/[^\s]/));
};

/**
* Desc: Adds comments to the file, iteratively.
* @param filename: Name of the file currently adding comment to.
*/
var addComment = function addComment(filename) {
    fs.readFile(filename, 'utf-8', function (err, data) {
        if (err) throw err;
        console.log(colors.green('Adding comments to ' + filename + '...'));
        var contentArray = data.split('\n');
        var commentedFunction = contentArray.map(function (value, index) {
            if (value.match(/\(.*\)/) && !isFunctionCall(value)) {
                var commentsExists = checkIfCommentExists(contentArray, index - 1);
                if (!commentsExists) {
                    var _ret = function () {
                        var indentSpace = getSpacesToIndent(value);
                        var generateComment = indentSpace + '/**\n' + indentSpace + '* Desc:\n';
                        var x = value.match(/\(.*\)/)[0];
                        var params = x.slice(1, -1).split(',');

                        if (params.length && params[0]) {
                            params.forEach(function (param) {
                                generateComment += indentSpace + '* @param ' + param.trim() + '\n';
                            });
                        }
                        generateComment += indentSpace + '*/\n ' + value;
                        return {
                            v: generateComment
                        };
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }
                return value;
            }

            return value;
        }, contentArray).join('\n');

        fs.writeFile(filename, commentedFunction, 'utf-8', function (fileError) {
            if (fileError) throw fileError;
            console.log(colors.green('Added comments to ' + filename + '.'));
        });
    });
};

var promptProps = {
    properties: {
        fileOrDirectory: {
            pattern: /^[f|d]$/,
            message: 'Enter either (f) or (d)',
            required: true,
            description: 'File (f) or Directory (d) ?'
        },
        directory: {
            pattern: /^[a-zA-z0-9_\-\/]+$/,
            message: 'Name must be a valid directory name, if file do not add the JS extension',
            required: true,
            description: 'Which one?'
        }
    }
};

/**
* Desc: The inital function to prompt the user to specify directory.
*/
var getFileNames = function getFileNames() {
    prompt.start();
    console.log(colors.green('This will add comments to your JS file / directory you specify.'));
    console.log(colors.red('Running a version control system like git is recommended.'));
    prompt.get(promptProps, function (err, result) {
        var isDirectory = result.fileOrDirectory === 'd';
        var path = void 0;
        if (isDirectory) {
            path = result.directory + '/**/*';
        } else {
            path = result.directory + '.js';
        }
        var files = getFiles(path);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var fileName = _step.value;

                addComment(fileName);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    });
};

/**
* Desc: App entry point.
*/
main = function main() {
    getFileNames();
};

main();