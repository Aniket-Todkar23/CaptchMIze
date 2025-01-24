module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    execute: {
      build: {
        src: [ 'updateBotList.js' ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-execute');

  grunt.registerTask('updateBotList', 'execute:build');
  grunt.registerTask('default', ['updateBotList']);


};
