var Command, Constraint, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Command = require('../concepts/Command');

Constraint = (function(_super) {
  __extends(Constraint, _super);

  function Constraint() {
    _ref = Constraint.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Constraint.prototype.type = 'Constraint';

  Constraint.prototype.signature = [
    {
      left: ['Value', 'Number'],
      right: ['Value', 'Number']
    }, [
      {
        strength: ['String'],
        weight: ['Number']
      }
    ]
  ];

  Constraint.prototype.descend = function(engine, operation, continuation, scope) {
    var name, result, _ref1, _ref2;
    if (!(((_ref1 = operation.parent.parent) != null ? _ref1.length : void 0) > 1)) {
      if (!(((_ref2 = engine.constraints) != null ? _ref2.length : void 0) > 0)) {
        if (name = this.getConstantName(engine, operation, continuation, scope)) {
          if (result = engine.bypass(name, operation, continuation, scope)) {
            return result;
          }
        }
      }
    }
    return Constraint.__super__.descend.apply(this, arguments);
  };

  Constraint.prototype.toHash = function(meta) {
    var hash, property;
    hash = '';
    if (meta.values) {
      for (property in meta.values) {
        hash += property;
      }
    }
    return hash;
  };

  Constraint.prototype.get = function(engine, operation, scope) {
    var _ref1, _ref2;
    return (_ref1 = engine.operations) != null ? (_ref2 = _ref1[operation.hash || (operation.hash = operation.toString())]) != null ? _ref2[this.toHash(scope)] : void 0 : void 0;
  };

  Constraint.prototype.fetch = function(engine, operation) {
    var constraint, operations, signature, _ref1, _ref2;
    if (operations = (_ref1 = engine.operations) != null ? _ref1[operation.hash || (operation.hash = operation.toString())] : void 0) {
      for (signature in operations) {
        constraint = operations[signature];
        if (((_ref2 = engine.constraints) != null ? _ref2.indexOf(constraint) : void 0) > -1) {
          return constraint;
        }
      }
    }
  };

  Constraint.prototype.before = function(args, engine, operation, continuation, scope) {
    if (!args.push) {
      return args;
    }
    return this.get(engine, operation, scope);
  };

  Constraint.prototype.after = function(args, result, engine, operation, continuation, scope) {
    var _base, _base1, _name, _name1;
    return (_base = ((_base1 = (engine.operations || (engine.operations = {})))[_name1 = operation.hash || (operation.hash = operation.toString())] || (_base1[_name1] = {})))[_name = this.toHash(scope)] || (_base[_name] = result);
  };

  Constraint.prototype.getConstantName = function(engine, operation) {
    var name, prop, variable, _ref1;
    _ref1 = operation.variables;
    for (prop in _ref1) {
      variable = _ref1[prop];
      if (variable.domain.displayName === engine.displayName) {
        if (name) {
          return;
        }
        name = prop;
      }
    }
    return name;
  };

  return Constraint;

})(Command);

module.exports = Constraint;