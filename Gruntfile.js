const sass = require('node-sass');
module.exports = function (grunt) {
  require('jit-grunt')(grunt, {
    sass: 'grunt-sass',
    watch: 'grunt-contrib-watch',
    concurrent: 'grunt-concurrent',
    postcss: 'grunt-postcss',
    uglify: 'grunt-contrib-uglify',
    copy: 'grunt-contrib-copy',
    connect: 'grunt-contrib-connect',
    clear: 'grunt-contrib-clear',
  });
  require('time-grunt')(grunt);
  grunt.initConfig({
    //pkg: grunt.file.readJSON('package.json'),
    app: 'app',
    dist: 'dist',

    sass: {
      dist: {
        options: {
          implementation: sass,
          compass: false
        },
        files: {
          '<%= app %>/assets/css/curcuma.css': '<%= app %>/assets/scss/curcuma.scss'
        }
      }
    },

    watch: {
      sass: {
        files: ['<%= app %>/assets/scss/**/*.scss'],
        tasks: ['sass']
      },
      js: {
        files: ['<%= app %>/assets/js/*.js', '<%= app %>/assets/js/**/*.js', '!<%= app %>/assets/js/**/*.min.js', '!<%= app %>/assets/js/dev.js'],
        tasks: ['uglify:dev']
      },
      livereload: {
        files: ['<%= app %>/**/*.html', '<%= app %>/**/**/*.html', '<%= app %>/assets/js/**/*.js', '<%= app %>/assets/scss/**/*.scss'],
        options: {
          livereload: true
        }
      }
    },

    cssmin: {
      app: {
        options: {
          sourceMap: true
        },
        files: [{
          expand: true,
          cwd: '<%= app %>/assets/css',
          src: ['*.css', '!*.min.css'],
          dest: '<%= app %>/assets/css',
          ext: '.min.css'
        }]
      },
      dist: {
        options: {
          sourceMap: false
        },
        files: [{
          expand: true,
          cwd: '<%= dist %>/assets/css',
          src: ['*.css', '!*.min.css'],
          dest: '<%= dist %>/assets/css',
          ext: '.min.css'
        }]
      }
    },

    uglify: {
      dev: {
        options: {
          manage: false,
          preserveCommens: 'some',
          sourceMap: true,
          sourceMapName: '<%= app %>/assets/js/sourcemap.map'
        },
        files: {
          '<%= app %>/assets/js/app.min.js': ['<%= app %>/assets/js/*.js', '<%= app %>/assets/js/**/*.js', '!<%= app %>/assets/js/*.min.js', '!<%= app %>/assets/js/**/*.min.js']
        }
      },
      dist: {
        options: {
          manage: false,
          preserveCommens: 'some'
        },
        files: {
          '<%= dist %>/assets/js/app.min.js': ['<%= app %>/assets/js/*.js', '<%= app %>/assets/js/**/*.js', '!<%= app %>/assets/js/*.min.js', '!<%= app %>/assets/js/**/*.min.js']
        }
      }
    },

    postcss: {
      options: {
        map: true,

        processors: [require('pixrem')(), require('autoprefixer')({
          browsers: 'last 2 version'
        }), require('cssnano')]
      },
      dist: {
        src: '<%= dist %>/assets/css/*.css'
      }
    },

    image: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= app %>/assets/images/',
          src: ['**/*.{jpg,gif,svg,jpeg,png}'],
          dest: '<%= dist %>/assets/images/'
        }]
      }
    },

    clean: {
      dist: {
        src: ['<%= dist %>/*']
      }
    },

    copy: {
      main: {
        expand: true,
        cwd: '<%= app %>/',
        src: ['assets/**', '/*.html', '**/*.html', '!assets/images/*.{jpg,gif,svg,jpeg,png}', '!assets/**/*.scss', '!bower_components/**'],
        dest: '<%= dist %>/'
      }
    },

    connect: {
      app: {
        options: {
          port: 4200,
          base: '<%= app %>/',
          open: true,
          livereload: true,
          hostname: '127.0.0.1',
          middleware: function (connect, options, middlewares) {
            var modRewrite = require('connect-modrewrite');
            middlewares.unshift(modRewrite(['^[^\\.]*$ /index.html [L]']));
            return middlewares;
          }
        }
      },
      mobile: {
        options: {
          port: 4200,
          base: '<%= app %>/',
          open: false,
          livereload: 1337,
          hostname: '0.0.0.0'
        }
      },
      dist: {
        options: {
          port: 9001,
          base: '<%= dist %>/',
          open: true,
          keepalive: true,
          livereload: false,
          hostname: '127.0.0.1'
        }
      }
    }
  });

  grunt.registerTask('default', ['sass', 'uglify:dev', 'connect:app', 'watch']);
  grunt.registerTask('build', ['clean:dist', 'sass', 'copy:main', 'uglify', 'postcss', 'newer:image']);
};