var Module = {};

// ========================================================
//                       BASE MODULE
// ========================================================

Module.Base = function () {
    Module.Base.superclass.constructor.call(this);
    this.archetype      = "module";
    this.isModule       = true;
    this.element.module = this;
};

$$.extendClass(Module.Base, View.Base);


// ========================================================
//                        APP MODULE
// ========================================================

Module.App = function (moduleData) {
    var data          = $$.object(moduleData, {});
    this.ID           = data.ID || "app-module";
    this.subtype      = "app";
    this.element      = $$.getElement(data.element || "<app-module>");
    
    Module.App.superclass.constructor.call(this);

    this.components = {};

    this.top     = this.components.top     = $$.Basic({ element: "<app-top>" });
    this.middle  = this.components.middle  = $$.Basic({ element: "<app-middle>" });
    this.bottom  = this.components.bottom  = $$.Basic({ element: "<app-bottom>" });
    this.nav     = this.components.nav     = $$.Basic({ element: "<nav>" });
    this.main    = this.components.main    = $$.Basic({ element: "<main>" });
    
    this.assemble();
};

$$.extendClass(Module.App, Module.Base);

Module.App.prototype.assemble = function () {
    var c = this.components;
    this.add(c.top).add(c.middle.add(c.nav).add(c.main)).add(c.bottom);
};


// ========================================================
//                      LOGIN MODULE
// ========================================================

Module.Login = function (moduleData) {
    var data          = $$.object(moduleData, {});
    this.ID           = data.ID || "login-module-" + Date.now();
    this.subtype      = "login";
    this.element      = $$.getElement(data.element || "<login-module>");
    
    Module.Login.superclass.constructor.call(this);
    
    this.components = {
        loginMenu      : $$.Basic({ element: "<login-menu>" }),
        backgroundBlur : $$.Basic({ element: "<background-blur>" }),
        appLogo        : $$.Image({ element: "<app-logo>", image: "img/default_logo.svg" }),
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
        serverMin        : 1,
        serverMax        : 128,
        usernameMin      : 2,
        usernameMax      : 64,
        passwordMin      : 6,
        passwordMax      : 64,
    };

    this.assemble();
    this.addEvents();
    this.verifyInput();
    this.setFocus();
};

$$.extendClass(Module.Login, Module.Base);

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
};

Module.Login.prototype.addEvents = function () {
    var thisModule = this;
    var c = this.components;
    c.server.input.ondblclick    = function (e) { c.server.updateProperty("readonly", "").input.select(); }
    c.loginForm.element.onkeyup  = function (e) { thisModule.verifyInput(e); };
    c.loginForm.element.oninput  = function (e) { thisModule.verifyInput(e); };
    c.loginForm.element.onsubmit = function (e) { thisModule.submit(e); };
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
};

Module.Login.prototype.loginSuccessful = function () {
    var thisModule = this;
    function removeModule(e) {
        if (e.propertyName === "opacity") { session.loginSuccessful(); }
    }
    this.singleEvent("transitionend", removeModule).toggle("active", false);
};

Module.Login.prototype.loginFailed = function (reasonCode) {
    
};


// ========================================================
//                    FAVORITES MODULE
// ========================================================

Module.Favorites = function (moduleData) {
    var data          = $$.object(moduleData, {});
    this.ID           = data.ID || "favorites-module-" + Date.now();
    this.subtype      = "favorites";
    this.element      = $$.getElement(data.element || "<favorites-module>");
    this.altClass     = "contacts-selected";
    
    Module.Favorites.superclass.constructor.call(this);
    
    this.components = {
        header         : $$.Basic({ element: "<header>" }),
        contactsIcon   : $$.Icon({ image: "img/contacts.svg", text: "Contacts", styleClass: "contacts" }),
        roomsIcon      : $$.Icon({ image: "img/rooms.svg", text: "Rooms", styleClass: "rooms" }),
        meetingsIcon   : $$.Icon({ image: "img/meetings.svg", text: "Meetings", styleClass: "meetings" }),
        iconDate       : $$.Time({ format: "[D]", interval: "every day" }),
        contactsList   : $$.List({ styleClass: "contacts" }),
        roomsList      : $$.List({ styleClass: "rooms" }),
        meetingsList   : $$.List({ styleClass: "meetings" }),
        favorites      : $$.Basic({ element: "<favorites>" }),
        lists          : $$.Basic({ element: "<favorites-lists>" }),
        backgroundBlur : $$.Basic({ element: "<background-blur>" }),
    };
    
    this.properties = {
        selectedCards : []
    };

    this.assemble().addEvents();
};

$$.extendClass(Module.Favorites, Module.Base);

Module.Favorites.prototype.assemble = function () {
    var c = this.components;
    this.add(c.favorites
            .add(c.header
                .add(c.contactsIcon)
                .add(c.roomsIcon)
                .add(c.meetingsIcon))
            .add(c.lists
                .add(c.contactsList)
                .add(c.roomsList)
                .add(c.meetingsList)));
//        .add(c.backgroundBlur);
    c.meetingsIcon.components.image.add(c.iconDate);

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

Module.Favorites.prototype.addEvents = function () {
    var thisModule = this;
    var c = this.components;
    var icons = {contacts: c.contactsIcon, rooms: c.roomsIcon, meetings: c.meetingsIcon};
    var lists = {contacts: c.contactsList, rooms: c.roomsList, meetings: c.meetingsList};
    for (var icon in icons) {
        icons[icon].addEvent("click", function (e) {
            thisModule.altClass = this.component.styleClass + "-selected";
            thisModule.updateStyleClass();
        });
    }
    this.addSignal("CLICKED", function (event, origin) {
        var cards = thisModule.properties.selectedCards;
        var i = 0, total = cards.length;
        for (i; i < total; i++) {
            cards[i].toggle("selected", false);
        }
        thisModule.properties.selectedCards = [];
        origin.toggle("selected", true);
        thisModule.properties.selectedCards.push(origin);
    });

    return this;
};


// ========================================================
//                      SEARCH MODULE
// ========================================================

Module.Search = function (moduleData) {
    var data          = $$.object(moduleData, {});
    this.ID           = data.ID || "search-module-" + Date.now();
    this.subtype      = "search";
    this.element      = $$.getElement(data.element || "<search-module>");
    
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
        contactsIcon      : $$.Icon({ image: "img/contacts.svg", text: "Contacts", styleClass: "contacts" }),
        contactsList      : $$.List({ styleClass: "contacts" }),

        roomsResults      : $$.Basic({ element: "<rooms-results>", styleClass: "results-category" }),
        roomsIcon         : $$.Icon({ image: "img/rooms.svg", text: "Rooms", styleClass: "rooms" }),
        roomsList         : $$.List({ styleClass: "rooms" }),

        meetingsResults   : $$.Basic({ element: "<meetings-results>", styleClass: "results-category" }),
        meetingsIcon      : $$.Icon({ image: "img/meetings.svg", text: "Meetings", styleClass: "meetings" }),
        iconDate          : $$.Time({ format: "[D]", interval: "every day" }),
        meetingsList      : $$.List({ styleClass: "meetings" }),

        backgroundBlur : $$.Basic({ element: "<background-blur>" }),
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
