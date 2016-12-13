var View = {};

View.Base = function (data) {
    this.isView         = true;
    this.styleClass     = $$.string(data.styleClass, "");
    this.parent         = null;
    this.model          = null;
    this.element.object = this;
    this.parts          = {};
    this.props     = {};
    this.addedObjects   = [];
    this.signals        = {};

    this.toggles = {
        active     : false,
        disabled   : false,
        hidden     : false,
        selected   : false,
        muted      : false,
        restricted : false
    };

    this.toggleClasses = {
        active     : "is-active",
        disabled   : "is-disabled",
        hidden     : "is-hidden",
        selected   : "is-selected",
        muted      : "is-muted",
        restricted : "is-restricted"
    }

    this.updateStyleClass();
};

View.Base.prototype.signal = function (signalObject) {
    var data    = $$.object(signalObject, {});
    var outcome = "This view does not have a signal by that name.";

    data.event      = $$.object(data.event, null);
    data.origin     = $$.object(data.origin);
    data.target     = $$.object(data.target, (data.stopBubble ? this : this.parent || this));
    data.name       = $$.string(data.name, "UNKNOWN_SIGNAL");
    data.stopBubble = $$.boolean(data.stopBubble, false);
    data.info       = data.info || null;

    if (this.signals.hasOwnProperty(data.name)) {
        outcome = "OK";
        this.signals[data.name](data);
    }

    if (data.target !== this) {
        data.target.signal(data);
    }

    Log.write("signal", this, outcome, data.name);
    return this;
};

View.Base.prototype.addSignal = function (signalName, callback) {
    var outcome = "This view already has a signal with that name.";
    if (!this.signals.hasOwnProperty(signalName)) {
        outcome = "OK";
        this.signals[signalName] = callback;
    }

    Log.write("addSignal", this, outcome, signalName);
    return this;
};

View.Base.prototype.addEvent = function (eventTypes, callback, useCapture, isSingleEvent) {
    var events = $$.string(eventTypes, "").split(" ");
    var finalCallback = callback;
    var i = 0, total = events.length;

    if (isSingleEvent) {
        finalCallback = function (e) { callback(e); e.target.removeEventListener(e.type, arguments.callee); };
    }
    for (i; i < total; i++) {
        if (events[i]) {
            this.element.addEventListener(events[i], finalCallback, useCapture);
        }
    }
    return this;
};

View.Base.prototype.singleEvent = function (eventTypes, callback, useCapture) {
    this.addEvent(eventTypes, callback, useCapture, true);
    return this;
};

View.Base.prototype.removeEvent = function (eventTypes, callback, useCapture) {
    var events = $$.string(eventTypes, "").split(" ");
    var i = 0, total = events.length;
    for (i; i < total; i++) {
        if (events[i]) {
            this.element.removeEventListener(events[i], callback, useCapture);
        }
    }
    return this;
};

View.Base.prototype.add = function (child, index) {
    index = $$.number(index, -1);
    if (child) {
        child.remove();
        if (child.isView) {
            child.parent = this;
            this.addedObjects.push(child);
            child = child.element;
        }
        this.element.insertBefore(child, this.element.children[index]);
    } else {
        if (this.parent && this.parent.isView) {
            this.parent.add(this, index);
        }
    }
    return this;
};

View.Base.prototype.addTo = function (parent, index) {
    if (parent.isView) {
        parent.add(this, index);
    } else {
        this.remove();
        this.parent = null;
        if (parent instanceof Element) {
            index = $$.number(index, -1);
            var siblings = parent.children;
            parent.insertBefore(this.element, siblings[index]);
        }
    }
    return this;
}

View.Base.prototype.remove = function (child, destroyChild) {
    if (child) {
        if (child.isView) {
            var index = this.addedObjects.indexOf(child);
            if (index > -1) {
                this.addedObjects.splice(index, 1);
            }
            if (destroyChild) {
                child.parent = null;
                if (child.freeze) { child.freeze(); }
                if (child.model)  { child.model.removeView(child); }
                if (child.parts)  { child.eachPart("removeModel"); }
            }
            child = child.element;
        }
        if (this.element.contains(child)) {
            this.element.removeChild(child);
        }
    } else {
        if (this.parent && this.parent.isView) {
            this.parent.remove(this, destroyChild);
        } else if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
    return this;
};

View.Base.prototype.addModel = function (modelObject) {
    var model = $$.object(modelObject, {});
    if (model.isModel) {
        model.addView(this);
    }
    return this;
};

View.Base.prototype.removeModel = function () {
    if (this.model) {
        this.model.removeView(this);
    }
    return this;
};

View.Base.prototype.eachPart = function (method, arg1, arg2, arg3, arg4, arg5) {
    var part;
    for (part in this.parts) {
        if (this.parts[part][method]) {
            this.parts[part][method](arg1, arg2, arg3, arg4, arg5);
        }
    }
    return this;
};

View.Base.prototype.eachAddedObject = function (method, arg1, arg2, arg3, arg4, arg5) {
    var index = this.addedObjects.length -1;
    for (index; index > -1; index --) {
        if (this.addedObjects[index][method]) {
            this.addedObjects[index][method](arg1, arg2, arg3, arg4, arg5);
        }
    }
    return this;
};

View.Base.prototype.updateParts = function (propName, propValue) {
    var component;
    for (var component in this.parts) {
        this.parts[component].updateProp(propName, propValue);
    }
    return this;
};

View.Base.prototype.updateStyleClass = function (styleClass, animatedProps) {
    this.styleClass = $$.string(styleClass, this.styleClass);
    var classArray = [];
    var toggleName;
    var animate = $$.string(animatedProps, "");

    if (this.altClass) { classArray.push(this.altClass); }
    if (this.styleClass) { classArray.push(this.styleClass); }
    for (toggleName in this.toggles) {
        if (this.toggles[toggleName]) { classArray.push(this.toggleClasses[toggleName]); }
    }

    if (animate) {
        var styleProps = animate.split(" ");
        for (var i = 0; i < styleProps.length; i++) {
            window.getComputedStyle(this.element)[styleProps[i]];
        }
    }

    if (classArray.length) { this.element.className = classArray.join(" "); }
    else { this.element.removeAttribute("class"); }

    return this;
};

View.Base.prototype.toggle = function (toggleName, toggleValue, animatedProps) {
    var thisView = this;

    if (this.toggles.hasOwnProperty(toggleName) && this.toggles[toggleName] !== toggleValue) {
        var newValue = (toggleValue != null) ? toggleValue : !this.toggles[toggleName];
        this.toggles[toggleName] = newValue;

        this.updateStyleClass(null, animatedProps);
    }
    return this;
};

View.Base.prototype.indexIn = function (container) {
    if (container) {
        container = container.isView ? container.element : container;

        var children = container.children;
        var siblings = children.length;
        var index    = -1;

        for (var i = 0; i < siblings; i++) {
            if (children[i] === this.element) {
                index = i;
                break;
            }
        }
        return index;
    }
};

View.Base.prototype.getChildIndex = function (child) {
    if (child) {
        child = child.isView ? child.element : child;

        var children = this.element.children;
        var siblings = children.length;
        var index    = -1;

        for (var i = 0; i < siblings; i++) {
            if (children[i] === child) {
                index = i;
                break;
            }
        }
        return index;
    }
};

View.Base.prototype.updateProp = function (propName, propValue) {
    var outcome = $$.capitalize(this.subtype) + " " + this.archetype + "s do not allow prop updates via this method."
    Log.write("updateProp", this, outcome);
    return this;
};

View.Base.prototype.updateProps = function (propsObject) {
    var props = $$.object(propsObject, this.props);
    for (var prop in props) {
        this.updateProp(prop, props[prop]);
    }
    return this;
};
