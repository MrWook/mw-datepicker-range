module.exports = function(copyright, name){
	return {
		build: {
			options: {
				sourceMap: true,
				banner:    copyright
			},
			files:   [
				{
					src:  ['tmp/css/**/*.css'],
					dest: 'dist/css/'+name+'.min.css'
				}
			]
		}
	};
};