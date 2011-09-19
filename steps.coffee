
module.exports = (context, args...) ->
  new Steps context, args

stepper = (collection, fn, i, buildContext) ->
  if typeof fn is "function" then (args...) =>
    if not @fulfilled
      context = Object.create @context
      context.step = buildContext.call this, collection, i
      fn.apply context, args

class Steps
  constructor: (@context={}, @args=[]) ->
    @events =
      all: []
      success: []
      error: []
  
  
  
  sequence: do ->
    success = (args...) ->
      if not @fulfilled
        @fulfill null, args...
    error = (error) ->
      if not @fulfilled
        @fulfill arguments...

    buildContext = (fns, i) ->
      next_i = i+1
      next: stepper.call this, fns, fns[next_i], next_i, buildContext
      success: success.bind this
      error: error.bind this
    
    (fns...) ->
      i = 0
      stepper.call(this, fns, fns[i], i, buildContext) @args...
      this
    
    
    
  parallel: do ->
    done = (fns, index, value) ->
      if not @fulfilled
        @done[index] = value
        if ++@count is fns.length
          @fulfill null, @done...
        
    error = (fns, index, error) ->
      if not @fulfilled
        @done[index] = error
        @fulfill error, @done...
      
    buildContext = (fns, i) ->
      done: done.bind this, fns, i
      error: error.bind this, fns, i
    
    (fns...) ->
      @done = []
      @count = 0
      for fn, i in fns
        stepper.call(this, fns, fn, i, buildContext) @args...
      this
  
  
  
  each: do ->
    done = (collection, index, value) ->
      if not @fulfilled
        @done[index] = value
        if ++@count is @collectionLength
          @fulfill null, @done...
        
    error = (collection, index, error) ->
      if not @fulfilled
        @done[index] = error
        @fulfill error, @done...
    
    buildContext = (collection, i) ->
      index: i
      value: collection[i]
      collection: collection
      done: done.bind this, collection, i
      error: error.bind this, collection, i
      
    (collection, fn) ->
      @count = 0
      if collection instanceof Array
        @done = []
        @collectionLength = collection.length
        for item, i in collection
          stepper.call(this, collection, fn, i, buildContext) @args...
      else if collection instanceof Object
        @done = {}
        @collectionLength = Object.keys(collection).length
        for own i of collection
          stepper.call(this, collection, fn, i, buildContext) @args...
      this
  
  on: (event, fn) -> @events[event].push fn; this
  success: (fn) -> @on "success", fn; this
  error: (fn) -> @on "error", fn; this
  
  fulfilled: false
  fulfill: do ->
    calleach = (event, args) ->
      for fn in @events[event]
        if typeof fn is "function"
          fn args...
    
    (error, args...) ->
      if not @fulfilled
        @fulfilled = true
      
        if not error?
          calleach.call this, "success", args
          args.unshift error
        else
          error = new Error error if typeof error isnt "object"
          args.unshift error
          calleach.call this, "error", args
        calleach.call this, "all", args
    