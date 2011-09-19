(function() {
  var log, sleep, steps;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  steps = require('../steps');
  sleep = function(ms, fn) {
    return setTimeout(fn, ms);
  };
  log = function() {
    return console.log.apply(console, arguments);
  };
  log("\n");
  steps().sequence(function() {
    return sleep(200, this.step.next.bind(this, 5));
  }, function(num) {
    return steps().parallel(function() {
      return sleep(1000, __bind(function() {
        return this.step.done(5);
      }, this));
    }, function() {
      return sleep(300, __bind(function() {
        return this.step.done(10);
      }, this));
    }, function() {
      return sleep(100, __bind(function() {
        return this.step.done(20);
      }, this));
    }).success(__bind(function() {
      var result;
      result = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.step.next(num + result.reduce(function(a, b) {
        return a + b;
      }));
    }, this)).error(this.step.error);
  }, function(num) {
    return sleep(500, this.step.success.bind(this, num + 100));
  }).success(function(num) {
    return log("sequential success. result: " + num);
  }).error(function(err) {
    return log("sequential error:", err);
  });
  steps().parallel(function() {
    return sleep(1000, __bind(function() {
      return this.step.done("asdf");
    }, this));
  }, function() {
    return sleep(300, __bind(function() {
      return steps().sequence(function() {
        return sleep(200, this.step.next.bind(this, 5));
      }, function(num) {
        return sleep(100, this.step.next.bind(this, num + 6));
      }, function(num) {
        return sleep(500, this.step.success.bind(this, num * 2));
      }).success(this.step.done);
    }, this));
  }, function() {
    return sleep(100, __bind(function() {
      return this.step.done("fdsa");
    }, this));
  }).success(function() {
    var result;
    result = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return log("parallel success. result:", result);
  });
  steps().each([1, 5, 2, 3, 4], function() {
    return sleep(this.step.value * 100, __bind(function() {
      return this.step.done(this.step.value * 2);
    }, this));
  }).success(function() {
    var results;
    results = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return log("each success. result:", results);
  }).error(function(err) {
    return log("each error:", err);
  });
}).call(this);
