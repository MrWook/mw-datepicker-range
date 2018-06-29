module.exports = function(copyright, name){
	return {
		build: {
			options: {
				banner:      copyright,
				sourceMap:   true,
				sourceMapIn: 'dist/js/'+name+'.js.map',
				sourceMapPrefix: 2,
			},
			files:   [
				{
					src:  ['dist/js/'+name+'.js'],
					dest: 'dist/js/'+name+'.min.js'
				}
			]
		}
	};
};