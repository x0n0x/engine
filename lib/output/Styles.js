var Styles;

Styles = (function() {
  Styles.Matrix = require('../../vendor/gl-matrix.js');

  function Styles(engine) {
    this.engine = engine;
  }

  Styles.prototype.pull = function(data) {
    var id, intrinsic, path, positioning, prop, property, styles, suggests, value, _ref;
    this.lastInput = JSON.parse(JSON.stringify(data));
    intrinsic = null;
    this.engine.start();
    for (path in data) {
      value = data[path];
      if (property = this.engine._getIntrinsicProperty(path)) {
        data[path] = void 0;
        if (property !== 'intrinsic-x' && property !== 'intrinsic-y') {
          (intrinsic || (intrinsic = {}))[path] = value;
        }
      }
    }
    positioning = {};
    for (path in data) {
      value = data[path];
      if (value !== void 0) {
        this.set(path, void 0, value, positioning);
      }
    }
    this.render(null, null, null, positioning);
    for (id in positioning) {
      styles = positioning[id];
      for (prop in styles) {
        value = styles[prop];
        this.set(id, prop, value);
      }
    }
    if (intrinsic) {
      for (path in intrinsic) {
        value = intrinsic[path];
        data[path] = this.set(path, void 0, value, positioning, true);
      }
    }
    if (this.data) {
      _ref = this.data;
      for (path in _ref) {
        value = _ref[path];
        if (data[path] === void 0 && value !== void 0) {
          data[path] = value;
        }
      }
      this.data = void 0;
    }
    this.data = data;
    if (suggests = this.engine._getComputedProperties()) {
      return this.engine.pull(suggests);
    } else {
      this.data = void 0;
      return this.push(data);
    }
  };

  Styles.prototype.push = function(data) {
    return this.engine.push(data);
  };

  Styles.prototype.remove = function(id) {
    return delete this[id];
  };

  Styles.prototype.get = function(path, property, value) {
    var camel, element, style, _base;
    element = this.engine.get(path);
    camel = (_base = (this.camelized || (this.camelized = {})))[property] || (_base[property] = this.engine._camelize(property));
    style = element.style;
    value = style[camel];
    if (value !== void 0) {
      return value;
    }
    return this;
  };

  Styles.prototype.set = function(id, property, value, positioning, intrinsic) {
    var camel, element, last, measured, path, pixels, positioned, positioner, style, _base;
    if (property === void 0) {
      path = id;
      last = id.lastIndexOf('[');
      property = path.substring(last + 1, id.length - 1);
      id = id.substring(0, last);
    }
    if (id.charAt(0) === ':') {
      return;
    }
    if (!(element = this.engine.elements[id])) {
      if (!(element = this.engine._getElementById(this.engine.scope, id.substring(1)))) {
        return;
      }
    }
    positioner = this.positioners[property];
    if (positioning && positioner) {
      (positioning[id] || (positioning[id] = {}))[property] = value;
    } else {
      if (intrinsic) {
        measured = this.engine._compute(element, property, void 0, value);
        if (measured != null) {
          value = measured;
        }
        return value;
      }
      if (positioner) {
        positioned = positioner(element);
        if (typeof positioned === 'string') {
          property = positioned;
        }
      }
      camel = (_base = (this.camelized || (this.camelized = {})))[property] || (_base[property] = this.engine._camelize(property));
      style = element.style;
      if (style[camel] !== void 0) {
        if (typeof value === 'number' && property !== 'zIndex') {
          pixels = value + 'px';
        }
        if (positioner) {
          if (!style[camel]) {
            if ((style.positioning = (style.positioning || 0) + 1) === 1) {
              style.position = 'absolute';
            }
          } else if (!value) {
            if (!--style.positioning) {
              style.position = '';
            }
          }
        }
        style[camel] = pixels || value;
      }
    }
    return this;
  };

  Styles.prototype.render = function(parent, x, y, positioning, offsetParent) {
    var child, children, offsets, _i, _len;
    if (parent == null) {
      parent = this.engine.scope;
    }
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (offsets = this.placehold(positioning, parent, x, y)) {
      x += offsets.left;
      y += offsets.top;
    }
    children = this.engine['_>'][1](parent);
    if (parent.offsetParent === this.engine.scope) {
      x -= this.engine.scope.offsetLeft;
      y -= this.engine.scope.offsetTop;
    } else if (parent !== this.engine.scope) {
      if (!offsets && children.length && children[0].offsetParent === parent) {
        x += parent.offsetLeft + parent.clientLeft;
        y += parent.offsetTop + parent.clientTop;
        offsetParent = parent;
      }
    }
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      this.render(child, x, y, positioning, offsetParent);
    }
    return this;
  };

  Styles.prototype.placehold = function(positioning, element, x, y) {
    var offsets, property, styles, uid, value;
    if (uid = element._gss_id) {
      if (styles = positioning != null ? positioning[uid] : void 0) {
        offsets = {
          left: 0,
          top: 0
        };
        for (property in styles) {
          value = styles[property];
          if (value !== null) {
            switch (property) {
              case "x":
                styles.x = value - x;
                offsets.left = value - x;
                break;
              case "y":
                styles.y = value - y;
                offsets.top = value - y;
            }
          }
        }
      }
      this.engine._onMeasure(element, x, y, styles);
    }
    return offsets;
  };

  Styles.prototype.positioners = {
    x: function() {
      return 'left';
    },
    y: function() {
      return 'top';
    }
  };

  return Styles;

})();

module.exports = Styles;