config.init({
  min: {
    'dist/leonardo.min.js': ['src/leonardo.js', 'src/color.js', 'src/matrix.js', 'src/element.js']
  },
  lint: {
    files: ['src/*.js']
  }
});

task.registerTask('default', 'min');
