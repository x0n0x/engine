class Solutions
  constructor: (@engine, @output) ->
    @solver = new c.SimplexSolver()
    @solver.autoSolve = false
    c.debug = true
    
  # Read commands
  pull: (commands)->
    debugger
    @response = response = {}
    @lastInput = commands
    for command in commands
      if command instanceof Array && typeof command[0] == 'object'
        @add(subcommand) for subcommand in command
      else 
        @add(command)
    if @constrained
      @constrained = undefined
      @solver.solve()
    else
      @solver.resolve()

    for property, value of @solver._changed
      response[property] = value
    @solver._changed = undefined
    if @nullified
      for property, value of @nullified
        response[property] = null
      delete @nullified
    @lastOutput = response
    @push(response)
    debugger
    return

  push: (results) ->
    if @output
      @output.pull(results)
    else
      @engine.merge(results)
      @engine.push(results)

  remove: (constrain, path) ->
    if constrain instanceof c.Constraint
      @solver.removeConstraint(constrain)
      for path in constrain.paths
        if typeof path == 'string'
          if group = @[path]
            if (index = group.indexOf(constrain)) > -1
              group.splice(index, 1)
            unless group.length
              delete @[path]
        else
          unless --path.counter
            variable = @[path.name]
            if variable.editing
              cei = @solver._editVarMap.get(variable);
              @solver.removeColumn(cei.editMinus);
              @solver._editVarMap.delete(variable);
            delete @[path.name]
            # Explicitly remove variable from cassowary
            @solver._externalParametricVars.delete(path)
            (@nullified ||= {})[path.name] = null


  add: (command) ->
    if command instanceof c.Constraint
      @constrained = true
      @solver.addConstraint(command)
      if command.paths
        for path in command.paths
          if typeof path == 'string'
            (@[path] ||= []).push(command)
          else
            path.counter = (path.counter || 0) + 1
          
    else if @[command[0]]
      @[command[0]].apply(@, Array.prototype.slice.call(command, 1))

  edit: (variable, strength, weight) ->
    strength = @engine._strength(strength)
    weight = @engine._weight(weight)
    c.trace && c.fnenterprint("addEditVar: " + constraint + " @ " + strength + " {" + weight + "}");
    constraint = new c.EditConstraint(variable, strength || c.Strength.strong, weight)
    @solver.addConstraint(constraint)
    variable.editing = constraint
    return constraint

  suggest: (variable, value, strength, weight) ->
    #@solver.solve()
    if typeof variable == 'string'
      return unless variable = @[variable]
    @edit(variable, strength, weight) unless variable.editing
    @solver.suggestValue(variable, value)
    #@solver.resolve()
    return variable

  stay: ->
    for arg in arguments
      @solver.addStay(arg)
    return

module.exports = Solutions