var es = require('event-stream');
var template = require('lodash.assign');
var marked = require('marked');
var path = require('path');
var gulpTemplate = require('gulp-template');
var rename = require('gulp-rename');

module.exports = makeDocs;

function makeDocs(gulp, config, callback) {
  /*
   * docs = {
   *   typeahead: { name:'', displayName:'', md:'', js:'', html:'' }
   *   //...others
   * };
   */
  var docs = modulesToDocsObject(config.modules);

  return gulp.src(config.globs.docs, {base: 'src'})
    .pipe(es.map(function(file, cb) {
      //first folder in relative path is the moduleName, since our base is src
      var moduleName = file.relative.split('/')[0];
      var match = file.relative.match(/(md|html|js)$/) || [];
      var fileType = match && match[0];
      if (fileType) {
        docs[moduleName][fileType] = fileType === 'md' ?
          marked(String(file.contents)) :
          String(file.contents);
      }
      cb();
    }).on('end', function() {
      config.docModules = Object.keys(docs).sort().map(function(moduleName) {
        return docs[moduleName];
      }).filter(function(module) {
        return module.html && module.js && module.md; //Modules without docs are out
      });
      gulp.src(__dirname + '/index.tpl.html')
        .pipe(gulpTemplate(config))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(config.dist));
      gulp.src(__dirname + '/assets/**')
        .pipe(gulp.dest(config.dist + '/assets'))
        .on('end', callback);
    }));

}

function modulesToDocsObject(modules) {
  var docs = {};
  modules.forEach(function(m) {
    docs[m] = {
      name: m,
      displayName: ucwords(breakup(m, ' '))
    };
  });
  return docs;
}

function breakup(text, separator) {
  return text.replace(/[A-Z]/g, function (match) {
    return separator + match;
  });
}
function ucwords(text) {
  return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
    return $1.toUpperCase();
  });
}
