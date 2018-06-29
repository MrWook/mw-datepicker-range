module.exports = function(copyright, name, prefix, suffix){
	return {
		options: {
			sourceMap: true,
			banner:    copyright
		},
		modules: {
			options: {
				banner:  copyright+prefix,
				footer:  suffix,
				process: function(src){
					return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
				}
			},
			src:     [
				'src/'+name+'.js',
				'tmp/modules/**/*.js',
				'tmp/templates.js'
			],
			dest:    'dist/js/'+name+'.js'
		},
		css:     {
			src:  ['tmp/css/**/*.css'],
			dest: 'dist/css/'+name+'.css'
		}
	};
};