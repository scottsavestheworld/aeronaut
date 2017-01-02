var Component = {};

// ========================================================
//                      BASE COMPONENT
// ========================================================

Component.Base = function (data) {
    Component.Base.superclass.constructor.call(this, data);
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

    Component.Basic.superclass.constructor.call(this, data);
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

    Component.List.superclass.constructor.call(this, data);

    this.props = {
        sortProp     : $$.string(data.sortProp, "firstName"),
        sortByStatus : $$.boolean(data.sortByStatus, true),
        statusOrder  : $$.array(data.statusOrder, ["available", "busy", "offline", "unknown"])
    };

    this.propType = {
        sortProp     : "string",
        sortByStatus : "boolean",
        statusOrder  : "array"
    };
};

$$.extendClass(Component.List, Component.Base);

Component.List.prototype.sort = function (sortProp, sortByStatus, statusOrder) {
    var thisList = this;
    sortProp = $$.string(sortProp, this.props.sortProp);
    sortByStatus = $$.boolean(sortByStatus, this.props.sortByStatus);
    statusOrder  = $$.array(statusOrder, this.props.statusOrder);

    function propSort() {
        thisList.addedObjects.sort(function (a, b) {
            if (a.props[sortProp] > b.props[sortProp]) {
                return -1;
            }
            if (a.props[sortProp] < b.props[sortProp]) {
                return 1;
            }
            return 0;
        });
    }

    function statusSort() {
        thisList.addedObjects.sort(function (a,b) {
            if (statusOrder.indexOf(a.props.status) > statusOrder.indexOf(b.props.status)) {
                return -1;
            }
            if (statusOrder.indexOf(a.props.status) < statusOrder.indexOf(b.props.status)) {
                return 1;
            }
            return 0;
        });
    }

    propSort();

    if (sortByStatus) {
        statusSort();
    }

    this.eachAddedObject("add");
};

Component.List.prototype.updateProp = function (propName, propValue) {
    if (this.props.hasOwnProperty(propName)) {
        var type  = this.propType[propName];
        var value = $$[type](propValue);
        if (value) {
            this.props[propName] = value;
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

    Component.Image.superclass.constructor.call(this, data);

    this.props = {
        image : image
    };

    this.propType = {
        image : "string"
    };

    this.image(image);
};

$$.extendClass(Component.Image, Component.Base);

Component.Image.prototype.updateProp = function (propName, propValue) {
    if (propName === "image") {
        this.image(propValue);
    }
    return this;
};

Component.Image.prototype.image = function (imageSource) {
    if (imageSource != null) {
        imageSource = this.props.image = $$.string(imageSource, "");
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
    return this.props.image;
};


// ========================================================
//                      TEXT COMPONENT
// ========================================================

Component.Text = function (dataObject) {
    var data        = $$.object(dataObject, {});
    var text        = $$.string(data.text, "");
    this.subtype    = "text";
    this.element    = $$.getElement(data.element || "<text>");
    this.textNode   = document.createTextNode(text);

    Component.Text.superclass.constructor.call(this, data)

    this.props = {
        text : text
    };

    this.propType = {
        text : "string"
    };

    this.element.appendChild(this.textNode);
};

$$.extendClass(Component.Text, Component.Base);

Component.Text.prototype.updateProp = function (propName, propValue) {
    if (propName === "text") {
        this.text(propValue);
    }
    return this;
};

Component.Text.prototype.text = function (text) {
    if (text != null) {
        text = this.props.text = $$.string(text, "");
        this.textNode.nodeValue = text;
    }
    return this.props.text;
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

    Component.Icon.superclass.constructor.call(this, data);

    this.parts = {
        image : $$.Image({ image: data.image }),
        text  : $$.Text({ text: data.text })
    };

    this.add(this.parts.image)
        .add(this.parts.text);
};

$$.extendClass(Component.Icon, Component.Base);

Component.Icon.prototype.updateProp = function (propName, propValue) {
    this.updateParts(propName, propValue);
    return this;
};


// ========================================================
//                     ENTRY COMPONENT
// ========================================================

Component.Entry = function (dataObject) {
    var data        = $$.object(dataObject, {});
    var inputType   = $$.string(data.type, "text");
    this.subtype    = "entry"
    this.element    = $$.getElement(data.element || "<entry>");
    this.input      = document.createElement("input");
    this.label      = document.createElement("label");
    this.text       = document.createTextNode($$.string(data.label, ""));
    this.input.type = inputType;

    Component.Entry.superclass.constructor.call(this, data);

    this.props = {
        placeholder   : $$.string(data.placeholder, ""),
        value         : $$.string(data.value, ""),
        readonly      : $$.string(data.readonly, ""),
        maxlength     : $$.number(data.maxlength, 128),
        label         : $$.string(data.label, ""),
        labelPosition : data.labelPosition === "after" ? "after" : "before"
    };

    this.propType = {
        placeholder   : "string",
        value         : "string",
        readonly      : "string",
        maxlength     : "number",
        label         : "string",
        labelPosition : "string"
    };

    this.updateProps();
};

$$.extendClass(Component.Entry, Component.Base);

Component.Entry.prototype.updateProp = function (propName, propValue) {
    if (this.props.hasOwnProperty(propName)) {
        var type = this.propType[propName];
        propValue = $$[type](propValue, this.props[propName]);
        this.props[propName] = propValue;

        if (propName === "value") {
            this.input.value = propValue;
        }
        else if (propName !== "label" && propName !== "labelPosition" && propName !== "value") {
            if (propValue === "") {
                this.input.removeAttribute(propName);
            } else {
                this.input.setAttribute(propName, propValue);
            }
        }
        else if (propName === "label") {
            if (propValue === "") {
                if (this.element.contains(this.label)) {
                    this.element.removeChild(this.label);
                    this.props.label = this.text.nodeValue = "";
                }
                this.element.appendChild(this.input);
            } else {
                this.props.label = this.text.nodeValue = propValue;
                this.element.appendChild(this.label);
                this.updateProp("labelPosition", this.props.labelPosition);
            }
        }
        else if (propName === "labelPosition") {
            if (this.props.label !== "") {
                if (propValue === "after") {
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

Component.Entry.prototype.value = function (value) {
    if (value != null) {
        this.updateProp("value", value);
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
    this.textNode   = document.createTextNode("");

    Component.Time.superclass.constructor.call(this, data);

    this.props = {
        type      : $$.time(data.type, "clock"),
        startTime : $$.number(data.startTime, 0),
        endTime   : $$.number(data.endTime, 0),
        timestamp : $$.number(data.timestamp, Date.now()),
        format    : $$.string(data.format, "[full date and time]"),
        interval  : $$.number(data.interval, 0)
    };

    this.propType = {
        type      : "time",
        startTime : "number",
        endTime   : "number",
        timestamp : "number",
        format    : "string",
        interval  : "number"
    };

    this.attribs = {
        setTimeout  : null,
        setInterval : null
    };

    this.element.appendChild(this.textNode);
    this.time(data.timestamp, data.format, data.interval);
};

$$.extendClass(Component.Time, Component.Base);

Component.Time.prototype.updateProp = function (propName, propValue) {
    if (this.props.hasOwnProperty(propName)) {
        this.props[propName] = $$[this.propType[propName]](propValue, this.props[propName]);
    }
    return this;
};

Component.Time.prototype.time = function (timestamp, format, interval) {
    this.props.timestamp = $$.number(timestamp, Date.now());
    this.format(format);
    this.interval(interval);
    return this;
};

Component.Time.prototype.format = function (format) {
    this.props.format = $$.string(format, this.props.format);
    var newTime = "";
    if (this.props.type === "clock") {              // Date and time
        newTime = $$.formatTime(this.props.timestamp, this.props.format);
    }
    else if (this.props.type === "countdown") {     // Countdown to startTime
        newTime = $$.formatTimer(this.props.startTime - Date.now(), this.props.format);
    }
    else if (this.props.type === "elapsed") {       // Time elapsed since startTime
        newTime = $$.formatTimer(Date.now() - this.props.startTime, this.props.format);
    }
    else if (this.props.type === "timer") {         // Time remaining before endTime
        newTime = $$.formatTimer(this.props.endTime - Date.now(), this.props.format);
    }
    this.textNode.nodeValue = newTime;
    return this;
};

Component.Time.prototype.updateTimeStatus = function (timeStatus) {
    var type       = "clock";
    var interval   = 0;
    var format     = "[h]:[mm]";
    var styleClass = "";

    switch (timeStatus) {
        case "starting soon":
            type = "countdown"; format = "[m] min"; interval = "every minute"; styleClass = "is-starting-soon";
            break;
        case "started":
            type = "elapsed"; format = "[d]:[h]:[m]:[s]"; interval = 1; styleClass = "is-started";
            break;
        case "ending soon":
            type = "elapsed"; format = "[d]:[h]:[m]:[s]"; interval = 1; styleClass = "is-ending-soon";
            break;
        case "ended":
            type = "clock"; format = "[hh]:[mm]"; interval = 0; styleClass = "is-ended";
            break;
    }

    this.updateProp("type", type).format(format).interval(interval).updateStyleClass(styleClass).updateClock().interval();
};

Component.Time.prototype.interval = function (interval) {
    var thisTime = this;
    interval = $$.number(interval, $$.string(interval, this.props.interval));
    clearTimeout(this.attribs.setTimeout);
    clearInterval(this.attribs.setInterval);
    if (typeof interval === "number" && interval > 0) {
        this.props.interval = interval;
        this.attribs.setInterval = setInterval(function () {
            thisTime.updateClock();
        }, interval * 1000);
    }
    else {
        var intervalObject = $$.getInterval(interval);
        if (intervalObject) {
            this.props.interval = intervalObject.interval;
            this.attribs.setTimeout = setTimeout(function () {
                thisTime.updateClock();
                thisTime.interval();
            }, intervalObject.timeout * 1000);
        } else {
            this.props.interval = 0;
            this.setInterval = null;
        }
    }
    return this;
};

Component.Time.prototype.updateClock = function () {
    this.props.timestamp = Date.now();
    this.format();
    return this;
};


// ========================================================
//                      NAME COMPONENT
// ========================================================

Component.Name = function (modelObject, dataObject) {
    var data        = $$.object(dataObject, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.props : model;
    this.subtype    = "name";
    this.element    = $$.getElement(data.element || "<name>");
    this.textNode   = document.createTextNode("");

    Component.Name.superclass.constructor.call(this, data);

    this.props = {
        firstName : $$.string(info.firstName, $$.string(info.name,  "")),
        lastName  : $$.string(info.lastName, ""),
        format    : $$.string(info.format, "[firstName] [lastName]")
    };

    this.addModel(model);
    this.element.appendChild(this.textNode);
    this.formatName();
};

$$.extendClass(Component.Name, Component.Base);

Component.Name.prototype.updateProp = function (propName, propValue) {
    if (propName === "name") { propName = "firstName"; }
    if (this.props.hasOwnProperty(propName)) {
        this.props[propName] = propValue;
        this.formatName();
    }
    return this;
};

Component.Name.prototype.formatName = function (formatString) {
    var nameString = this.props.format
        .replace(/\[firstName\]/g, this.props.firstName)
        .replace(/\[lastName\]/g, this.props.lastName)
        .replace(/\[firstInitial\]/g, $$.getInitial(this.props.firstName))
        .replace(/\[lastInitial\]/g, $$.getInitial(this.props.lastName));

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
    var info        = model.isModel ? model.props : model;
    this.subtype    = "avatar";
    this.element    = $$.getElement(data.element || "<avatar>");
    this.textNode   = document.createTextNode("");

    Component.Avatar.superclass.constructor.call(this, data);

    this.props = {
        firstName     : $$.string(info.firstName, $$.string(info.name,  "")),
        lastName      : $$.string(info.lastName, ""),
        avatar        : $$.string(info.avatar, ""),
        defaultAvatar : $$.string(info.defaultAvatar, $$.images.defaultContact),
        showInitials  : $$.boolean(info.showInitials, false)
    };

    this.addModel(model);
    this.add(this.textNode);
    this.formatAvatar();
};

$$.extendClass(Component.Avatar, Component.Base);

Component.Avatar.prototype.updateProp = function (propName, propValue) {
    if (propName === "name") { propName = "firstName"; }
    if (this.props.hasOwnProperty(propName)) {
        this.props[propName] = propValue;
        this.formatAvatar();
    }
    return this;
};

Component.Avatar.prototype.formatAvatar = function () {
    if (this.props.avatar) {
        this.element.style.backgroundImage = "url('" + this.props.avatar + "')";
        this.textNode.nodeValue = "";
    }
    else if (this.props.showInitials && (this.props.firstName || this.props.lastName)) {
        var initials = $$.getInitials([this.props.firstName, this.props.lastName]);
        this.textNode.nodeValue = initials;
        this.element.style.backgroundImage = "";
    }
    else {
        this.element.style.backgroundImage = "url('" + this.props.defaultAvatar + "')";
        this.textNode.nodeValue = "";
    }
    return this;
};


// ========================================================
//                    PROGRESS COMPONENT
// ========================================================

Component.Progress = function (modelObject, dataObject) {
    var data        = $$.object(dataObject, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.props : model;
    this.subtype    = "avatar";
    this.element    = $$.getElement(data.element || "<progress>");
    this.textNode   = document.createTextNode("");

    Component.Progress.superclass.constructor.call(this, data);

    this.props = {
        firstName     : $$.string(info.firstName, $$.string(info.name,  "")),
        lastName      : $$.string(info.lastName, ""),
        image         : $$.string(info.image, ""),
        defaultAvatar : $$.string(info.defaultAvatar, $$.images.defaultContact),
        showInitials  : $$.boolean(info.showInitials, false)
    };

    this.addModel(model);
    this.add(this.textNode);
    this.formatAvatar();
};

$$.extendClass(Component.Progress, Component.Base);

Component.Progress.prototype.updateProp = function (propName, propValue) {
    if (propName === "name") { propName = "firstName"; }
    if (this.props.hasOwnProperty(propName)) {
        this.props[propName] = propValue;
        this.formatAvatar();
    }
    return this;
};


// ========================================================
//                      CARD COMPONENT
// ========================================================

Component.Card = function (modelObject, dataObject) {
    var data        = $$.object(dataObject, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.props : model;
    var thisCard    = this;
    this.subtype    = "card";
    this.altClass   = model.subtype || "";
    this.element    = $$.getElement(data.element || "<card>");

    Component.Card.superclass.constructor.call(this, data);

    this.props = {
        size          : $$.string(data.size, "small"),
        name          : $$.string(info.name, ""),
        firstName     : $$.string(info.firstName, ""),
        lastName      : $$.string(info.lastName, ""),
        avatar        : $$.string(info.avatar, ""),
        status        : $$.string(info.status, "unknown"),
        defaultAvatar : $$.string(info.defaultAvatar, $$.images.defaultAvatar),
        isInRoster    : $$.boolean(info.isInRoster, false),
        showInitials  : $$.boolean(info.showInitials, false),
        organizer     : $$.string(info.organizer, ""),
        startTime     : $$.number(info.startTime, 0),
        endTime       : $$.number(info.endTime, 0)
    }

    this.propType = {
        size          : "string",
        name          : "string",
        firstName     : "string",
        lastName      : "string",
        avatar        : "string",
        status        : "string",
        defaultAvatar : "string",
        isInRoster    : "boolean",
        showInitials  : "boolean",
        organizer     : "string",
        startTime     : "number",
        endTime       : "number"
    }

    this.attribs = {
        startingSoonTimeout : null,
        startedTimeout      : null,
        endingSoonTimeout   : null,
        endedTimeout        : null,
        hoursTimeout        : null
    };

    this.parts = {
        avatar          : $$.Avatar(info),
        name            : $$.Name(info),
        status          : $$.Image({ element: "<status>", styleClass: "is-" + this.props.status }),
        statusText      : $$.Text({ element: "<status-text>", styleClass: "is-" + this.props.status, text: this.props.status }),
        meetingTime     : $$.Time({ timestamp: this.props.startTime, startTime: this.props.startTime, endTime: this.props.endTime, format: "[h]:[mm]" }),
        contents        : $$.Basic({ element: "<contents>" }),
        call            : $$.Image({ element: "<call>", image: $$.images.callLight }),

        buttons         : $$.Basic({ element: "<buttons>" }),
        scheduleMeeting : $$.Icon({ styleClass: "schedule-a-meeting", image: $$.images.meetingsAddLight, text: "Schedule a Meeting" }),
        rosterToggle    : $$.Icon({ styleClass: "roster-toggle" })
    };

    if (model.subtype) {
        this[model.subtype + "Parts"](info, data);
        this.props.defaultAvatar = $$.images["default" + $$.capitalize(model.subtype)];
    }

    this.addModel(model).updateNameAttribute().updateRosterState();
};

$$.extendClass(Component.Card, Component.Base);

Component.Card.prototype.updateProps = function (propsObject) {
    var props = $$.object(propsObject, this.props);
    for (var prop in props) {
        this.updateProp(prop, props[prop], true);
    }
    if (this.parent && this.parent.isComponent && this.parent.subtype === "list") {
        this.parent.sort();
    }
    return this;
};

Component.Card.prototype.updateProp = function (propName, propValue, stopSort) {
    if (this.props.hasOwnProperty(propName)) {
        this.props[propName] = $$[this.propType[propName]](propValue, this.props[propName]);
        this.updateParts(propName, propValue);

        if (propName === "name" || propName === "firstName" || propName == "lastName") {
            this.updateNameAttribute();
        }
        else if (propName === "status") {
            var status = $$.string(propValue, this.props.status);

            this.parts.status.updateStyleClass("is-" + status);
            this.parts.statusText.updateStyleClass("is-" + status).updateProp("text", status);
        }
        else if (propName === "isInRoster") {
            this.updateRosterState(propValue);
        }

        if (!stopSort && this.parent && this.parent.isComponent && this.parent.subtype === "list") {
            this.parent.sort();
        }
    }
    return this;
};

Component.Card.prototype.updateRosterState = function (isInRoster) {
    var inRoster = $$.boolean(isInRoster, this.props.isInRoster);
    var image    = $$.images.contactsAddLight;
    var text     = "Add to Contacts";
    if (inRoster === true) {
        image = $$.images.contactsRemoveLight;
        text  = "Remove from Contacts";
    }
    this.props.isInRoster = inRoster;
    this.parts.rosterToggle.updateProps({ text : text, image: image });
    return this;
};

Component.Card.prototype.updateNameAttribute = function () {
    var name      = this.props.name      || "";
    var firstName = this.props.firstName || "";
    var lastName  = this.props.lastName  || "";
    this.element.setAttribute("name", (name + " " + firstName + " " + lastName).trim());

    return this;
};

Component.Card.prototype.contactParts = function () {
    var parts = this.parts;
    if (this.props.size === "small") {
        this.add(parts.avatar.add(parts.status))
            .add(parts.contents.add(parts.name));
    } else {
        this.add(parts.avatar)
            .add(parts.contents
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
        .add(this.parts.contents.add(this.parts.name));

    return this;
};

Component.Card.prototype.meetingParts = function (info) {
    var parts = this.parts;
    var props = this.props;
    var attribs = this.attribs;
    attribs.startingSoonTimeout = setTimeout(function () {
        parts.meetingTime.updateTimeStatus("starting soon");
    }, (props.startTime - Date.now() - 299000));

    attribs.startedTimeout = setTimeout(function () {
        parts.meetingTime.updateTimeStatus("started");
    }, (props.startTime - Date.now()));

    attribs.endingSoonTimeout = setTimeout(function () {
        parts.meetingTime.updateTimeStatus("ending soon");
    }, (props.endTime - Date.now()) - 299000);

    attribs.endedTimeout = setTimeout(function () {
        parts.meetingTime.updateTimeStatus("ended");
    }, (props.endTime - Date.now()));

    this.add(parts.avatar
            .add(parts.meetingTime))
        .add(parts.contents
            .add(parts.name)
            .add(parts.organizer));

    return this;
};
