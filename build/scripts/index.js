var template = require('lodash.template');
var es = require('event-stream');

var header = require('gulp-header');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var minifyHtml = require('gulp-minify-html');
var html2js = require('gulp-ng-html2js');
var uglify = require('gulp-uglify');

module.exports = buildScripts;

function buildScripts(gulp, config, done) {
  var jsDest = template(config.jsFile, { pkg: config.pkg });
  var bundleDest = template(config.bundleFile, { pkg: config.pkg });
  var jsModules = config.modules.map(uiBootstrapPrefix);
  var htmlModules = config.templates.map(enquote);

  //Build without templates
  //The passed in gulp instance is from project root, so it resolves from there
  var js = gulp.src(config.globs.js, { base: '.' })
    .pipe(concat(jsDest))
    .pipe(header(config.jsModule, {
      modules: jsModules
    }))
    .pipe(header(config.banner, {
      timestamp: timestamp, pkg: config.pkg
    }))
    .pipe(writeJavascript(config.dist));

    gulp.src([config.globs.js].concat(config.templates), { base: '.' })
    .pipe(gulpif(/html$/, buildTemplates()))
    .pipe(concat(bundleDest))
    .pipe(header(config.htmlModule, {
      modules: htmlModules
    }))
    .pipe(header(config.bundleModule, {
      modules: jsModules
    }))
    .pipe(header(config.banner, {
      timestamp: timestamp, pkg: config.pkg
    }))
    .pipe(writeJavascript(config.dist))
    .on('end', done||function(){});

  function writeJavascript(dist) {
    return es.pipeline(
      gulp.dest(dist),
      uglify(),
      rename(function(dir, base, ext) {
        //We rename this way instead of just giving new ext, because it
        //treats the version as an ext
        return (base + ext).replace(/.js$/, '.min.js');
      }),
      gulp.dest(dist)
    );
  }
}

function buildTemplates() {
  return es.pipeline(
    minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }),
    html2js(),
    rename({ext: '.html.js'})
  );
}

function enquote(str) {
  return '"' + str + '"';
}
function uiBootstrapPrefix(str) {
  return enquote('ui.bootstrap.' + str);
}
function timestamp() {
  return (new Date()).toISOString().substring(0, 10); //eg 2014-01-21
}
