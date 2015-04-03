var gulp = require('gulp'),
  mocha = require('gulp-mocha');


gulp.task('test', function() {
  return gulp.src('test/**/*.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec' //or nyan :)
    }))
    .once('end', function() {
      process.exit();
    });
});
