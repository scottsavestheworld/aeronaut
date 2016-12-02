var Module = {};

// ========================================================
//                       BASE MODULE
// ========================================================

Module.Base = function () {
    Module.Base.superclass.constructor.call(this);
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

    Module.App.superclass.constructor.call(this);

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

    this.modules = {
        devices    : $$.Devices(),
        login      : $$.Login(),
        navigation : $$.Navigation(),
        results    : $$.Results(),
//        details    : $$.Details(),
//        search    : $$.Search()
    };

    this.components = {
        top      : $$.Basic({ element: "<top>" }),
        main     : $$.Basic({ element: "<main>" }),
        bottom   : $$.Basic({ element: "<bottom>" }),
        nav      : $$.Basic({ element: "<nav>" }),
        main     : $$.Basic({ element: "<main>" }),
        fade     : $$.Basic({ element: "<app-fade>" }),
        settings : $$.Image({ element: "<settings-dropdown>", image: $$.images.settingsLight })
    };

    this.properties = {
        background  : $$.images.background,
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
    this.updateProperty("background", $$.images.background);
};

$$.extendClass(Module.App, Module.Base);

Module.App.prototype.updateProperty = function (propertyName, propertyValue) {
    if (this.properties.hasOwnProperty(propertyName)) {
        var type  = this.attributes[propertyName];
        var value = $$[type](propertyValue);
        if (value) {
            this.properties[propertyName] = value;
            for (var module in this.modules) {
                this.modules[module].updateProperty(propertyName, propertyValue);
            }
        }
        if (propertyName === "background") {
            this.element.style.backgroundImage = "url(" + propertyValue + ")";
        }
    }
    return this;
};

Module.App.prototype.assemble = function () {
    var c = this.components;

    this.add(c.top.add(c.settings))
        .add(c.main)
        .add(c.bottom);

    return this;
};

Module.App.prototype.registerCallback = function (callbackName) {
};


Module.App.prototype.signalModules = function (signalObject ) {
    for (var module in this.modules) {
        this.modules[module].signal(signalObject);
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
    var loginModule = this.modules.login;

    this.add(this.components.fade);
    this.modules.devices.addTo(this.components.top, 0).toggle("active", true, 100);
    this.modules.login.addTo(this.components.main).toggle("active", true, 100);
    this.remove($$.getElement("#initialize-app"));

    API.onAppStart();

    return this;
};

Module.App.prototype.loginSuccessful = function () {
    var c = this.components;
    var m = this.modules;

    m.login.remove();
    c.fade.remove();

    m.navigation.addTo(c.main).toggle("active", true);
    m.results.addTo(c.main);
//    m.details.addTo(c.main).toggle("active", true);
    c.main.toggle("active", true);

    m.results.updateRoster(dummydata);

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

    Module.Devices.superclass.constructor.call(this);

    this.components = {
        microphone : $$.Image({ element: "<device-toggle>", styleClass: "microphone", image: $$.images.microphoneOn }),
        selfView   : $$.Basic({ element: "<self-view>" }),
        camera     : $$.Image({ element: "<device-toggle>", styleClass: "camera", image: $$.images.cameraOn }),
    }

    this.assemble().addEvents();
}

$$.extendClass(Module.Devices, Module.Base);

Module.Devices.prototype.assemble = function () {
    var c = this.components;
    this.add(c.microphone).add(c.selfView).add(c.camera);

    return this;
};

Module.Devices.prototype.addEvents = function () {
    var thisModule = this;
    var c = this.components;
    c.selfView   .addEvent("click", function (e) { thisModule.toggle("selected") });
    c.microphone .addEvent("click", function (e) { thisModule.toggleMute("microphone"); });
    c.camera     .addEvent("click", function (e) { thisModule.toggleMute("camera"); });

    return this;
};

Module.Devices.prototype.toggleMute = function (deviceName) {
    var c = this.components;
    var state = "On";

    c[deviceName].toggle("muted");

    if (c[deviceName].toggles.muted) {
        state = "Off";
    }

    if (deviceName === "camera") {
        if (state === "On") {
            this.toggle("restricted", false);
        } else {
            this.toggle("selected", false).toggle("restricted", true);
        }
    }

    c[deviceName].updateProperty("image", $$.images[deviceName + state]);

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

    Module.Login.superclass.constructor.call(this);

    this.components = {
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
            this.components.backgroundBlur.updateProperty("image", propertyValue);
        }
    }
    return this;
};

Module.Login.prototype.assemble = function () {
    var c = this.components;
    this.add(c.loginMenu
            .add(c.appLogo)
            .add(c.loginForm
                .add(c.welcomeMessage)
                .add(c.server).add(c.username).add(c.password)
                .add(c.autoLogin)
                .add(c.submit)
            )
        ).add(c.backgroundBlur);

    var server   = $$.string(localStorage.server, "");
    var username = $$.string(localStorage.username, "");

    c.server.updateProperty("value", server).updateProperty("readonly", server ? "true" : "")
        .updateProperty("maxlength", this.properties.serverMax);
    c.username.updateProperty("value", username)
        .updateProperty("maxlength", this.properties.usernameMax);
    c.submit.toggle("disabled", true)
        .updateProperty("maxlength", this.properties.passwordMax);

    if (localStorage.autoLogin === "true") { c.autoLogin.input.setAttribute("checked", true); }

    return this;
};

Module.Login.prototype.addEvents = function () {
    var thisModule = this;
    var c = this.components;
    c.server    .addEvent("dblclick",  function (e) { c.server.updateProperty("readonly", "").input.select(); });
    c.loginForm .addEvent("keyup",  function (e) { thisModule.verifyInput(e); });
    c.loginForm .addEvent("input",  function (e) { thisModule.verifyInput(e); });
    c.loginForm .addEvent("submit", function (e) { thisModule.submit(e); });

    return this;
};

Module.Login.prototype.verifyInput = function () {
    var c = this.components;
    var p = this.properties;
    var server       = c.server.input.value;
    var username     = c.username.input.value;
    var password     = c.password.input.value;
    var dotIndex     = server.indexOf(".") > -1 ? server.indexOf(".") : server.indexOf(":");
    var inputIsValid = server.length >= p.serverMin && (dotIndex > -1 && dotIndex < server.length - 1)

    c.server.toggle("active", inputIsValid);
    c.username.toggle("active", (username.length >= p.usernameMin));
    c.password.toggle("active", (password.length >= p.passwordMin));
    c.submit.toggle("disabled", !(c.server.toggles.active && c.username.toggles.active && c.password.toggles.active));

    return this;
};

Module.Login.prototype.submit = function (e) {
    var c = this.components;
    if (!c.submit.toggles.disabled) {
        var saveCredentials = c.autoLogin.input.checked;
        // ** LOGIN API GOES HERE **
        localStorage.server    = c.server.input.value;
        localStorage.username  = saveCredentials ? c.username.input.value : "";
        localStorage.autoLogin = saveCredentials;
        this.loginSuccessful();
    }
    e.preventDefault();

    return this;
};

Module.Login.prototype.setFocus = function () {
    var formObjects = this.components.loginForm.addedObjects;
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

    Module.Navigation.superclass.constructor.call(this);

    this.components = {
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
    var c = this.components;
    this.add(c.search)
        .add(c.contacts)
        .add(c.rooms)
        .add(c.meetings.add($$.Time({ format: "[D]", interval: "every day" })))
        .add(c.alerts);

    return this;
};

Module.Navigation.prototype.addEvents = function () {
    var thisModule = this;
    var c = this.components;
    var p = this.properties;

    for (var component in c) {
        c[component].addEvent("click", function (event) {
            app.toggleNavigation(this.object.styleClass);
        });
    }

    this.addSignal("TOGGLE_NAVIGATION", function (signalObject) {
        var data = $$.object(signalObject, {});
        var isSelected = true;
        if (c.hasOwnProperty(data.info)) {
            if (data.info !== p.selectedNav) {
                if (c[p.selectedNav]) {
                    c[p.selectedNav].toggle("selected", false);
                }
                p.selectedNav = data.info;
            } else {
                p.selectedNav = "";
                isSelected = false;
            }
            c[data.info].toggle("selected", isSelected);
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

    Module.Results.superclass.constructor.call(this);

    this.components = {
        search          : $$.Basic({ element: "<section>", styleClass: "search" }),
        contacts        : $$.Basic({ element: "<section>", styleClass: "contacts" }),
        rooms           : $$.Basic({ element: "<section>", styleClass: "rooms" }),
        meetings        : $$.Basic({ element: "<section>", styleClass: "meetings" }),
        alerts          : $$.Basic({ element: "<section>", styleClass: "alerts" }),

        searchHeader    : $$.Header({ image: $$.images.searchDark,   text: "Search" }),
        contactsHeader  : $$.Header({ image: $$.images.contactsDark, text: "Contacts" }),
        roomsHeader     : $$.Header({ image: $$.images.roomsDark,    text: "Rooms" }),
        meetingsHeader  : $$.Header({ image: $$.images.meetingsDark, text: "Meetings" }),
        alertsHeader    : $$.Header({ image: $$.images.alertsDark,   text: "Alerts" }),

        searchResults   : $$.List(),
        contactsResults : $$.List(),
        roomsResults    : $$.List(),
        meetingsResults : $$.List(),
        alertsResults   : $$.List(),
    };

    this.properties = {
        selectedNav    : "",
        selectedResult : null
    };

    this.assemble().addEvents();
};

$$.extendClass(Module.Results, Module.Base);

Module.Results.prototype.assemble = function () {
    var c = this.components;
    this.add(c.search.add(c.searchHeader).add(c.searchResults))
        .add(c.contacts.add(c.contactsHeader).add(c.contactsResults))
        .add(c.rooms.add(c.roomsHeader).add(c.roomsResults))
        .add(c.meetings.add(c.meetingsHeader).add(c.meetingsResults))
        .add(c.alerts.add(c.alertsHeader).add(c.alertsResults));
    c.meetingsHeader.components.image.add($$.Time({ format: "[D]", interval: "every day" }));

    return this;
};

Module.Results.prototype.addEvents = function () {
    var thisModule = this;
    var c = this.components;
    var p = this.properties;

    this.addSignal("TOGGLE_NAVIGATION", function (signalObject) {
        var data = $$.object(signalObject, {});
        var isSelected = true;
        if (c.hasOwnProperty(data.info)) {
            if (data.info !== p.selectedNav) {
                if (p.selectedNav) {
                    c[p.selectedNav].toggle("selected", false);
                }
                p.selectedNav = data.info;
            } else {
                p.selectedNav = "";
                isSelected = false;
            }
            thisModule.toggle("selected", isSelected);
            c[data.info].toggle("selected", isSelected);
        }
    });

    this.addSignal("TOGGLE_RESULT", function (signalObject) {
        var data = $$.object(signalObject, {});
        var isSelected = true;
        if (data.origin.isView) {
            if (data.origin !== p.selectedResult) {
                if (p.selectedResult) {
                    p.selectedResult.toggle("selected", false);
                }
                p.selectedResult = data.origin;
            } else {
                p.selectedResult = null;
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
        this.components[rosterCategory + "sResults"].sort();
    }

    return this;
};

Module.Results.prototype.addRosterCard = function (modelObject, sortNeeded) {
    var thisModule  = this;
    var list        = this.components[modelObject.subtype + "sResults"];
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
//                    DETAILS MODULE
// ========================================================

Module.Details = function (moduleData, modelObject) {
    var data        = $$.object(moduleData, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.properties : model;
    this.ID         = "details-module-" + (model.ID || Date.now());
    this.subtype    = "details";
    this.altClass   = model.subtype || "";
    this.element    = $$.getElement(data.element || "<details-module>");
    this.styleClass = $$.string(data.styleClass, "");

    Module.Details.superclass.constructor.call(this);

    this.addModel(model).assemble().addEvents();
};

$$.extendClass(Module.Details, Module.Base);

Module.Details.prototype.assemble = function () {
    return this;
};

Module.Details.prototype.addEvents = function () {
    return this;
};
