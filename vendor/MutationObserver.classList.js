
var attrModifiedWorks = false;
var listener = function(e){ 
  if (e[0].attributeName != 'class')
    return
  // unshim if browser supports classList + MutationObserver
  delete HTMLElement.prototype.ClassList
};
var observer = new MutationObserver(listener);
var dummy = document.createElement('div')
observer.observe(dummy, {
    attributes:    true
});
dummy.classList.add("___test___");
setTimeout(function() {
  observer.disconnect()
  dummy.classList.remove("___test___");
}, 10);

// shim classList

if ("document" in self) {

HTMLElement.prototype.ClassList = (function (view) {

if (!('Element' in view) ) return;

var
    classListProp = "classList"
  , protoProp = "prototype"
  , elemCtrProto = view.Element[protoProp]
  , objCtr = Object
  , strTrim = String[protoProp].trim || function () {
    return this.replace(/^\s+|\s+$/g, "");
  }
  , arrIndexOf = Array[protoProp].indexOf || function (item) {
    var
        i = 0
      , len = this.length
    ;
    for (; i < len; i++) {
      if (i in this && this[i] === item) {
        return i;
      }
    }
    return -1;
  }
  // Vendors: please allow content code to instantiate DOMExceptions
  , DOMEx = function (type, message) {
    this.name = type;
    this.code = DOMException[type];
    this.message = message;
  }
  , checkTokenAndGetIndex = function (classList, token) {
    if (token === "") {
      throw new DOMEx(
          "SYNTAX_ERR"
        , "An invalid or illegal string was specified"
      );
    }
    if (/\s/.test(token)) {
      throw new DOMEx(
          "INVALID_CHARACTER_ERR"
        , "String contains an invalid character"
      );
    }
    return arrIndexOf.call(classList, token);
  }
  , ClassList = function (elem) {

    var
        trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
      , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
      , i = 0
      , len = classes.length
    ;
    for (; i < len; i++) {
      this.push(classes[i]);
    }
    this._updateClassName = function (tokens) {
      elem.setAttribute("class", this.toString(tokens));
    };
  }
  , classListProto = ClassList[protoProp] = []
  , classListGetter = function () {
    return new ClassList(this);
  }
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
  return this[i] || null;
};
classListProto.contains = function (token) {
  token += "";
  return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {

  var
      tokens = arguments
    , i = 0
    , l = tokens.length
    , token
    , updated = false
  ;
  result = this.push ? this : Array.prototype.slice.call(this)
  do {
    token = tokens[i] + "";
    if (checkTokenAndGetIndex(this, token) === -1) {
      result.push(token);
      updated = true;
    }
  }
  while (++i < l);
  if (updated) {
    this._updateClassName(result);
  }
};
classListProto.remove = function () {
  var
      tokens = arguments
    , i = 0
    , l = tokens.length
    , token
    , updated = false
  ;

  do {
    token = tokens[i] + "";
    var index = checkTokenAndGetIndex(this, token);
    var tokens = this.splice ? this : Array.prototype.slice(this)
    if (index !== -1) {
      tokens.splice(index, 1);
      updated = true;
    }
  }

  while (++i < l);

  if (updated) {
    this._updateClassName(tokens);
  }
};
classListProto.toggle = function (token, force) {
  token += "";

  var
      result = this.contains(token)
    , method = result ?
      force !== true && "remove"
    :
      force !== false && "add"
  ;

  if (method) {
    this[method](token);
  }

  return !result;
};
classListProto.toString = function (tokens) {
  return (tokens || this).join(" ");
};

ClassList.define = function(element) {
  if (objCtr.defineProperty) {
    element._classList = element.classList
    var classListPropDesc = {
        get: classListGetter
      , enumerable: true
      , configurable: true
    };
    try {
      objCtr.defineProperty(element, classListProp, classListPropDesc);
    } catch (ex) { // IE 8 doesn't support enumerable:true
      if (ex.number === -0x7FF5EC54) {
        classListPropDesc.enumerable = false;
        objCtr.defineProperty(element, classListProp, classListPropDesc);
      }
    }
  } else if (objCtr[protoProp].__defineGetter__) {
    elemCtrProto.__defineGetter__(classListProp, classListGetter);
  }
}

ClassList.define(elemCtrProto)

ClassList.patch = function(element) {
  if (!element.classList) {
    element._classList = element.classList
    element.classList = new ClassList(element)
  } else {
    element.classList.remove = ClassList.prototype.remove
    element.classList.add = ClassList.prototype.add
    element.classList.toggle = ClassList.prototype.toggle
    element.classList._updateClassName = function(tokens) {
      var className = this.splice ? this : tokens.join(' ')
      element.setAttribute("class", className);
      element.className = className
    }
  }
} 
ClassList.unpatch = function(element) {
  if (element.classList instanceof ClassList) {
    element.classList = element._classList
    delete element._classList
  } else {
    delete element.classList.remove
    delete element.classList.add
    delete element.classList.toggle
    delete element.classList._updateClassName
  }
  element.classList = element._classList
  element._classList = null
}

return ClassList

}(self));


}
  