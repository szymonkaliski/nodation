module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			main: {
				files: [
					{expand: true, cwd: 'components/pex/src/', src: ['**'], dest: 'public/scripts/libraries/pex/'},
					{expand: true, cwd: 'components/requirejs/', src: ['require.js'], dest: 'public/scripts/libraries/', filter: 'isFile'},
					{expand: true, cwd: 'components/requirejs-text/', src: ['text.js'], dest: 'public/scripts/libraries/', filter: 'isFile'},
					{expand: true, cwd: 'components/requirejs-domready/', src: ['domReady.js'], dest: 'public/scripts/libraries/', filter: 'isFile'}
				]
			}
		},
		exec: {
			pex: {
				command: function() {
					var cmd = "";
					cmd += "cd components";
					cmd += "&&";

					if (grunt.file.isDir('components/pex/')) {
						cmd += "cd pex";
						cmd += "&&";
						cmd += "git pull";
					}
					else {
						cmd += "git clone git@github.com:szymonkaliski/pex.git";
					}

					return cmd;
				}
			},
			npm: {
				command: 'npm update'
			},
			bower: {
				command: 'bower update'
			},
			mongod: {
				command: 'mongod'
			}
		},
		jshint: {
			files: ['public/scripts/*.js', 'public/scripts/**/*.js', '!public/scripts/libraries/*', '*.js', 'modules/*.js'],
			options: {
				globals: {
					jQuery: true,
					console: true,
					module: true,
					trailing: true
				}
			}
		},
		nodemon: {
			dev: {
				script: 'app.js',
				options: {
					ignoredFiles: ['components/**', 'node_modules/**'],
					watchedExtensions: ['js'],
					env: {
						PORT: '3000'
					},
					cwd: __dirname
				}
			}
		},
		concurrent: {
			dev: {
				// tasks: ['exec:mongod', 'nodemon', 'watch'],
				tasks: ['nodemon', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		},
		watch: {
			files: ['public/scripts/**', 'modules/**', '*.js'],
			tasks: ['lint']
		}
	});

	// load libs
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-exec');

	// building task
	grunt.registerTask('build', ['exec:npm', 'exec:bower', 'exec:pex', 'copy']);

	// linting task
	grunt.registerTask('lint', ['jshint']);

	// run task
	grunt.registerTask('run', ['concurrent']);

	// default task
	grunt.registerTask('default', ['run']);

	// heroku task
	grunt.registerTask('heroku', []);
};
