'use strict';

const CleanCSS = require('clean-css');

class CleanCSSMinifier {
  constructor(config) {
    if (config == null) config = {};
    this.config = config;
    this.options = Object.assign({}, config.plugins && config.plugins.cleancss || {});
  }

  optimize(file) {
    const data = file.data;
    const path = file.path;

    try {
      if (this.options.ignored && this.options.ignored.test(path)) {
        // ignored file path: return non minified
        const result = {
          data,
          // brunch passes in a SourceMapGenerator object, but wants a string back.
          map: file.map ? file.map.toString() : null,
        };
        return Promise.resolve(result);
      }
    } catch (e) {
      return Promise.reject(`error checking ignored files to minify ${e}`);
    }

    if (file.map && this.config.sourceMaps) {
      this.options.sourceMap = file.map.toString();
    }

    try {
      const optimized = new CleanCSS(this.options).minify(data);

      const result = optimized && this.config.sourceMaps ? {
        data: optimized.styles,
        map: optimized.sourceMap.toString(),
      } : {
        data: optimized.styles,
      };

      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`CSS minification failed on ${path}: ${err}`);
    }
  }
}

CleanCSSMinifier.prototype.brunchPlugin = true;
CleanCSSMinifier.prototype.type = 'stylesheet';

module.exports = CleanCSSMinifier;
