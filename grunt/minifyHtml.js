module.exports = function(){
	return {
		options: {
			cdata:  false,
			empty:  false,
			quotes: true
		},
		dist:    {
			files: [
				{
					expand: true,
					cwd:    'src/templates',
					src:    ['**/*.html'],
					dest:   'tmp/templates_min/'
				}
			]
		}
	};
};