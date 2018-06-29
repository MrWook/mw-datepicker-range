module.exports = function(){
	return {
		options: {
			sourceMap: true,
			presets:   ['env']
		},
		dist:    {
			files: [
				{
					expand: true,
					cwd:    'src/modules/',
					src:    ['**/*.js'],
					dest:   'tmp/modules'
				}
			]
		}
	};
};