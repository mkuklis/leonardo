config.init({
  concat: {
    'dist/leonardo.js': ['src/leonardo.js', 'src/color.js', 'src/matrix.js', 'src/element.js']
  },
  min: {
    'dist/leonardo.min.js': ['leonardo.js']
  },
  lint: {
    files: ['src/*.js']
  }
});

task.registerTask('default', 'concat min');
