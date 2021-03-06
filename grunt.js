module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      dist: {
        src: [
          'src/leonardo.js',
          'src/matrix.js',
          'src/color.js',
          'src/element.js',
          'src/emitter.js',
          'src/event.js',
          'src/polyfill.js',
          'src/easings.js',
          'src/animation.js',
          'src/transformation.js'
        ],
        dest: 'leonardo.js'
      }
    },

    min: {
      dist: {
        src: [
          'src/leonardo.js',
          'src/matrix.js',
          'src/color.js',
          'src/element.js',
          'src/emitter.js',
          'src/event.js',
          'src/polyfill.js',
          'src/easings.js',
          'src/animation.js',
          'src/transformation.js'
        ],
        dest: 'leonardo.min.js'
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

  grunt.registerTask('default', 'lint concat min');
}
