/*
 * grunt-filerev-assets
 * https://github.com/richardbolt/grunt-filerev-assets
 *
 * Copyright (c) 2013 Richard Bolt
 * Licensed under the MIT license.
 */

'use strict';

var YAML = require('yamljs');

var createNestedObject = function (base, names, value) {
    // If a value is given, remove the last name and keep it for later:
    var lastName = arguments.length === 3 ? names.pop() : false;

    // Walk the hierarchy, creating new objects where needed.
    // If the lastName was removed, then the last object is not set yet:
    for (var i = 0; i < names.length; i++) {
        base = base[names[i]] = base[names[i]] || {};
    }

    // If a value was given, set it to the last name:
    if (lastName) base = base[lastName] = value;

    // Return the last object in the hierarchy:
    return base;
};

module.exports = function (grunt) {

    grunt.registerMultiTask('filerev_assets', 'Record asset paths from grunt-filerev to a json file', function () {
        var self = this, spaces = 0,
            options = self.options({
                dest: 'assets.json',  // Writes to this file.
                prettyPrint: false,
                pathWrapper: null
            });

        // We must have run filerev in some manner first.
        // If we do this: grunt.task.requires('filerev');
        // then if we ran filerev:action we will fail out,
        // when we don't want to. This just checks for the presence of the
        // grunt.filerev object and fails if it's not present.
        // You can override the warning with the --force command line option.
        if (!grunt.filerev) {
            grunt.fail.warn('Could not find grunt.filerev. Required task "filerev" must be run first.');
        }

        if (!options.dest || !grunt.filerev.summary) {
            grunt.log.error('No file saved.');
            grunt.log.error(options.dest, grunt.filerev.summary);
            return;
        }

        if (options.pathWrapper) {
            var objectWrapper = {};
            createNestedObject(objectWrapper, options.pathWrapper.split('.'), grunt.filerev.summary);
            grunt.filerev.summary = objectWrapper;
        }

        if (options.dest.match(/\.yml$/)) {
            grunt.file.write(options.dest, YAML.stringify(grunt.filerev.summary, 4));
        } else {
            grunt.file.write(options.dest, JSON.stringify(grunt.filerev.summary, 4, 2));
        }

        grunt.filerevassets = grunt.filerev.summary;

        grunt.log.writeln('File', options.dest, 'created.');
    });

};
