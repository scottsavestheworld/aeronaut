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
        devices   : $$.Devices(),
        login     : $$.Login(),
        favorites : $$.Favorites(),
        details   : $$.Details(),
        search    : $$.Search()
    };

    this.components = {
        top      : $$.Basic({ element: "<top>" }),
        middle   : $$.Basic({ element: "<middle>" }),
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
        .add(c.middle)
        .add(c.bottom);
};

Module.App.prototype.registerCallback = function (callbackName) {
};

Module.App.prototype.start = function () {
    var loginModule = this.modules.login;

    this.add(this.components.fade);
    this.modules.devices.addTo(this.components.top, 0).toggle("active", true, 100);
    this.modules.login.addTo(this.components.middle).toggle("active", true, 100);
    this.remove($$.getElement("#initialize-app"));

    API.onAppStart();
}

Module.App.prototype.loginSuccessful = function () {
    var c = this.components;
    var m = this.modules;

    m.login.remove();
    c.fade.remove();

    m.favorites.addTo(c.middle).toggle("active", true).selectTab("contacts");
    m.details.addTo(c.middle).toggle("active", true);
    c.middle.toggle("active", true);

    m.favorites.updateRoster(dummydata);

    API.onLoginSuccessful();
};


// ========================================================
//                     DEVICES MODULE
// ========================================================

Module.Devices = function (moduleData) {
    var data     = $$.object(moduleData, {});
    this.ID      = data.ID || "devices-module";
    this.subtype = "devices";
    this.element = $$.getElement(data.element || "<devices-module>");

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
//                     DETAILS MODULE
// ========================================================

Module.Details = function (moduleData) {
    var data     = $$.object(moduleData, {});
    this.ID      = data.ID || "details-module";
    this.subtype = "details";
    this.element = $$.getElement(data.element || "<details-module>");

    Module.Details.superclass.constructor.call(this);

    this.components = {
    }

    this.assemble().this.addEvents();
}

$$.extendClass(Module.Details, Module.Base);

Module.Details.prototype.assemble = function () {
    return this;
};

Module.Details.prototype.addEvents = function () {
    return this;
};


// ========================================================
//                      LOGIN MODULE
// ========================================================

Module.Login = function (moduleData) {
    var data     = $$.object(moduleData, {});
    this.ID      = data.ID || "login-module";
    this.subtype = "login";
    this.element = $$.getElement(data.element || "<login-module>");

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
    var formObjects = this.components.loginForm.addedComponents;
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
//                    FAVORITES MODULE
// ========================================================

Module.Favorites = function (moduleData) {
    var data      = $$.object(moduleData, {});
    this.ID       = data.ID || "favorites-module";
    this.subtype  = "favorites";
    this.element  = $$.getElement(data.element || "<favorites-module>");

    Module.Favorites.superclass.constructor.call(this);

    this.components = {
        nav            : $$.Basic({ element: "<nav>" }),
        contactsButton : $$.Image({ image: $$.images.contactsLight, styleClass: "contacts" }),
        roomsButton    : $$.Image({ image: $$.images.roomsLight, styleClass: "rooms" }),
        meetingsButton : $$.Image({ image: $$.images.meetingsLight, styleClass: "meetings" }),
        buttonDate     : $$.Time({ format: "[D]", interval: "every day" }),
        menu           : $$.Basic({ element: "<menu>" }),
        menuHeader     : $$.Basic({ element: "<header>" }),
        headerIcon     : $$.Icon({ image: $$.images.contactsDark, styleClass: "contacts", text: "Contacts" }),
        iconDate       : $$.Time({ format: "[D]", interval: "every day" }),
        contactsList   : $$.List({ styleClass: "contacts" }),
        roomsList      : $$.List({ styleClass: "rooms" }),
        meetingsList   : $$.List({ styleClass: "meetings" })
    };

    this.properties = {
        selectedTab   : "",
        selectedCards : []
    };

    this.assemble().addEvents();
};

$$.extendClass(Module.Favorites, Module.Base);

Module.Favorites.prototype.assemble = function () {
    var c = this.components;
    this.add(c.nav
            .add(c.contactsButton)
            .add(c.roomsButton)
            .add(c.meetingsButton.add(c.buttonDate)))
        .add(c.menu
            .add(c.menuHeader.add(c.headerIcon))
            .add(c.contactsList)
            .add(c.roomsList)
            .add(c.meetingsList));
    c.headerIcon.components.image.add(c.iconDate);

    return this;
};

Module.Favorites.prototype.addEvents = function () {
    var thisModule = this;
    var c = this.components;
    var p = this.properties;
    var buttons = { contacts: c.contactsButton, rooms: c.roomsButton, meetings: c.meetingsButton };

    for (var tabName in buttons) {
        buttons[tabName].addEvent("click", function (e) {
           thisModule.selectTab(this.object.styleClass);
        });
    }

    this.addSignal("CLICKED", function (event, origin) {
        var cards = p.selectedCards;
        var wasSelected = false;

        var i = 0, total = cards.length;
        for (i; i < total; i++) {
            if (cards[i] === origin) {
                wasSelected = true;
            }
            cards[i].toggle("selected", false);
        }

        p.selectedCards = [];

        if (!wasSelected) {
            origin.toggle("selected", true);
            p.selectedCards.push(origin);
        }
    });

    return this;
};

Module.Favorites.prototype.selectTab = function (tabName) {
    var c = this.components;
    var p = this.properties;

    if (p.selectedTab) {
        c[p.selectedTab + "List"].toggle("selected", false);
        c[p.selectedTab + "Button"].toggle("selected", false);
    }

    if (p.selectedTab !== tabName) {
        p.selectedTab = tabName;
        c[tabName + "List"].toggle("selected", true);
        c[tabName + "Button"].toggle("selected", true);
        c.headerIcon.updateProperties({text: $$.capitalize(tabName), image: $$.images[tabName + "Dark"]});

        if (tabName === "meetings") {
            c.iconDate.add();
        } else {
            c.iconDate.remove();
        }

        this.toggle("selected" , true);
    } else {
        p.selectedTab = "";
        this.toggle("selected" , false);
    }

    return this;
};

Module.Favorites.prototype.updateRoster = function (rosterObject) {
    var roster = $$.object(rosterObject, {});
    var rosterCategory;
    for (rosterCategory in roster) {
        var i = 0, total = roster[rosterCategory].length;
        for (i; i < total; i++) {
            this.addRosterCard($$[$$.capitalize(rosterCategory)](roster[rosterCategory][i]));
        }
        this.components[rosterCategory + "sList"].sort();
    }

    return this;
};

Module.Favorites.prototype.addRosterCard = function (modelObject, sortNeeded) {
    var thisModule  = this;
    var list        = this.components[modelObject.subtype + "sList"];
    var listItems   = list.addedComponents;
    var listHasCard = false;

    var i = 0, total = listItems.length;
    for (i; i < total; i++) {
        if (listItems[i].model === modelObject) {
            listHasCard = true;
        }
    }

    if (!listHasCard) {
        var card = $$.Card(modelObject);
        card.addEvent("click", function (e) { card.signal(e, card, "CLICKED", thisModule); });
        list.add(card);

        if (sortNeeded) {
            list.sort();
        }
    }

    return this;
};


// ========================================================
//                      SEARCH MODULE
// ========================================================

Module.Search = function (moduleData) {
    var data     = $$.object(moduleData, {});
    this.ID      = data.ID || "search-module";
    this.subtype = "search";
    this.element = $$.getElement(data.element || "<search-module>");

    Module.Search.superclass.constructor.call(this);

    this.components = {
        searchBox         : $$.Input({ element: "<global-search>" }),

        searchResults     : $$.Basic({ element: "<search-results>" }),
        resultsHeader     : $$.Basic({ element: "<results-header>" }),
        resultsNumber     : $$.Text({ element: "<results-number>" }),
        resultsText       : $$.Text({ element: "<results-text>", text: " results match " }),
        searchedString    : $$.Text({ element: "<searched-string>" }),

        resultsCategories : $$.Basic({ element: "<results-categories>" }),

        contactsResults   : $$.Basic({ element: "<contacts-results>", styleClass: "results-category" }),
        contactsIcon      : $$.Icon({ image: $$.images.contactsDark, text: "Contacts", styleClass: "contacts" }),
        contactsList      : $$.List({ styleClass: "contacts" }),

        roomsResults      : $$.Basic({ element: "<rooms-results>", styleClass: "results-category" }),
        roomsIcon         : $$.Icon({ image: $$.images.roomsDark, text: "Rooms", styleClass: "rooms" }),
        roomsList         : $$.List({ styleClass: "rooms" }),

        meetingsResults   : $$.Basic({ element: "<meetings-results>", styleClass: "results-category" }),
        meetingsIcon      : $$.Icon({ image: $$.images.meetingsDark, text: "Meetings", styleClass: "meetings" }),
        iconDate          : $$.Time({ format: "[D]", interval: "every day" }),
        meetingsList      : $$.List({ styleClass: "meetings" }),

        backgroundBlur    : $$.Image({ element: "<background-blur>", image: $$.images.background }),
    };

    this.properties = {
        selectedCards : []
    };

    this.assemble();
//    this.addEvents();
};

$$.extendClass(Module.Search, Module.Base);

Module.Search.prototype.assemble = function () {
    var c = this.components;
    this.add(c.searchBox)
        .add(c.searchResults
            .add(c.resultsHeader
                .add(c.resultsNumber)
                .add(c.resultsText)
                .add(c.searchedString))
            .add(c.resultsCategories
                .add(c.contactsResults
                    .add(c.contactsIcon)
                    .add(c.contactsList))
                .add(c.roomsResults
                    .add(c.roomsIcon)
                    .add(c.roomsList))
                .add(c.meetingsResults
                    .add(c.meetingsIcon)
                    .add(c.meetingsList))));
//        .add(c.backgroundBlur);

    c.meetingsIcon.components.image.add(c.iconDate);
};

Module.Search.prototype.update = function (modelObject) {
    var thisModule = this;
    var card = $$.Card(modelObject);
    card.addEvent("click", function (e) { card.signal(e, card, "CLICKED", thisModule); });
    this.components[modelObject.subtype + "sList"].add(card);
};


// ========================================================
//                    DETAILS MODULE
// ========================================================

Module.Details = function (modelObject, dataObject) {
    var data        = $$.object(dataObject, {});
    var model       = $$.object(modelObject, {});
    var info        = model.isModel ? model.properties : model;
    this.ID         = "details-module-" + (model.ID || Date.now());
    this.subtype    = "details";
    this.altClass   = model.subtype || "";
    this.element    = $$.getElement(data.element || "<details-module>");
    this.styleClass = $$.string(data.styleClass, "");

    Module.Details.superclass.constructor.call(this);

    if (model.subtype) {
        this[model.subtype + "Components"](info);
    }

    this.addModel(model);
};

$$.extendClass(Module.Details, Module.Base);
