var fs = require('fs');
var path = require('path');
var MODULE_REGEX = /angular\.module.*?\[(.*?)\]/;

//fn('angular.module('ui.bootstrap.accordion', ['ui.bootstra.collapse']))
//==> ['collapse']
module.exports = function getDependencies(moduleName, contents) {
  var file = path.resolve(__dirname, '../../src', moduleName, moduleName+'.js');
  var src = fs.readFileSync(file);
  var match = String(src).match(MODULE_REGEX);

  return (match && match[1] || '')
    .replace(/'|"|\s*/g,'')
    .replace(/ui\.bootstrap\./g, '')
    .split(',');
};
