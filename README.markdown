# Steps

Steps is a simple way to manage a few of the most common async programming problems in a more readable way.
Basic ideas:

  * Using vertical space is preferable to using horizontal space
  * The endpoint of a process should be easy to identify
  * The asynchronous code path should be easy to identify
  * Parallel processes culminating in a single callback should be trivial

Behold: this mess

```javascript
var filesModified = [];

fs.readdir("./", function (err, files) {
  files.forEach(function (file) {
    (function () {
      file = "./" + file;
      fs.stat(file, function (err, stats) {
        if (stats.isFile()) {
          fs.readFile(file, 'utf8', function (err, data) {
            var newData = data.replace(/gnome/g, "penguin");
            if (newData !== data) {
              fs.writeFile(file, newData, function (err) {
                filesModified.push(file);
                // Continue on your way now that the task is done
              });
            }
          });
        }
      });
    })(file)
  });
});
```

becomes this:

```javascript
steps = require('steps');

var filesModified = [];

steps().sequence(function () {
  fs.readdir("./", this.step.next);
}, function (err, files) {
  steps().each(files, function () {
    var file = "./" + this.step.value;
    steps().sequence(function () {
      fs.stat(file, this.step.next);
    }, function (err, stats) {
      if (stats.isFile()) {
        fs.readFile(file, 'utf8', this.step.next);
      } else { this.step.success(); }
    }, function () {
      var newData = data.replace(/gnome/g, "penguin");
      if (newData !== data) {
        fs.writeFile(file, newData, this.step.next);
      }
    }, function (err) {
      filesModified.push(file);
      this.step.success();
    });
  })
  .success(this.step.success);
})
.success(function () {
  // Continue on your way now that the task is done
});
```

If you are a coffeescripter, the code looks even nicer.

## Basic API

There are only a few functions to remember:

  1. `steps([context, [args]])`
     This function simply returns an object with our other API calls attached. Behind the scenes,
     it instantiates a new object for us to use throughout an async session.
    
  2. `steps().sequence(fn1, [fn2, [fn3, ... [fnN]]])`
     This function executes a series of functions in sequence. In each case the next function is
     fired when the current function calls `this.step.next`. Any information passed to `this.step.next`
     will be forwarded to the next function's arguments.
    
     Step object:
       * next: Call the next function
       * success: Finish the process and call the callback
       * error: Finish the process and call the errback
  
  3. `steps().parallel(fn2, [fn2, [fn3, ... [fnN]]])`
     This function executes all the listed functions immediately. Once each function calls `this.step.done`
     the process will end and the callback will be fired. Data passed to `this.step.done` will be collected
     into an array in the order the functions were listed (not in the order of execution).
    
     Step object:
       * done: declares current path as finished
       * error: Finish the process and call the errback
    
  4. `steps().each(collection, fn)`
     In this function, `fn` will execute for each item in the collection (be it an object or array).
     When `this.step.done` is called for each item, the process completes and the callback is fired.
  
     Step object:
       * value: current collection item's value
       * index: current index in collection
       * collection: the collection
       * done: declares current path as finished
       * error: Finish the process and call the errback
      
  5. `steps().sequence|parallel|each().success(fn)`
     This function will be called on success of the entire process.
    
  6. `steps().(sequence|parallel|each).error(fn)`
     This function will be called on error.
