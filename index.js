/*
  Author:Wilson
  E-mail:mdianer@qq.com
  Description:compile template of underscore file in to javascript
*/

'use strict';

var PLUGIN_NAME, _, path, rootDir, templateStore, through, util;

through = require('through2');

util = require('gulp-util');

path = require('path');

_ = require('lodash');

PLUGIN_NAME = 'gulp-template-store';

rootDir = process.cwd();

templateStore = function(opt) {
  var self;
  var _opt, base, end, fileName, fileVar, files, gather, getTemplateFn, processFile, processInput, tmpl;
  opt = opt || {};
  opt.unix = opt.unix === false ? false : true;
  _opt = opt.options || {};
  files = [];
  fileName = opt.name && typeof opt.name === 'string' ? opt.name : 'templates.js';
  fileVar = opt.variable && typeof opt.variable === 'string' ? opt.variable : 'this.tmpl';
  base = opt.base && typeof opt.base === 'string' ? opt.base : rootDir + '/';
  base = base.replace(/\\|\//g, path.sep);
  tmpl = 'define(function(){return { <%= contents %> }})';
  getTemplateFn = function(file) {
    if (_opt.interpolate) {
      _.templateSettings.interpolate = _opt.interpolate;
    }
    var result;
    try {
      result = _.template(file.contents.toString(), _opt)
    } catch (e) {
      self.emit('error', new util.PluginError(PLUGIN_NAME, e.message + 'in' + file.path.replace(/.+\//, '')));
      return null;
    }
    return result.source;
  };
  processFile = function(file) {
    var key, str,
      base,
      r;

    path = file.path;
    str = path;
    str = str.replace(/.+\//, '').replace(/\.html/, '');
    key = str;

    base = path.replace('/' + str + '.html', ''),
      r = new RegExp(opt.base + '$', 'gmi');

    if (opt.unix) {
      key = key.replace(/\\|\//g, '/');
    }

    if (!r.test(base)) {
      var folder = '';
      r = new RegExp('.+' + opt.base + '\/', 'gmi');
      folder = base.replace(r, '');
      key = folder + '.' + key
    }

    return _.template('"<%= name %>": <%= contents %>')({
      name: key,
      contents: opt.bare ? file.contents.toString() : getTemplateFn(file)
    });
  };
  processInput = function() {
    return _.template(tmpl)({
      contents: _.map(files, processFile).join(',')
    });
  };
  gather = function(file, enc, cb) {
    self = this;
    if (file.isNull()) {
      cb();
      return;
    }
    if (file.isStream()) {
      this.emit('error', new util.PluginError(PLUGIN_NAME, 'Streaming is not supported'));
      cb();
      return;
    }
    files.push(file);
    return cb();
  };
  end = function(cb) {
    if (files.length > 0) {
      this.push(new util.File({
        path: fileName,
        contents: new Buffer(processInput())
      }));
    }
    return cb();
  };
  return through.obj(gather, end);
};

module.exports = templateStore;