
steps = require '../steps'

sleep = (ms, fn) ->
  setTimeout fn, ms
  
log = -> console.log.apply console, arguments

log "\n"

steps().sequence ->
  sleep 200, @step.next.bind @, 5
, (num) ->
  steps().parallel ->
    sleep 1000, =>
      @step.done 5
  , ->
    sleep 300, =>
      # @step.error 10
      @step.done 10
  , ->
    sleep 100, =>
      @step.done 20
  .success (result...) =>
    @step.next num + result.reduce (a, b) -> a+b
  .error @step.error
, (num) ->
  sleep 500, @step.success.bind @, num + 100
.success (num) ->
  log "sequential success. result: #{num}"
.error (err) ->
  log "sequential error:", err


steps().parallel ->
  sleep 1000, =>
    @step.done "asdf"
, ->
  sleep 300, =>
    steps().sequence ->
      sleep 200, @step.next.bind @, 5
    , (num) ->
      sleep 100, @step.next.bind @, num + 6
    , (num) ->
      sleep 500, @step.success.bind @, num * 2
    .success @step.done
, ->
  sleep 100, =>
    @step.done "fdsa"
.success (result...) -> log "parallel success. result:", result


steps().each [1, 5, 2, 3, 4], ->
  sleep @step.value * 100, =>
    # @step.error @step.value if @step.value is 5
    @step.done @step.value * 2
.success (results...) ->
  log "each success. result:", results
.error (err) ->
  log "each error:", err