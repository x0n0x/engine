var Finite, Space, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Space = require('../concepts/Space');

Finite = (function(_super) {
  __extends(Finite, _super);

  function Finite() {
    _ref = Finite.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return Finite;

})(Space);
