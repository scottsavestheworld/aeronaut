// ========================================================
//                      SESSION OBJECT
// ========================================================

var Session = function (dataObject) {
    var data        = $$.object(dataObject, {});
    this.archetype  = "session";
    this.isSession  = true;
    this.ID         = $$.string(data.ID, Date.now());
    this.user;   // = new Neo.User();

    this.models = {
        contact      : {},
        room         : {},
        conversation : {},
        topic        : {},
        meeting      : {},
        message      : {},
        camera       : {},
        microphone   : {},
        shareDesktop : {},
        shareWindow  : {},
        shareRemote  : {}
    };

    this.modules = {
        app         : $$.App(),
        login       : $$.Login(),
        favorites   : $$.Favorites(),
        search      : $$.Search(),
    };

    this.components = {};

    this.properties = {
        isXMPP      : $$.boolean(data.isXMPP, false),
        isGuestMode : $$.boolean(data.isGuestMode, false),
        activeRoom  : null
    };
};

Session.prototype.registerCallback = function (callbackName) {
    
};

Session.prototype.loginSuccessful = function () {
    var modules = this.modules;
    modules.login.remove();
    modules.app.addTo(document.body);
    modules.app.nav.add(modules.favorites);
    modules.app.nav.toggle("active", true, 600);
    modules.app.main.toggle("active", true, 100);
    modules.favorites.updateRoster(dummydata);

    API.onLoginSuccessful();
};

var session = $$.Session();

document.addEventListener("DOMContentLoaded", function(event) {
    var body = $$.Basic({ element: document.body });
    var fade = $$.Basic({ element: "<app-fade>" });
    var modules = session.modules;
    body.add(fade);
    setTimeout(function () { body.remove(fade); }, 3000);
    body.add(modules.login);
    modules.login.toggle("active", true, 1000);
});


//    app : {
//        position      : { top: 0, left: 0 },
//        size          : { width: 800, height: 600 },
//        theme         : "default",
//        portal        : localStorage.portal    || "",
//        userName      : localStorage.userName  || "",
//        password      : localStorage.password  || "",
//        saveLogin     : localStorage.saveLogin || false
//    },