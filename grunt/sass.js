module.exports = function(){
	return {
		options: {
			outputStyle: 'expanded'
		},
		dist: {
			files: [
				{
					expand: true,
					cwd:    'src/sass/',
					src:    ['**/*.scss'],
					dest:   'tmp/css/',
					ext:    '.css'
				}
			]
		}
	};
};