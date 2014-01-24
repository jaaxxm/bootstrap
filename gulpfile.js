var gulp = require('gulp');

var karma = require('gulp-karma');
var jshint = require('gulp-jshint');

var makeConfig = require('./build.config');
var defaultConfig = makeConfig({});

var scripts = require('./build/scripts');
var docs = require('./build/docs');
var bower = require('./build/bower');

gulp.task('build', function(callback) {
  scripts(gulp, defaultConfig, callback);
});

gulp.task('docs', function(callback) {
  docs(gulp, defaultConfig, callback);
});

gulp.task('bower', function(callback) {
  bower(gulp, defaultConfig, callback);
});

gulp.task('test', function(done) {
  return gulp.src(defaultConfig.testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('watch', function() {
  return gulp.src(defaultConfig.testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});

gulp.task('jshint', function() {
  return gulp.src('src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')));
});

gulp.task('default', ['jshint'], function(done) {
  return gulp.run('build', done);
});
