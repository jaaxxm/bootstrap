
var fs = require('fs');
var path = require('path');
var template = require('lodash.template');
var gutil = require('gulp-util');
var cp = require('child_process');
var async = require('async');

var scripts = require('../scripts');
var makeConfig = require('../../build.config.js');
var getDeps = require('./dependencies');

module.exports = runBower;

var ghOwner = 'ui-bootstrap-bower-test';
function bowerName(module) {
  return 'bower-bootstrap-'+module;
}

function runBower(gulp, config, callback) {
  gutil.log('Checking whether module remote repositories exist...');

  async.filterSeries(config.modules, checkModuleRemote, function(missingRepos) {
    if (missingRepos.length) {
      tellUserReposMissing(missingRepos);
      callback();
      return;
    }

    async.each(config.modules, function(module, done) {
      buildBowerModule(gulp, module, done);
    }, callback);
  });
}

function buildBowerModule(gulp, module, callback) {
  var moduleConfig = makeConfig({
    modules: [module],
    dist: path.resolve(__dirname, '../..', 'dist/bower-'+module),
    jsFile: 'ui-'+module+'.js',
    bundleFile: 'ui-'+module+'-tpls.js',
    jsModule: '\n', //extra modules are empty, src modules only
    bundleModule: '\n',
    htmlModule: '\n'
  });
  var ghOwner = 'ui-bootstrap-bower-test';
  var repo = bowerName(module);
  var github = 'git@github.com:'+ghOwner+'/'+repo;

  gutil.log('Pushing', repo, 'to', 'v'+moduleConfig.pkg.version,'...');

  var bowerJson = makeBowerJson(module, moduleConfig);
  var readme = template(fs.readFileSync(__dirname + '/bower-readme.tpl.md'), {
    module: module,
    config: moduleConfig
  });

  bowerJson = JSON.stringify(bowerJson, null, 2);

  return scripts(gulp, moduleConfig, function() {
    fs.writeFileSync(moduleConfig.dist + '/bower.json', bowerJson);
    fs.writeFileSync(moduleConfig.dist + '/README.md', readme);
    async.eachSeries([
      'rm -rf ' + moduleConfig.dist + '/.git',
      'git init .',
      'git remote add origin ' + github,
      'git add -A',
      'git commit -am "chore(release): ' + moduleConfig.pkg.version + '"',
      'git tag ' + moduleConfig.pkg.version,
      'git push -f --tags origin master'
    ], doExec, execDone);

    function doExec(cmd, done) {
      //Make git commands run in the bower dist folder
      if (cmd.substring(0,3) === 'git') {
        cmd = 'GIT_DIR=' + moduleConfig.dist + '/.git ' +
         'GIT_WORK_TREE='+ moduleConfig.dist + ' ' + cmd;
      }
      cp.exec(cmd, done);
    }

    function execDone(err, result) {
      if (err) {
        gutil.log(gutil.colors.red('[error]'), 'Failed to push', repo, 'to github.\n' + err);
      }
      callback();
    }

  });
}

function checkModuleRemote(module, done) {
  cp.exec('git ls-remote git://github.com/'+ghOwner+'/'+bowerName(module), done);
}
function tellUserReposMissing(repos) {
  var missingStr = repos.map(function(module) {
    return '  * ' + gutil.colors.red(module) + ': ' +
      gutil.colors.cyan('github.com/'+ghOwner+'/'+bowerName(module));
  }).join('\n');

  gutil.log(
    gutil.colors.red('[error]'),
    'The following modules do not have a repository created yet:\n' + missingStr
  );
  gutil.log(
    'Please create a new empty repository for all of the above and try again.'
  );
}

function makeBowerJson(module, config) {
  var dependencies = {};
  getDeps(module).forEach(function(dep) {
    dependencies[bowerName(dep)] = '*';
  });
  return {
    name: bowerName(module),
    license: 'MIT',
    version: config.pkg.version,
    author: {
      name: 'https://github.com/angular-ui/bootstrap/graphs/contributors'
    },
    dependencies: dependencies,
    main: config.bundleFile
  };
}

