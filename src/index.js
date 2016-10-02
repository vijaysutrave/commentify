#!/usr/bin/env node

const colors = require('colors');
const glob = require('glob');
const fs = require('fs');
const prompt = require('prompt');

let main;

/**
* Desc: Gets file(s) in the directory specified
* @param dir: The directory / file specified.
*/
let getFiles = (dir) => glob.sync(dir, {
    ignore: ['node_modules/**/*', 'lib/**/*', 'dist/**/*']
});

/**
* Desc: Checks if there are comments already on the function.
* @param arr: Array to check if the comments exist
* @param index: Current Index to loop through the array
*/
let checkIfCommentExists = (arr, index) => {
    if (arr[index] || arr[index] === '') {
        if (arr[index].trim() === '' || (arr[index] === '' && arr[index - 1])) {
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
let isFunctionCall = (value) => {
    if (value.match(/=[^\.]*=>/) ||
        value.match(/=\s*(?!\.)*function/) ||
        value.match(/function\s*[a-zA-z]\(/)
    ) {
        return false;
    }

    return true;
};


/**
* Desc: Adds comments to the file, iteratively.
* @param filename: Name of the file currently adding comment to.
*/
let addComment = (filename) => {
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) throw err;
        console.log(colors.green(`Adding comments to ${filename}...`));
        let contentArray = data.split('\n');
        let commentedFunction = contentArray.map((value, index) => {
            if (value.match(/\(.*\)/) && !isFunctionCall(value)) {
                let commentsExists = checkIfCommentExists(contentArray, index - 1);
                if (!commentsExists) {
                    let generateComment = '/**\n* Desc:\n';
                    let x = value.match(/\(.*\)/)[0];
                    let params = x.slice(1, -1).split(',');

                    if (params.length && params[0]) {
                        params.forEach((param) => {
                            generateComment += `* @param ${param.trim()}\n`;
                        });
                    }
                    generateComment += `*/\n ${value}`;
                    return generateComment;
                }
                return value;
            }

            return value;
        }, contentArray).join('\n');

        fs.writeFile(filename, commentedFunction, 'utf-8', (fileError) => {
            if (fileError) throw fileError;
            console.log(colors.green(`Added comments to ${filename}.`));
        });
    });
};

const promptProps = {
    properties: {
        fileOrDirectory: {
            pattern: /^[f|d]$/,
            message: 'Enter either (f) or (d)',
            required: true,
            description: 'File (f) or Directory (d) ?'
        },
        directory: {
            pattern: /^[a-zA-z0-9_\-]+\/?[a-zA-z0-9_\-]+$/,
            message: 'Name must be only letters, spaces, or dashes, without JS extension',
            required: true,
            description: 'Which one?'
        }
    }
};

/**
* Desc: The inital function to prompt the user to specify directory.
*/
let getFileNames = () => {
    prompt.start();
    console.log(colors.green('This will add comments to your JS file / directory you specify.'));
    console.log(colors.red('Running a version control system like git is recommended.'));
    prompt.get(promptProps, (err, result) => {
        let isDirectory = result.fileOrDirectory === 'd';
        let path;
        if (isDirectory) {
            path = `${result.directory}/**/*`;
        } else {
            path = `${result.directory}.js`;
        }
        let files = getFiles(path);
        for (let fileName of files) {
            addComment(fileName);
        }
    });
};

/**
* Desc: App entry point.
*/
main = () => {
    getFileNames();
};

main();
