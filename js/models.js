var Model = {};

// ========================================================
//                       BASE MODEL
// ========================================================

Model.Base = function () {
    this.archetype  = "model";
    this.isModel    = true;
    this.app        = app;
    this.views      = [];

    app.models[this.subtype][this.ID] = this;
};

Model.Base.prototype.destroy = function () {
    this.resetAllRelationships().removeAllViews();
    if (app.models[this.subtype].hasOwnProperty(this.ID)) {
        delete app.models[this.subtype][this.ID];
    }
    this.ID = this.subtype = this.props = this.relationships = this.views = null;
    Log.write("destroy", this, "OK");
    return this;
}

Model.Base.prototype.updateProp = function (propName, propValue) {
    var outcome = "Unknown prop name.";
    if (this.props.hasOwnProperty(propName)) {
        outcome = "OK";
        this.props[propName] = propValue;
        this.updateViews(propName, propValue);
    }
    Log.write("updateProp", this, outcome, propName, propValue);
    return this;
};

Model.Base.prototype.updateProps = function (propsObject) {
    var prop;
    for (prop in propsObject) {
        this.updateProp(prop, propsObject[prop]);
    }
    Log.write("updateProps", this, "OK");
    return this;
};

Model.Base.prototype.addView = function (viewObject) {
    var outcome = "Invalid view object!";
    var archetype = $$.getArchetype(viewObject);
    if (archetype) {
        outcome = $$.capitalize(archetype) + " is already owned by this Model."
        if (this.views.indexOf(viewObject) < 0) {
            outcome = "OK";
            viewObject.model = viewObject.element.model = this;
            this.views.push(viewObject);
        }
    }
    Log.write("addView", this, outcome, $$.getSubtype(viewObject));
    return this;
};

Model.Base.prototype.removeView = function (viewObject) {
    var outcome = "Invalid view object.";
    var archetype = $$.getArchetype(viewObject);
    if (archetype) {
        outcome = $$.capitalize(archetype) + " is not owned by this Model.";
        var index = this.views.indexOf(viewObject);
        if (index > -1) {
            outcome = "OK";
            viewObject.remove();
            viewObject.model = viewObject.element.model = null;
            this.views.splice(index, 1);
        }
    }
    Log.write("removeView", this, outcome, $$.getSubtype(viewObject));
    return this;
};

Model.Base.prototype.updateViews = function (propName, propValue) {
    var i = 0;
    var total = this.views.length;
    for (i; i < total; i++) {
        this.views[i].updateProp(propName, propValue);
    }
    Log.write("updateViews", this, "OK", propName, propValue);
    return this;
};

Model.Base.prototype.removeAllViews = function () {
    var i = this.views.length - 1;
    for (i; i > -1; i--) {
        this.removeView(this.views[i]);
    }
    Log.write("removeAllViews", this, "OK");
    return this;
}

Model.Base.prototype.addRelationship = function (relationship, modelObject) {
    var outcome = "Invalid relationship name!";
    var validRelationship = this.relationships.hasOwnProperty(relationship);
    var modelSubtype = $$.getSubtype(modelObject);

    if (validRelationship) {
        outcome = "Invalid Model provided!";
        if (this.relationships[relationship].hasOwnProperty(modelSubtype)) {
            outcome = "Relationship already exists.";
            if (!this.relationships[relationship][modelSubtype].hasOwnProperty(modelObject.ID)) {
                outcome = "OK";
                this.relationships[relationship][modelSubtype][modelObject.ID] = modelObject;
                if (!modelObject.relationships[relationship][this.subtype].hasOwnProperty(this.ID)) {
                    modelObject.addRelationship(relationship, this);
                }
            }
        }
    }
    Log.write("addRelationship", this, outcome, relationship, modelObject.ID);
    return this;
};

Model.Base.prototype.removeRelationship = function (relationship, modelObject) {
    var outcome = "Invalid relationship name!";
    var validRelationship = this.relationships.hasOwnProperty(relationship);
    var modelSubtype = $$.getSubtype(modelObject);

    if (validRelationship) {
        outcome = "Invalid Model provided!"
        if (this.relationships[relationship].hasOwnProperty(modelSubtype)) {
            outcome = "Relationship does not exist.";
            if (this.relationships[relationship][modelSubtype].hasOwnProperty(modelObject.ID)) {
                outcome = "OK";
                delete this.relationships[relationship][modelSubtype][modelObject.ID];
                if (modelObject.relationships[relationship][this.subtype].hasOwnProperty(this.ID)) {
                    modelObject.removeRelationship(relationship, this);
                }
            }
        }
    }
    Log.write("removeRelationship", this, outcome, relationship, modelObject.ID);
    return this;
};

Model.Base.prototype.resetRelationshipCategory = function (relationship) {
    var outcome = "Invalid relationship category!";
    if (this.relationships.hasOwnProperty(relationship)) {
        outcome = "OK";
        var modelSubtype;
        for (modelSubtype in this.relationships[relationship]) {
            var i;
            for (i in this.relationships[relationship][modelSubtype]) {
                this.removeRelationship(relationship, this.relationships[relationship][modelSubtype][i]);
            }
        }
    }
    Log.write("resetRelationshipCategory", this, outcome, relationship);
    return this;
};

Model.Base.prototype.resetAllRelationships = function () {
    var relationship;
    for (relationship in this.relationships) {
        this.resetRelationshipCategory(relationship);
    }
    Log.write("resetAllRelationships", this, "OK");
    return this;
};


// ========================================================
//                      CONTACT MODEL
// ========================================================

Model.Contact = function (dataObject) {
    var data     = dataObject || {};
    this.ID      = data.ID;
    this.subtype = "contact";

    this.props = {
        firstName     : data.firstName    || "",
        lastName      : data.lastName     || "",
        avatar        : data.avatar       || "",
        defaultAvatar : data.defaultAvatar || $$.images.defaultContact,
        showInitials  : data.showInitials || true,
        status        : data.status       || "",
        isInRoster    : data.isInRoster   || false,
        jobTitle      : data.jobTitle     || "",
        emails        : data.emails       || [],
        phones        : data.phones       || []
    };

    this.relationships = {
        owner       : { room: {}, topic: {} },
        organizer   : { meeting: {} },
        moderator   : { room: {}, conversation: {}, topic: {}, meeting: {} },
        participant : { room: {}, conversation: {}, topic: {}, meeting: {} },
        member      : { conversation: {} },
        follower    : { topic: {} },
        attendee    : { meeting: {} },
        author      : { message : {} },
        share       : { shareRemote: {}, shareDesktop: {}, shareWindow: {} },
        microphone  : { microphone: {} },
        camera      : { camera: {} }
    };

    Model.Contact.superclass.constructor.call(this);
};

$$.extendClass(Model.Contact, Model.Base);


// ========================================================
//                       ROOM MODEL
// ========================================================

Model.Room = function (dataObject) {
    var data     = dataObject || {};
    this.ID      = data.ID;
    this.subtype = data.subtype === "topic"        ||
                   data.subtype === "conversation" ||
                   data.subtype === "meeting"      ?
                   data.subtype :   "room";

    this.props = {
        name          : data.name         || "",
        avatar        : data.avatar       || "",
        defaultAvatar : data.defaultAvatar || $$.images["default" + $$.capitalize(this.subtype)],
        showInitials  : data.showInitials || false,
        location      : data.location     || "",
        startTime     : data.startTime    || 0,
        endTime       : data.endTime      || 0,
        isLocked      : data.isLocked     || false,
        isRestricted  : data.isPrivate    || false,
        isFull        : data.isFull       || false,
        isFavorite    : data.isFavorite   || false
    };

    this.relationships = {
        owner       : { contact: {} },
        organizer   : { contact: {} },
        member      : { contact: {} },
        moderator   : { contact: {} },
        participant : { contact: {} },
        message     : { message: {} }
    };

    Model.Room.superclass.constructor.call(this);
};

$$.extendClass(Model.Room, Model.Base);


// ========================================================
//                      MESSAGE MODEL
// ========================================================

Model.Message = function (dataObject) {
    var data     = dataObject || {};
    this.ID      = data.ID;
    this.subtype = "message";

    this.props = {
        body     : data.body  || "",
        sendTime : data.sendTime || 0
    };

    this.relationships = {
        author  : { contact : {} },
        message : { room: {}, conversation: {}, topic: {}, meeting: {} }
    };

    Model.Message.superclass.constructor.call(this);
};

$$.extendClass(Model.Message, Model.Base);
