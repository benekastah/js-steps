(function() {
  var Steps, stepper;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty;
  module.exports = function() {
    var args, context;
    context = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return new Steps(context, args);
  };
  stepper = function(collection, fn, i, buildContext) {
    if (typeof fn === "function") {
      return __bind(function() {
        var args, context;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!this.fulfilled) {
          context = Object.create(this.context);
          context.step = buildContext.call(this, collection, i);
          return fn.apply(context, args);
        }
      }, this);
    }
  };
  Steps = (function() {
    function Steps(context, args) {
      this.context = context != null ? context : {};
      this.args = args != null ? args : [];
      this.events = {
        all: [],
        success: [],
        error: []
      };
    }
    Steps.prototype.sequence = (function() {
      var buildContext, error, success;
      success = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!this.fulfilled) {
          return this.fulfill.apply(this, [null].concat(__slice.call(args)));
        }
      };
      error = function(error) {
        if (!this.fulfilled) {
          return this.fulfill.apply(this, arguments);
        }
      };
      buildContext = function(fns, i) {
        var next_i;
        next_i = i + 1;
        return {
          next: stepper.call(this, fns, fns[next_i], next_i, buildContext),
          success: success.bind(this),
          error: error.bind(this)
        };
      };
      return function() {
        var fns, i;
        fns = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        i = 0;
        stepper.call(this, fns, fns[i], i, buildContext).apply(null, this.args);
        return this;
      };
    })();
    Steps.prototype.parallel = (function() {
      var buildContext, done, error;
      done = function(fns, index, value) {
        if (!this.fulfilled) {
          this.done[index] = value;
          if (++this.count === fns.length) {
            return this.fulfill.apply(this, [null].concat(__slice.call(this.done)));
          }
        }
      };
      error = function(fns, index, error) {
        if (!this.fulfilled) {
          this.done[index] = error;
          return this.fulfill.apply(this, [error].concat(__slice.call(this.done)));
        }
      };
      buildContext = function(fns, i) {
        return {
          done: done.bind(this, fns, i),
          error: error.bind(this, fns, i)
        };
      };
      return function() {
        var fn, fns, i, _len;
        fns = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this.done = [];
        this.count = 0;
        for (i = 0, _len = fns.length; i < _len; i++) {
          fn = fns[i];
          stepper.call(this, fns, fn, i, buildContext).apply(null, this.args);
        }
        return this;
      };
    })();
    Steps.prototype.each = (function() {
      var buildContext, done, error;
      done = function(collection, index, value) {
        if (!this.fulfilled) {
          this.done[index] = value;
          if (++this.count === this.collectionLength) {
            return this.fulfill.apply(this, [null].concat(__slice.call(this.done)));
          }
        }
      };
      error = function(collection, index, error) {
        if (!this.fulfilled) {
          this.done[index] = error;
          return this.fulfill.apply(this, [error].concat(__slice.call(this.done)));
        }
      };
      buildContext = function(collection, i) {
        return {
          index: i,
          value: collection[i],
          collection: collection,
          done: done.bind(this, collection, i),
          error: error.bind(this, collection, i)
        };
      };
      return function(collection, fn) {
        var i, item, _len;
        this.count = 0;
        if (collection instanceof Array) {
          this.done = [];
          this.collectionLength = collection.length;
          for (i = 0, _len = collection.length; i < _len; i++) {
            item = collection[i];
            stepper.call(this, collection, fn, i, buildContext).apply(null, this.args);
          }
        } else if (collection instanceof Object) {
          this.done = {};
          this.collectionLength = Object.keys(collection).length;
          for (i in collection) {
            if (!__hasProp.call(collection, i)) continue;
            stepper.call(this, collection, fn, i, buildContext).apply(null, this.args);
          }
        }
        return this;
      };
    })();
    Steps.prototype.on = function(event, fn) {
      this.events[event].push(fn);
      return this;
    };
    Steps.prototype.success = function(fn) {
      this.on("success", fn);
      return this;
    };
    Steps.prototype.error = function(fn) {
      this.on("error", fn);
      return this;
    };
    Steps.prototype.fulfilled = false;
    Steps.prototype.fulfill = (function() {
      var calleach;
      calleach = function(event, args) {
        var fn, _i, _len, _ref, _results;
        _ref = this.events[event];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          fn = _ref[_i];
          _results.push(typeof fn === "function" ? fn.apply(null, args) : void 0);
        }
        return _results;
      };
      return function() {
        var args, error;
        error = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (!this.fulfilled) {
          this.fulfilled = true;
          if (!(error != null)) {
            calleach.call(this, "success", args);
            args.unshift(error);
          } else {
            if (typeof error !== "object") {
              error = new Error(error);
            }
            args.unshift(error);
            calleach.call(this, "error", args);
          }
          return calleach.call(this, "all", args);
        }
      };
    })();
    return Steps;
  })();
}).call(this);
