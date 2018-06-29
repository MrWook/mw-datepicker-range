module.exports = function(name){
	return {
		options: {
			base:         'tmp/templates_min',
			module:       name+'-template',
			indentString: '	',
			singleModule: true
		},
		dist:    {
			src:  ['tmp/templates_min/**/*.html'],
			dest: 'tmp/templates.js'
		}
	};
};