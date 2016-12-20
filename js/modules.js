var Module = {};

// ========================================================
//                       BASE MODULE
// ========================================================

Module.Base = function (data) {
    Module.Base.superclass.constructor.call(this, data);
    this.archetype = "module";
    this.isModule  = true;
};

$$.extendClass(Module.Base, View.Base);


// ========================================================
//                       APP MODULE
// ========================================================

Module.App = function (moduleData) {
    var data     = $$.object(moduleData, {});
    this.ID      = $$.string(data.ID, Date.now());
    this.user;   // = new Neo.User();
    this.subtype = "app";
    this.element = $$.getElement(data.element || "<body>");

    Module.App.superclass.constructor.call(this, data);

    this.models = {
        contact      : {},
        room         : {},
        conversation : {},
        topic        : {},
        meeting      : {},
        message      : {},
        camera       : {local :{}, remote: {}},
        microphone   : {local :{}, remote: {}},
        share        : {local :{}, remote: {}}
    };

    this.parts = {
        // Components
        top      : $$.Basic({ element: "<top>" }),
        main     : $$.Basic({ element: "<main>" }),
        bottom   : $$.Basic({ element: "<bottom>" }),
        fade     : $$.Basic({ element: "<app-fade>" }),
        settings : $$.Image({ element: "<settings-dropdown>", image: $$.images.settingsLight }), // make this a module
        // Modules
        devices    : $$.Devices(),
        login      : $$.Login(),
        navigation : $$.Navigation(),
        results    : $$.Results(),
        specifics      : $$.Specifics(),
    };

    this.props = {
        background  : "",
        isXMPP      : $$.boolean(data.isXMPP, false),
        isGuestMode : $$.boolean(data.isGuestMode, false),
        activeRoom  : null
    };

    this.propType = {
        background  : "string",
        isXMPP      : "boolean",
        isGuestMode : "boolean",
        activeRoom  : "object"
    }

    this.assemble();
    this.updateProp("background", $$.images.background0);
};

$$.extendClass(Module.App, Module.Base);

Module.App.prototype.updateProp = function (propName, propValue) {
    if (this.props.hasOwnProperty(propName)) {
        var type  = this.propType[propName];
        var value = $$[type](propValue);
        if (value) {
            this.props[propName] = value;
            for (var part in this.parts) {
                this.parts[part].updateProp(propName, propValue);
            }
        }
        if (propName === "background") {
            this.element.style.backgroundImage = "url(" + propValue + ")";
        }
    }
    return this;
};

Module.App.prototype.assemble = function () {
    var parts = this.parts;

    this.add(parts.top.add(parts.settings))
        .add(parts.main)
        .add(parts.bottom);

    parts.top.toggle("active", true, "top");

    return this;
};

Module.App.prototype.registerCallback = function (callbackName) {
};


Module.App.prototype.signalModules = function (signalObject ) {
    for (var part in this.parts) {
        this.parts[part].signal(signalObject);
    }

    return this;
};

Module.App.prototype.start = function () {
    var loginModule = this.parts.login;

    this.parts.fade.addTo(this).toggle("active", true, "opacity");
    this.parts.devices.addTo(this.parts.top, 0);
    this.parts.login.addTo(this.parts.main);
    this.remove($$.getElement("#initialize-app"))
    delete this.element.onload;

    this.parts.login.toggle("active", true, "opacity");

    API.onAppStart();

    return this;
};

Module.App.prototype.loginSuccessful = function () {
    var parts = this.parts;

    parts.login.remove();
    parts.fade.remove();

    parts.main
        .add(parts.navigation)
        .add(parts.results)
        .add(parts.specifics)
        .toggle("active", true);

    parts.navigation.toggle("active", true, "left");
    this.eachPart("selectNavigationItem", "contacts");
    parts.results.updateRoster(dummydata);

    API.onLoginSuccessful();

    return this;
};


// ========================================================
//                     DEVICES MODULE
// ========================================================

Module.Devices = function (moduleData) {
    var data     = $$.object(moduleData, {});
    this.ID      = data.ID || "devices-module";
    this.subtype = "devices";
    this.element = $$.getElement(data.element || "<devices>");

    Module.Devices.superclass.constructor.call(this, data);

    this.parts = {
        microphone : $$.Image({ element: "<device-toggle>", styleClass: "microphone", image: $$.images.microphoneOn }),
        selfView   : $$.Basic({ element: "<self-view>" }),
        camera     : $$.Image({ element: "<device-toggle>", styleClass: "camera", image: $$.images.cameraOn }),
    }

    this.assemble().addEvents();
}

$$.extendClass(Module.Devices, Module.Base);

Module.Devices.prototype.assemble = function () {
    var parts = this.parts;
    this.add(parts.microphone).add(parts.selfView).add(parts.camera);

    return this;
};

Module.Devices.prototype.addEvents = function () {
    var thisModule = this;
    var parts = this.parts;
    parts.selfView   .addEvent("click", function (e) { thisModule.toggle("selected") });
    parts.microphone .addEvent("click", function (e) { thisModule.toggleMute("microphone"); });
    parts.camera     .addEvent("click", function (e) { thisModule.toggleMute("camera"); });

    return this;
};

Module.Devices.prototype.toggleMute = function (deviceName) {
    var parts = this.parts;
    var state = "On";

    parts[deviceName].toggle("muted");

    if (parts[deviceName].toggles.muted) {
        state = "Off";
    }

    if (deviceName === "camera") {
        if (state === "On") {
            this.toggle("restricted", false);
        } else {
            this.toggle("selected", false).toggle("restricted", true);
        }
    }

    parts[deviceName].updateProp("image", $$.images[deviceName + state]);

    return this;
};


// ========================================================
//                      LOGIN MODULE
// ========================================================

Module.Login = function (moduleData) {
    var data     = $$.object(moduleData, {});
    this.ID      = data.ID || "login-module";
    this.subtype = "login";
    this.element = $$.getElement(data.element || "<login>");

    Module.Login.superclass.constructor.call(this, data);

    this.parts = {
        loginMenu      : $$.Basic({ element: "<login-menu>" }),
        appLogo        : $$.Image({ element: "<app-logo>", image: $$.images.appLogo }),
        loginForm      : $$.Basic({ element: "<form>" }),
        welcomeMessage : $$.Text({ element: "<header>", text: "Oh, hello. Glad you could join us." }),
        server         : $$.Entry({ type: "text", styleClass: "server", placeholder: "Server", readonly: "true" }),
        username       : $$.Entry({ type: "text", styleClass: "username", placeholder: "Username" }),
        password       : $$.Entry({ type: "password", styleClass: "password", placeholder: "Password" }),
        submit         : $$.Entry({ type: "submit", styleClass: "submit", value: "Sign In" }),
        autoLogin      : $$.Entry({ type: "checkbox", styleClass: "checkbox", label: "Remember my username", labelPosition: "after" }),
        cancelButton   : $$.Text({ element: "<cancel-button>", text: "Cancel" })
    };

    this.props = {
        background  : $$.images.background,
        serverMin   : 1,
        serverMax   : 128,
        usernameMin : 2,
        usernameMax : 64,
        passwordMin : 6,
        passwordMax : 64,
    };

    this.propType = {
        background  : "string",
        serverMin   : "number",
        serverMax   : "number",
        usernameMin : "number",
        usernameMax : "number",
        passwordMin : "number",
        passwordMax : "number",
    };

    this.assemble().addEvents().verifyEntry().setFocus();
};

$$.extendClass(Module.Login, Module.Base);

Module.Login.prototype.updateProp = function (propName, propValue) {
    if (this.props.hasOwnProperty(propName)) {
        var type  = this.propType[propName];
        var value = $$[type](propValue);
        if (value) {
            this.props[propName] = value;
        }
    }
    return this;
};

Module.Login.prototype.assemble = function () {
    var parts = this.parts;
    this.add(parts.loginMenu
            .add(parts.appLogo)
            .add(parts.loginForm
                .add(parts.welcomeMessage)
                .add(parts.server).add(parts.username).add(parts.password)
                .add(parts.autoLogin)
                .add(parts.submit)
            )
        );

    var server   = $$.string(localStorage.server, "");
    var username = $$.string(localStorage.username, "");

    parts.server.updateProp("value", server).updateProp("readonly", server ? "true" : "")
        .updateProp("maxlength", this.props.serverMax);
    parts.username.updateProp("value", username)
        .updateProp("maxlength", this.props.usernameMax);
    parts.submit.toggle("disabled", true)
        .updateProp("maxlength", this.props.passwordMax);

    if (localStorage.autoLogin === "true") {
        parts.autoLogin.input.setAttribute("checked", true);
    }

    return this;
};

Module.Login.prototype.addEvents = function () {
    var thisModule = this;
    var parts = this.parts;
    parts.server    .addEvent("dblclick", function (e) { parts.server.updateProp("readonly", "").input.select(); });
    parts.loginForm .addEvent("keyup",    function (e) { thisModule.verifyEntry(e); });
    parts.loginForm .addEvent("input",    function (e) { thisModule.verifyEntry(e); });
    parts.loginForm .addEvent("submit",   function (e) { thisModule.submit(e); });

    return this;
};

Module.Login.prototype.verifyEntry = function () {
    var parts = this.parts;
    var props = this.props;
    var server       = parts.server.input.value;
    var username     = parts.username.input.value;
    var password     = parts.password.input.value;
    var dotIndex     = server.indexOf(".") > -1 ? server.indexOf(".") : server.indexOf(":");
    var inputIsValid = server.length >= props.serverMin && (dotIndex > -1 && dotIndex < server.length - 1)

    parts.server.toggle("active", inputIsValid);
    parts.username.toggle("active", (username.length >= props.usernameMin));
    parts.password.toggle("active", (password.length >= props.passwordMin));
    parts.submit.toggle("disabled", !(parts.server.toggles.active && parts.username.toggles.active && parts.password.toggles.active));

    return this;
};

Module.Login.prototype.submit = function (e) {
    var parts = this.parts;
    if (!parts.submit.toggles.disabled) {
        var saveCredentials = parts.autoLogin.input.checked;
        // ** LOGIN API GOES HERE **
        localStorage.server    = parts.server.input.value;
        localStorage.username  = saveCredentials ? parts.username.input.value : "";
        localStorage.autoLogin = saveCredentials;
        parts.submit.toggle("disabled", true);
        this.loginSuccessful();
    }
    e.preventDefault();

    return this;
};

Module.Login.prototype.setFocus = function () {
    var formObjects = this.parts.loginForm.addedObjects;
    var i = 0, total = formObjects.length;
    for (i; i < total; i++) {
        if (formObjects[i].subtype === "entry" && !formObjects[i].toggles.active) {
            formObjects[i].input.focus();
            setTimeout(function () { formObjects[i].input.focus(); }, 100);
            break;
        }
    }
    return this;
};

Module.Login.prototype.loginSuccessful = function () {
    var thisModule = this;
    function removeModule(e) {
        if (e.propertyName === "opacity") { app.loginSuccessful(); }
    }
    this.singleEvent("transitionend", removeModule).toggle("active", false);

    return this;
};

Module.Login.prototype.loginFailed = function (reasonCode) {
    return this;
};


// ========================================================
//                  NAVIGATION MODULE
// ========================================================

Module.Navigation = function (moduleData) {
    var data      = $$.object(moduleData, {});
    this.ID       = data.ID || "navigation-module";
    this.subtype  = "navigation";
    this.element  = $$.getElement(data.element || "<navigation>");

    Module.Navigation.superclass.constructor.call(this, data);

    this.parts = {
        search   : $$.Image({ image: $$.images.searchLight, styleClass: "search" }),
        contacts : $$.Image({ image: $$.images.contactsLight, styleClass: "contacts" }),
        rooms    : $$.Image({ image: $$.images.roomsLight, styleClass: "rooms" }),
        meetings : $$.Image({ image: $$.images.meetingsLight, styleClass: "meetings" }),
        alerts   : $$.Image({ image: $$.images.alertsLight, styleClass: "alerts" })
    };

    this.props = {
        selectedNavigation : "",
    };

    this.assemble().addEvents();
};

$$.extendClass(Module.Navigation, Module.Base);

Module.Navigation.prototype.assemble = function () {
    var parts = this.parts;
    this.add(parts.search)
        .add(parts.contacts)
        .add(parts.rooms)
        .add(parts.meetings.add($$.Time({ format: "[D]", interval: "every day" })))
        .add(parts.alerts);

    return this;
};

Module.Navigation.prototype.addEvents = function () {
    var thisModule = this;
    var parts = this.parts;
    var props = this.props;

    for (var part in parts) {
        parts[part].addEvent("click", function (event) {
            app.eachPart("selectNavigationItem", this.object.styleClass);
        });
    }
    return this;
};

Module.Navigation.prototype.selectNavigationItem = function (sectionName) {
    var section    = $$.string(sectionName, this.props.selectedNavigation);
    var isSelected = false;
    var newSection = "";

    if (this.parts.hasOwnProperty(section)) {
        if (section !== this.props.selectedNavigation) {
            isSelected = true;
            newSection = section;
            if (this.props.selectedNavigation) {
                this.parts[this.props.selectedNavigation].toggle("selected", false);
            }
        }
        this.parts[section].toggle("selected", isSelected);
        this.props.selectedNavigation = newSection;
    }
    return this;
};


// ========================================================
//                      RESULTS MODULE
// ========================================================

Module.Results = function (moduleData) {
    var data      = $$.object(moduleData, {});
    this.ID       = data.ID || "results-module";
    this.subtype  = "results";
    this.element  = $$.getElement(data.element || "<results>");

    Module.Results.superclass.constructor.call(this, data);

    this.parts = {
        search          : $$.Basic({ element: "<section>", styleClass: "search" }),
        contacts        : $$.Basic({ element: "<section>", styleClass: "contacts" }),
        rooms           : $$.Basic({ element: "<section>", styleClass: "rooms" }),
        meetings        : $$.Basic({ element: "<section>", styleClass: "meetings" }),
        alerts          : $$.Basic({ element: "<section>", styleClass: "alerts" }),

        searchHeader    : $$.Basic({ element: "<header>" }),
        contactsHeader  : $$.Icon({ element: "<header>", image: $$.images.contactsDark, text: "Contacts" }),
        roomsHeader     : $$.Icon({ element: "<header>", image: $$.images.roomsDark,    text: "Rooms" }),
        meetingsHeader  : $$.Icon({ element: "<header>", image: $$.images.meetingsDark, text: "Meetings" }),
        alertsHeader    : $$.Icon({ element: "<header>", image: $$.images.alertsDark,   text: "Alerts" }),

        searchResults   : $$.List(),
        contactsResults : $$.List(),
        roomsResults    : $$.List({ sortProp: "name", sortByStatus: false }),
        meetingsResults : $$.List({ sortProp: "startTime", sortByStatus: false }),
        alertsResults   : $$.List(),

        headerDate      : $$.Time({ format: "[D]", interval: "every day" }),
        searchField     : $$.Entry({ placeholder: "Search", type: "search" })
    };

    this.props = {
        selectedNavigation : "",
        selectedResult     : null
    };

    this.assemble();
};

$$.extendClass(Module.Results, Module.Base);

Module.Results.prototype.assemble = function () {
    var parts = this.parts;
    this.add(parts.search.add(parts.searchHeader).add(parts.searchResults))
        .add(parts.contacts.add(parts.contactsHeader).add(parts.contactsResults))
        .add(parts.rooms.add(parts.roomsHeader).add(parts.roomsResults))
        .add(parts.meetings.add(parts.meetingsHeader).add(parts.meetingsResults))
        .add(parts.alerts.add(parts.alertsHeader).add(parts.alertsResults));

    parts.meetingsHeader.parts.image.add(parts.headerDate);
    parts.searchHeader.add(parts.searchField);

    return this;
};

Module.Results.prototype.selectNavigationItem = function (sectionName) {
    var section    = $$.string(sectionName, this.props.selectedNavigation);
    var isSelected = false;
    var newSection = "";

    if (this.parts.hasOwnProperty(section)) {
        if (section !== this.props.selectedNavigation) {
            isSelected = true;
            newSection = section;
            if (this.props.selectedNavigation) {
                this.parts[this.props.selectedNavigation].toggle("selected", false);
            }
            if (section === "search") {
                this.parts.searchField.input.focus();
            }
        }
        this.toggle("selected", isSelected);
        this.parts[section].toggle("selected", isSelected);
        this.props.selectedNavigation = newSection;
    }
    return this;
};

Module.Results.prototype.selectResultItem = function (selectedItem, event) {
    var result     = $$.view(selectedItem, false);
    var isSelected = false;
    var newResult  = null;

    if (result) {
        app.parts.specifics.eachAddedObject("remove", null, true);
        if (result !== this.props.selectedResult) {
            isSelected = true;
            newResult = result;
            if (this.props.selectedResult) {
                this.props.selectedResult.toggle("selected", false);
            }
            app.parts.specifics.addCard(selectedItem.model);
        }
        this.props.selectedResult = newResult;
        result.toggle("selected", isSelected);
    }
    return this;
};

Module.Results.prototype.updateRoster = function (rosterObject) {
    var roster = $$.object(rosterObject, {});
    var rosterCategory;
    for (rosterCategory in roster) {
        var i = 0, total = roster[rosterCategory].length;
        for (i; i < total; i++) {
            this.addRosterCard($$[$$.capitalize(rosterCategory)](roster[rosterCategory][i]));
        }
        this.parts[rosterCategory + "sResults"].sort();
    }

    return this;
};

Module.Results.prototype.addRosterCard = function (modelObject, sortNeeded) {
    var thisModule  = this;
    var list        = this.parts[modelObject.subtype + "sResults"];
    var listItems   = list.addedObjects;
    var listHasCard = false;

    var i = 0, total = listItems.length;
    for (i; i < total; i++) {
        if (listItems[i].model === modelObject) {
            listHasCard = true;
        }
    }

    if (!listHasCard) {
        var card = $$.Card(modelObject);

        card.addEvent("click", function (event) {
            app.eachPart("selectResultItem", card, event);
        });

        list.add(card);

        if (sortNeeded) {
            list.sort();
        }
    }

    return this;
};


// ========================================================
//                     SPECIFICS MODULE
// ========================================================

Module.Specifics = function (moduleData) {
    var data        = $$.object(moduleData, {});
    this.ID         = "specifics-module-" + Date.now();
    this.subtype    = "specifics";
    this.element    = $$.getElement(data.element || "<specifics>");

    Module.Specifics.superclass.constructor.call(this, data);
};

$$.extendClass(Module.Specifics, Module.Base);

Module.Specifics.prototype.assemble = function (model) {
    return this;
};

Module.Specifics.prototype.addEvents = function () {
    return this;
};

Module.Specifics.prototype.addCard = function (modelObject) {
    var newCard = $$.Card(modelObject, { size: "large" });
    newCard.parts.rosterToggle.addEvent("click", function (event) {
        modelObject.updateProp("isInRoster", !newCard.props.isInRoster);
    });
    this.add(newCard);
}
