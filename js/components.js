var Component = {};

// ========================================================
//                      BASE COMPONENT
// ========================================================

Component.Base = function () {
    Component.Base.superclass.constructor.call(this);
    this.archetype         = "component";
    this.isComponent       = true;
};

$$.extendClass(Component.Base, View.Base);


// ========================================================
//                     BASIC COMPONENT
// ========================================================

Component.Basic = function (dataObject) {
    var data        = $$.object(dataObject, {});
    this.subtype    = "basic";
    this.element    = $$.getElement(data.element || "<basic>");
    this.styleClass = $$.string(data.styleClass, "");

    Component.Basic.superclass.constructor.call(this);
};

$$.extendClass(Component.Basic, Component.Base);


// ========================================================
//                      LIST COMPONENT
// ========================================================

Component.List = function (dataObject) {
    var data        = $$.object(dataObject, {});
    var thisList    = this;
    this.subtype    = "list";

    this.element    = $$.getElement(data.element || "<list>");
    this.styleClass = $$.string(data.styleClass, "");

    Component.List.superclass.constructor.call(this);

    this.properties = {
        sortProperty  : $$.string(data.sortProperty, "firstName"),
        sortByStatus  : $$.boolean(data.sortByStatus, true),
        statusOrder   : $$.array(data.statusOrder, ["available", "busy", "offline", "unknown"])
    };

    this.attributes = {
        sortProperty : "string",
        sortByStatus : "boolean",
        statusOrder  : "array"
    };
};

$$.extendClass(Component.List, Component.Base);

Component.List.prototype.sort = function (sortProperty, sortByStatus, statusOrder) {
    var thisList = this;
    sortProperty = $$.string(sortProperty, this.properties.sortProperty);
    sortByStatus = $$.boolean(sortByStatus, this.properties.sortByStatus);
    statusOrder  = $$.array(statusOrder, this.properties.statusOrder);

    function propertySort() {
        thisList.addedObjects.sort(function (a, b) {
            if (a.properties[sortProperty] > b.properties[sortProperty]) {
                return -1;
            }
            if (a.properties[sortProperty] < b.properties[sortProperty]) {
                return 1;
            }
            return 0;
        });
    }

    function statusSort() {
        thisList.addedObjects.sort(function (a,b) {
            if (statusOrder.indexOf(a.properties.status) > statusOrder.indexOf(b.properties.status)) {
                return -1;
            }
            if (statusOrder.indexOf(a.properties.status) < statusOrder.indexOf(b.properties.status)) {
                return 1;
            }
            return 0;
        });
    }

    propertySort();

    if (sortByStatus) {
        statusSort();
    }

    this.eachAddedObject("add");
};

Component.List.prototype.updateProperty = function (propertyName, propertyValue) {
    if (this.properties.hasOwnProperty(propertyName)) {
        var type  = this.attributes[propertyName];
        var value = $$[type](propertyValue);
        if (value) {
            this.properties[propertyName] = value;
            this.sort();
        }
    }
    return this;
};


// ========================================================
//                     IMAGE COMPONENT
// ========================================================

Component.Image = function (dataObject) {
    var data        = $$.object(dataObject, {});
    var image       = $$.string(data.image, "");
    this.subtype    = "image";
    this.element    = $$.getElement(data.element || "<image>");
    this.styleClass = $$.string(data.styleClass, "");

    Component.Image.superclass.constructor.call(this);

    this.properties = {
        image : image
    };

    this.attributes = {
        image : "string"
    };

    this.image(image);
};

$$.extendClass(Component.Image, Component.Base);

Component.Image.prototype.updateProperty = function (propertyName, propertyValue) {
    if (propertyName === "image") {
        this.image(propertyValue);
    }
    return this;
};

Component.Image.prototype.image = function (imageSource) {
    if (imageSource != null) {
        imageSource = this.properties.image = $$.string(imageSource, "");
        if (this.element.tagName === "IMG") {
            this.element.src = imageSource;
        } else {
            if (imageSource) {
                this.element.style.backgroundImage = "url('" + imageSource + "')";
            } else {
                this.element.style.backgroundImage = "";
            }
        }
    }
    return this.properties.image;
};


// ========================================================
//                      TEXT COMPONENT
// ========================================================

Component.Text = function (dataObject) {
    var data        = $$.object(dataObject, {});
    var text        = $$.string(data.text, "");
    this.subtype    = "text";
    this.element    = $$.getElement(data.element || "<text>");
    this.styleClass = $$.string(data.styleClass, "");
    this.textNode   = document.createTextNode(text);

    Component.Text.superclass.constructor.call(this)

    this.properties = {
        text : text
    };

    this.attributes = {
        text : "string"
    };

    this.element.appendChild(this.textNode);
};

$$.extendClass(Component.Text, Component.Base);

Component.Text.prototype.updateProperty = function (propertyName, propertyValue) {
    if (propertyName === "text") {
        this.text(propertyValue);
    }
    return this;
};

Component.Text.prototype.text = function (text) {
    if (text != null) {
        text = this.properties.text = $$.string(text, "");
        this.textNode.nodeValue = text;
    }
    return this.properties.text;
};


// ========================================================
//                      ICON COMPONENT
// ========================================================

Component.Icon = function (dataObject) {
    var data        = $$.object(dataObject, {});
    var text        = $$.string(data.text, "");
    var image       = $$.string(data.image, "");
    this.subtype    = "icon";
    this.element    = $$.getElement(data.element || "<icon>");
    this.styleClass = $$.string(data.styleClass, "");

    Component.Icon.superclass.constructor.call(this);

    this.parts = {
        image : $$.Image({ image: data.image }),
        text  : $$.Text({ text: data.text })
    };

    this.add(this.parts.image)
        .add(this.parts.text);
};

$$.extendClass(Component.Icon, Component.Base);

Component.Icon.prototype.updateProperty = function (propertyName, propertyValue) {
    this.updateParts(propertyName, propertyValue);
    return this;
};


// ========================================================
//                     INPUT COMPONENT
// ========================================================

Component.Input = function (dataObject) {
    var data        = $$.object(dataObject, {});
    var inputType   = $$.string(data.type, "text");
    this.subtype    = "input"
    this.element    = $$.getElement(data.element || "<form-input>");
    this.styleClass = $$.string(data.styleClass, "");
    this.input      = document.createElement("input");
    this.label      = document.createElement("label");
    this.text       = document.createTextNode($$.string(data.label, ""));
    this.input.type = inputType;

    Component.Input.superclass.constructor.call(this);

    this.properties = {
        placeholder   : $$.string(data.placeholder, ""),
        value         : $$.string(data.value, ""),
        readonly      : $$.string(data.readonly, ""),
        maxlength     : $$.number(data.maxlength, 128),
        label         : $$.string(data.label, ""),
        labelPosition : data.labelPosition === "after" ? "after" : "before"
    };

    this.attributes = {
        placeholder   : "string",
        value         : "string",
        readonly      : "string",
        maxlength     : "number",
        label         : "string",
        labelPosition : "string"
    };

    this.updateProperties();
};

$$.extendClass(Component.Input, Component.Base);

Component.Input.prototype.updateProperty = function (propertyName, propertyValue) {
    if (this.properties.hasOwnProperty(propertyName)) {
        var type = this.attributes[propertyName];
        propertyValue = $$[type](propertyValue, this.properties[propertyName]);
        this.properties[propertyName] = propertyValue;

        if (propertyName === "value") {
            this.input.value = propertyValue;
        }
        else if (propertyName !== "label" && propertyName !== "labelPosition" && propertyName !== "value") {
            if (propertyValue === "") {
                this.input.removeAttribute(propertyName);
            } else {
                this.input.setAttribute(propertyName, propertyValue);
            }
        }
        else if (propertyName === "label") {
            if (propertyValue === "") {
                if (this.element.contains(this.label)) {
                    this.element.removeChild(this.label);
                    this.properties.label = this.text.nodeValue = "";
                }
                this.element.appendChild(this.input);
            } else {
                this.properties.label = this.text.nodeValue = propertyValue;
                this.element.appendChild(this.label);
                this.updateProperty("labelPosition", this.properties.labelPosition);
            }
        }
        else if (propertyName === "labelPosition") {
            if (this.properties.label !== "") {
                if (propertyValue === "after") {
                    this.label.appendChild(this.input);
                    this.label.appendChild(this.text);
                } else {
                    this.label.appendChild(this.text);
                    this.label.appendChild(this.input);
                }
            }
        }
    }
    return this;
};

Component.Input.prototype.value = function (value) {
    if (value != null) {
        this.updateProperty("value", value);
    }
    return this.input.value;
};


// ========================================================
//                   TIME COMPONENT
// ========================================================

Component.Time = function(dataObject) {
    var data        = $$.object(dataObject, {});
    this.subtype    = "time";
    this.element    = $$.getElement(data.element || "<time>");
    this.styleClass = $$.string(data.styleClass, "");
    this.textNode   = document.createTextNode("");

    Component.Time.superclass.constructor.call(this);

    this.properties = {
        timestamp   : $$.number(data.timestamp, Date.now()),
        format      : $$.string(data.format, "[full date and time]"),
        interval    : $$.number(data.interval, 0),
        setTimeout  : null,
        setInterval : null
    };

    this.element.appendChild(this.textNode);
    this.time(data.timestamp, data.format, data.interval);
};

$$.extendClass(Component.Time, Component.Base);

Component.Time.prototype.time = function (timestamp, format, interval) {
    this.properties.timestamp = $$.number(timestamp, Date.now());
    this.format(format);
    this.interval(interval);
    return this;
};

Component.Time.prototype.format = function (format) {
    this.properties.format = $$.string(format, this.properties.format);
    this.textNode.nodeValue = $$.formatTime(this.properties.format, this.properties.timestamp);
    return this;
};

Component.Time.prototype.interval = function (interval) {
    var thisTime = this;
    interval = $$.number(interval, $$.string(interval, this.properties.interval));
    clearTimeout(this.properties.setTimeout);
    clearInterval(this.properties.setInterval);
    if (typeof interval === "number" && interval > 0) {
        this.properties.interval = interval;
        this.properties.setInterval = setInterval(function () {
            thisTime.updateClock();
        }, interval * 1000);
    }
    else {
        var intervalObject = $$.getInterval(interval);
        if (intervalObject) {
            this.properties.interval = intervalObject.interval;
            this.properties.setTimeout = setTimeout(function () {
                thisTime.updateClock();
                thisTime.interval();
            }, intervalObject.timeout * 1000);
        } else {
            this.properties.interval = 0;
            this.setInterval = null;
        }
    }
    return this;
};

Component.Time.prototype.updateClock = function () {
    this.properties.timestamp = Date.now();
    this.format();
    return this;
};


// ========================================================
//                      NAME COMPONENT
// ========================================================

Component.Name = function (modelObject, dataObject) {
    var data        = $$.object(dataObject, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.properties : model;
    this.subtype    = "name";
    this.element    = $$.getElement(data.element || "<name>");
    this.styleClass = $$.string(data.styleClass, "");
    this.textNode   = document.createTextNode("");

    Component.Name.superclass.constructor.call(this);

    this.properties = {
        firstName : $$.string(info.firstName, $$.string(info.name,  "")),
        lastName  : $$.string(info.lastName, ""),
        format    : $$.string(info.format, "[firstName] [lastName]")
    };

    this.addModel(model);
    this.element.appendChild(this.textNode);
    this.formatName();
};

$$.extendClass(Component.Name, Component.Base);

Component.Name.prototype.updateProperty = function (propertyName, propertyValue) {
    if (propertyName === "name") { propertyName = "firstName"; }
    if (this.properties.hasOwnProperty(propertyName)) {
        this.properties[propertyName] = propertyValue;
        this.formatName();
    }
    return this;
};

Component.Name.prototype.formatName = function (formatString) {
    var nameString = this.properties.format
        .replace(/\[firstName\]/g, this.properties.firstName)
        .replace(/\[lastName\]/g, this.properties.lastName)
        .replace(/\[firstInitial\]/g, $$.getInitial(this.properties.firstName))
        .replace(/\[lastInitial\]/g, $$.getInitial(this.properties.lastName));

    this.textNode.nodeValue = nameString.trim();

    return this;
};

Component.Name.prototype.getInitials = function () {
    return this.formatName("[firstInitial] [lastInitial]");
};


// ========================================================
//                     AVATAR COMPONENT
// ========================================================

Component.Avatar = function (modelObject, dataObject) {
    var data        = $$.object(dataObject, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.properties : model;
    this.subtype    = "avatar";
    this.element    = $$.getElement(data.element || "<avatar>");
    this.styleClass = $$.string(data.styleClass, "");
    this.textNode   = document.createTextNode("");

    Component.Avatar.superclass.constructor.call(this);

    this.properties = {
        firstName    : $$.string(info.firstName, $$.string(info.name,  "")),
        lastName     : $$.string(info.lastName, ""),
        image        : $$.string(info.image, ""),
        defaultImage : $$.string(info.defaultImage, $$.images.defaultContact),
        showInitials : $$.boolean(info.showInitials, false)
    };

    this.addModel(model);
    this.add(this.textNode);
    this.formatAvatar();
};

$$.extendClass(Component.Avatar, Component.Base);

Component.Avatar.prototype.updateProperty = function (propertyName, propertyValue) {
    if (propertyName === "name") { propertyName = "firstName"; }
    if (this.properties.hasOwnProperty(propertyName)) {
        this.properties[propertyName] = propertyValue;
        this.formatAvatar();
    }
    return this;
};

Component.Avatar.prototype.formatAvatar = function () {
    if (this.properties.image) {
        this.element.style.backgroundImage = "url('" + this.properties.image + "')";
        this.textNode.nodeValue = "";
    }
    else if (this.properties.showInitials && (this.properties.firstName || this.properties.lastName)) {
        var initials = $$.getInitials([this.properties.firstName, this.properties.lastName]);
        this.textNode.nodeValue = initials;
        this.element.style.backgroundImage = "";
    }
    else {
        this.element.style.backgroundImage = "url('" + this.properties.defaultImage + "')";
        this.textNode.nodeValue = "";
    }
    return this;
};


// ========================================================
//                     STATUS COMPONENT
// ========================================================

Component.Status = function (modelObject, dataObject) {
    var data        = $$.object(dataObject, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.properties : model;
    this.subtype    = "status";
    this.element    = $$.getElement(data.element || "<status>");
    this.styleClass = $$.string(data.styleClass, "");
    this.textNode   = document.createTextNode("");

    Component.Status.superclass.constructor.call(this);

    this.properties = {
        showText : $$.boolean(data.showText) || false,
        status : ""
    };

    this.addModel(model);
    this.add(this.textNode);
    this.status(info.status);
};

$$.extendClass(Component.Status, Component.Base);

Component.Status.prototype.updateProperty = function (propertyName, propertyValue) {
    if (propertyName === "status") {
        this.status(propertyValue);
    } else if (propertyName === "showText") {
        this.showText(propertyValue);
    }
    return this;
};

Component.Status.prototype.status = function (status) {
    status = this.properties.status = $$.string(status, "unknown");
    this.altClass = "is-" + status;
    this.updateStyleClass();
    this.showText();

    return this.properties.status;
};

Component.Status.prototype.showText = function (boolean) {
    var showText = $$.boolean(boolean, this.properties.showText);
    this.properties.showText = showText;
    if (showText) {
        this.textNode.nodeValue = this.properties.status;
    } else {
        this.textNode.nodeValue = "";
    }
}


// ========================================================
//                      CARD COMPONENT
// ========================================================

Component.Card = function (modelObject, dataObject) {
    var data        = $$.object(dataObject, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.properties : model;
    var thisCard    = this;
    this.subtype    = "card";
    this.altClass   = model.subtype || "";
    this.element    = $$.getElement(data.element || "<card>");
    this.styleClass = $$.string(data.styleClass, "");

    Component.Card.superclass.constructor.call(this);

    this.properties = {
        size         : $$.string(data.size, "small"),
        name         : $$.string(info.name, ""),
        firstName    : $$.string(info.firstName, ""),
        lastName     : $$.string(info.lastName, ""),
        image        : $$.string(info.image, ""),
        status       : $$.string(info.status, "unknown"),
        defaultImage : $$.string(info.defaultImage, $$.images.defaultContact),
        isInRoster   : $$.boolean(info.isInRoster, false),
        showInitials : $$.boolean(info.showInitials, false)
    }

    this.attributes = {
        size         : "string",
        name         : "string",
        firstName    : "string",
        lastName     : "string",
        image        : "string",
        status       : "string",
        defaultImage : "string",
        isInRoster   : "boolean",
        showInitials : "boolean"
    }

    this.parts = {
        avatar          : $$.Avatar(info),
        name            : $$.Name(info),
        status          : $$.Image({ element: "<status>", styleClass: "is-" + this.properties.status }),
        statusText      : $$.Text({ element: "<status-text>", styleClass: "is-" + this.properties.status, text: this.properties.status }),
        content         : $$.Basic({ element: "<content>" }),
        call            : $$.Image({ element: "<call>", image: $$.images.callLight }),
        buttons         : $$.Basic({ element: "<buttons>" }),
        scheduleMeeting : $$.Icon({ styleClass: "schedule-a-meeting", image: $$.images.meetingsLight, text: "Schedule a Meeting" }),
        rosterToggle    : $$.Icon({ styleClass: "roster-toggle" })
    };

    if (model.subtype) {
        this[model.subtype + "Parts"](info, data);
    }

    this.addModel(model).updateNameAttribute().updateRosterState();
};

$$.extendClass(Component.Card, Component.Base);

Component.Card.prototype.updateProperty = function (propertyName, propertyValue) {
    if (this.properties.hasOwnProperty(propertyName)) {
        this.properties[propertyName] = $$[this.attributes[propertyName]](propertyValue, this.properties[propertyName]);
        this.updateParts(propertyName, propertyValue);

        if (propertyName === "name" || propertyName === "firstName" || propertyName == "lastName") {
            this.updateNameAttribute();
        } else if (propertyName === "status") {
            var status = $$.string(propertyValue, this.properties.status);

            this.parts.status.updateStyleClass("is-" + status);
            this.parts.statusText.updateStyleClass("is-" + status).updateProperty("text", status);

            if (this.parent && this.parent.isComponent && this.parent.subtype === "list") {
                this.parent.sort();
            }
        }
        else if (propertyName === "isInRoster") {
            this.updateRosterState(propertyValue);
        }
    }
    return this;
};

Component.Card.prototype.updateRosterState = function (isInRoster) {
    var inRoster = $$.boolean(isInRoster, this.properties.isInRoster);
    var image    = $$.images.contactAddLight;
    var text     = "Add to Contacts";
    if (inRoster === true) {
        image = $$.images.contactRemoveLight;
        text  = "Remove from Contacts";
    }
    this.properties.isInRoster = inRoster;
    this.parts.rosterToggle.updateProperties({ text : text, image: image });
    return this;
};

Component.Card.prototype.updateNameAttribute = function () {
    var name      = this.properties.name      || "";
    var firstName = this.properties.firstName || "";
    var lastName  = this.properties.lastName  || "";
    this.element.setAttribute("name", (name + " " + firstName + " " + lastName).trim());

    return this;
};

Component.Card.prototype.contactParts = function () {
    var parts = this.parts;
    if (this.properties.size === "small") {
        this.add(parts.avatar.add(parts.status))
            .add(parts.content.add(parts.name));
    } else {
        this.add(parts.avatar)
            .add(parts.content
                .add(parts.name)
                .add(parts.status)
                .add(parts.statusText))
            .add(parts.call)
            .add(parts.buttons
                 .add(parts.scheduleMeeting)
                 .add(parts.rosterToggle));
    }

    return this;
};

Component.Card.prototype.roomParts = function (info) {
    this.add(this.parts.avatar)
        .add(this.parts.content.add(this.parts.name));

    return this;
};

Component.Card.prototype.meetingParts = function (info) {
    this.parts = {
        content : $$.Basic("<content>"),
        name    : $$.Name(info)
    };

    this.properties = {
        name      : info.name      || "",
        organizer : info.organizer || {},
        startTime : info.startTime || 0,
        endTime   : info.endTime   || 0
    }

    this.updateNameAttribute();
    this.add(this.parts.avatar);
    this.parts.avatar.add(this.parts.status);
    this.add(this.parts.content);
    this.parts.content.add(this.parts.name);
};
