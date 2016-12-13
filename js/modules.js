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
        stage      : $$.Stage(),
    };

    this.properties = {
        background  : "",
        isXMPP      : $$.boolean(data.isXMPP, false),
        isGuestMode : $$.boolean(data.isGuestMode, false),
        activeRoom  : null
    };

    this.attributes = {
        background  : "string",
        isXMPP      : "boolean",
        isGuestMode : "boolean",
        activeRoom  : "object"
    }

    this.assemble();
    this.updateProperty("background", $$.images.background0);
};

$$.extendClass(Module.App, Module.Base);

Module.App.prototype.updateProperty = function (propertyName, propertyValue) {
    if (this.properties.hasOwnProperty(propertyName)) {
        var type  = this.attributes[propertyName];
        var value = $$[type](propertyValue);
        if (value) {
            this.properties[propertyName] = value;
            for (var part in this.parts) {
                this.parts[part].updateProperty(propertyName, propertyValue);
            }
        }
        if (propertyName === "background") {
            this.element.style.backgroundImage = "url(" + propertyValue + ")";
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

Module.App.prototype.toggleNavigation = function (sectionName) {
    var signalObject = {
        name       : "TOGGLE_NAVIGATION",
        target     : this,
        stopBubble : true,
        info       : $$.string(sectionName),
    };
    this.signalModules(signalObject);
};

Module.App.prototype.start = function () {
    var loginModule = this.parts.login;

    this.parts.fade.addTo(this).toggle("active", true, "opacity");
    this.parts.devices.addTo(this.parts.top, 0);
    this.parts.login.addTo(this.parts.main);
    this.remove($$.getElement("#initialize-app"));

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
        .add(parts.stage)
        .toggle("active", true);

    parts.navigation.toggle("active", true, "left");

    parts.results.updateRoster(dummydata);

    app.toggleNavigation("contacts");

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

    parts[deviceName].updateProperty("image", $$.images[deviceName + state]);

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
        backgroundBlur : $$.Image({ element: "<background-blur>" }),
        appLogo        : $$.Image({ element: "<app-logo>", image: $$.images.appLogo }),
        loginForm      : $$.Basic({ element: "<form>" }),
        welcomeMessage : $$.Text({ element: "<header>", text: "Oh, hello. Glad you could join us." }),
        server         : $$.Input({ type: "text", placeholder: "Server", readonly: "true" }),
        username       : $$.Input({ type: "text", placeholder: "Username" }),
        password       : $$.Input({ type: "password", placeholder: "Password" }),
        submit         : $$.Input({ type: "submit", value: "Sign In" }),
        autoLogin      : $$.Input({ type: "checkbox", label: "Remember my username", labelPosition: "after" }),
        cancelButton   : $$.Text({ element: "<cancel-button>", text: "Cancel" })
    };

    this.properties = {
        background  : $$.images.background,
        serverMin   : 1,
        serverMax   : 128,
        usernameMin : 2,
        usernameMax : 64,
        passwordMin : 6,
        passwordMax : 64,
    };

    this.attributes = {
        background  : "string",
        serverMin   : "number",
        serverMax   : "number",
        usernameMin : "number",
        usernameMax : "number",
        passwordMin : "number",
        passwordMax : "number",
    };

    this.assemble().addEvents().verifyInput().setFocus();
};

$$.extendClass(Module.Login, Module.Base);

Module.Login.prototype.updateProperty = function (propertyName, propertyValue) {
    if (this.properties.hasOwnProperty(propertyName)) {
        var type  = this.attributes[propertyName];
        var value = $$[type](propertyValue);
        if (value) {
            this.properties[propertyName] = value;
        }
        if (propertyName === "background") {
            this.parts.backgroundBlur.updateProperty("image", propertyValue);
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
        ).add(parts.backgroundBlur);

    var server   = $$.string(localStorage.server, "");
    var username = $$.string(localStorage.username, "");

    parts.server.updateProperty("value", server).updateProperty("readonly", server ? "true" : "")
        .updateProperty("maxlength", this.properties.serverMax);
    parts.username.updateProperty("value", username)
        .updateProperty("maxlength", this.properties.usernameMax);
    parts.submit.toggle("disabled", true)
        .updateProperty("maxlength", this.properties.passwordMax);

    if (localStorage.autoLogin === "true") { parts.autoLogin.input.setAttribute("checked", true); }

    return this;
};

Module.Login.prototype.addEvents = function () {
    var thisModule = this;
    var parts = this.parts;
    parts.server    .addEvent("dblclick", function (e) { parts.server.updateProperty("readonly", "").input.select(); });
    parts.loginForm .addEvent("keyup",    function (e) { thisModule.verifyInput(e); });
    parts.loginForm .addEvent("input",    function (e) { thisModule.verifyInput(e); });
    parts.loginForm .addEvent("submit",   function (e) { thisModule.submit(e); });

    return this;
};

Module.Login.prototype.verifyInput = function () {
    var parts = this.parts;
    var props = this.properties;
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
        this.loginSuccessful();
    }
    e.preventDefault();

    return this;
};

Module.Login.prototype.setFocus = function () {
    var formObjects = this.parts.loginForm.addedObjects;
    var i = 0, total = formObjects.length;
    for (i; i < total; i++) {
        if (formObjects[i].subtype === "input" && !formObjects[i].toggles.active) {
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

    this.properties = {
        selectedNav : "",
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
    var props = this.properties;

    for (var part in parts) {
        parts[part].addEvent("click", function (event) {
            app.toggleNavigation(this.object.styleClass);
        });
    }

    this.addSignal("TOGGLE_NAVIGATION", function (signalObject) {
        var data = $$.object(signalObject, {});
        var isSelected = true;
        if (parts.hasOwnProperty(data.info)) {
            if (data.info !== props.selectedNav) {
                if (parts[props.selectedNav]) {
                    parts[props.selectedNav].toggle("selected", false);
                }
                props.selectedNav = data.info;
            } else {
                props.selectedNav = "";
                isSelected = false;
            }
            parts[data.info].toggle("selected", isSelected);
        }
    });

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
        roomsResults    : $$.List(),
        meetingsResults : $$.List(),
        alertsResults   : $$.List(),

        headerDate      : $$.Time({ format: "[D]", interval: "every day" }),
        searchField     : $$.Input({ placeholder: "Search", type: "search" })
    };

    this.properties = {
        selectedNav    : "",
        selectedResult : null
    };

    this.assemble().addEvents();
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

Module.Results.prototype.addEvents = function () {
    var thisModule = this;
    var parts = this.parts;
    var props = this.properties;

    this.addSignal("TOGGLE_NAVIGATION", function (signalObject) {
        var data = $$.object(signalObject, {});
        var isSelected = true;
        if (parts.hasOwnProperty(data.info)) {
            if (data.info !== props.selectedNav) {
                if (props.selectedNav) {
                    parts[props.selectedNav].toggle("selected", false);
                }
                props.selectedNav = data.info;
                if (data.info === "search") {
                    parts.searchField.input.focus();
                }
            } else {
                props.selectedNav = "";
                isSelected = false;
            }
            thisModule.toggle("selected", isSelected);
            parts[data.info].toggle("selected", isSelected);
        }
    });

    this.addSignal("TOGGLE_RESULT", function (signalObject) {
        var data = $$.object(signalObject, {});
        var isSelected = true;
        if (data.hasOwnProperty("origin") && data.origin.isView) {
            app.parts.stage.eachAddedObject("remove", null, true);
            if (data.origin !== props.selectedResult) {
                if (props.selectedResult) {
                    props.selectedResult.toggle("selected", false);
                }
                props.selectedResult = data.origin;
                app.parts.stage.addCard(data.origin.model);
            } else {
                props.selectedResult = null;
                isSelected = false;
            }
            data.origin.toggle("selected", isSelected);
        }
    });

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
        var signalObject = {
            name   : "TOGGLE_RESULT",
            origin : card,
            target : thisModule
        }

        card.addEvent("click", function (event) {
            signalObject.event = event;
            card.signal(signalObject);
        });

        list.add(card);

        if (sortNeeded) {
            list.sort();
        }
    }

    return this;
};


// ========================================================
//                      STAGE MODULE
// ========================================================

Module.Stage = function (moduleData) {
    var data        = $$.object(moduleData, {});
    this.ID         = "-module-" + Date.now();
    this.subtype    = "stage";
    this.element    = $$.getElement(data.element || "<stage>");

    Module.Stage.superclass.constructor.call(this, data);
};

$$.extendClass(Module.Stage, Module.Base);

Module.Stage.prototype.assemble = function (model) {
    return this;
};

Module.Stage.prototype.addEvents = function () {
    return this;
};

Module.Stage.prototype.addCard = function (modelObject) {
    var newCard = $$.Card(modelObject, { size: "large" });
    newCard.parts.rosterToggle.addEvent("click", function (event) {
        modelObject.updateProperty("isInRoster", !newCard.properties.isInRoster);
    });
    this.add(newCard);
}
