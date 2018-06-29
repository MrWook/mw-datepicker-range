'use strict';
module.exports = function(grunt){
	let name = '<%= pkg.name %>';

	let copyright = `/**
* @version v<%= pkg.version %>
* @link <%= pkg.homepage %>
* @license <%= pkg.license %>
* Copyright (c) ${(new Date()).getFullYear()}} <%= pkg.author %>
*/\r`;

	let prefix = '(function(angular, undefined){\n \'use strict\';\n';
	let suffix = '\n})(angular);';

	// Load all grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long grunt task take. Can help when optimizing build times
	require('time-grunt')(grunt);

	//Configure grunt
	grunt.initConfig({
						 pkg:        grunt.file.readJSON('package.json'),
						 babel:      require('./grunt/babel')(),
						 clean:      require('./grunt/clean')(),
						 concat:     require('./grunt/concat')(copyright, name, prefix, suffix),
						 html2js:    require('./grunt/html2js')(name),
						 minifyHtml: require('./grunt/minifyHtml')(),
						 uglify:     require('./grunt/uglify')(copyright, name)
					 });

	// Build distribution files
	grunt.registerTask('default', [
		'minifyHtml',
		'html2js',
		'babel',
		'concat:modules',
		'uglify',
		'clean'
	]);
};