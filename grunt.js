module.exports = function (grunt) {
  grunt.initConfig({
    min: {
      dist: {
        src: [
          'src/leonardo.js',
          'src/color.js',
          'src/matrix.js',
          'src/element.js',
          'src/pubsub.js',
          'src/event.js',
          'src/polyfill.js',
          'src/easings.js',
          'src/animation.js'
        ],
        dest: 'dist/leonardo.min.js'
      }
    },
    jshint: {
      options: {
        asi: true,
        curly: true,
        eqeqeq: false,
        expr: true,
        forin: false,
        newcap: true,
        laxcomma: true
      }
    },
    lint: {
      files: ['src/*.js']
    }
  });

  grunt.registerTask('default', 'lint min');
}
