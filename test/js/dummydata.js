var dummydata = {
    contact:
    [{
        ID            : "Contact1",
        firstName     : "Scott",
        lastName      : "Van Der Sluys",
        avatar        : "./img/scott.svg",
        status        : "available",
        isInRoster    : true,
        jobTitle      : "Make things happen",
        emails        : { work : "scottvandersluys@gmail.com"},
        phones        : { home : "201-207-3695"},
    },
    {
        ID            : "Contact2",
        firstName     : "Peter",
        lastName      : "Griffin",
        avatar        : "",
        status        : "offline",
        isInRoster    : true,
        jobTitle      : "Being Awesome",
        emails        : { work : "pgriff@googlemail.com"},
        phones        : { home : ""},
        avatar        : "https://pbs.twimg.com/profile_images/743415048190705664/CSwzAFeE.jpg"
    },
    {
        ID            : "Contact3",
        firstName     : "Faceless",
        lastName      : "Person",
        avatar        : "",
        status        : "available",
        isInRoster    : true,
        jobTitle      : "",
        emails        : { work : ""},
        phones        : { home : ""},
        avatar        : ""
    },
    {
        ID            : "Contact4",
        firstName     : "Tony",
        lastName      : "Stark",
        avatar        : "",
        status        : "available",
        isInRoster    : true,
        jobTitle      : "Iron Man",
        emails        : { work : ""},
        phones        : { home : ""},
        avatar        : "http://vignette2.wikia.nocookie.net/marvelcentral/images/9/97/Tony-Stark.jpg/revision/latest?cb=20130429010603"
    },
    {
        ID            : "Contact5",
        firstName     : "John",
        lastName      : "Malkovich",
        avatar        : "",
        status        : "busy",
        isInRoster    : true,
        jobTitle      : "Malkovich, Malkovich",
        emails        : { work : ""},
        phones        : { home : ""},
        avatar        : "http://ecowallpapers.net/wp-content/uploads/4891_john_malkovich.jpg"
    },
    {
        ID            : "Contact6",
        firstName     : "Austin",
        lastName      : "Powers",
        avatar        : "",
        status        : "offline",
        isInRoster    : true,
        jobTitle      : "Internation Man of Mystery",
        emails        : { work : ""},
        phones        : { home : ""},
        avatar        : "http://cdn.playbuzz.com/cdn/6f967c71-542b-4183-8bbb-254ad4da076e/d3bcddef-73ea-43ce-ab0a-b1998b788357.jpg"
    }],
    room:
    [{
        ID            : "Room1",
        name          : "Awesome Room",
        avatar        : "http://imageonefranchise.com/wp-content/uploads/2016/01/green-office-furniture-classic.jpg",
    },
    {
        ID            : "Room2",
        name          : "Even More Awesome Room",
        showInitials  : false
    }],
    meeting:
    [{
        ID            : "Meeting1",
        name          : "Starting Meeting",
        organizer     : "Scott Van Der Sluys",
        startTime     : Date.now() + 20000,
        endTime       : Date.now() + 3600000
    },
    {
        ID            : "Meeting2",
        name          : "Ending Meeting",
        organizer     : "Scott Van Der Sluys",
        startTime     : Date.now() - 3580000,
        endTime       : Date.now() + 20000
    },
    {
        ID            : "Meeting3",
        name          : "Future Meeting",
        organizer     : "Scott Van Der Sluys",
        startTime     : Date.now() + 3600000,
        endTime       : Date.now() + 20000000
    }]
};

//var body = new Component.Basic(document.body);
//
//var cards = {
//    c1 : $$.Card($$.Contact(dummydata.Contact1)),
//    c2 : $$.Card($$.Contact(dummydata.Contact2)),
//    c3 : $$.Card($$.Contact(dummydata.Contact3)),
//    c4 : $$.Card($$.Contact(dummydata.Contact4)),
//    c5 : $$.Card($$.Contact(dummydata.Contact5)),
//    c6 : $$.Card($$.Contact(dummydata.Contact6))
//};
//
//var room1 = $$.Room(dummydata.room1),
//    contact1 = $$.Contact(dummydata.Contact1)
//
//var list = new Component.List();
//var body;

//function startApp() {
//    body = document.body;
//    list.addTo(body);
//    for (var i in cards) {
//        cards[i].addTo(list);
//    }
//    list.sort();
//}
//
//document.addEventListener("DOMContentLoaded", function(event) {
//    startApp();
//});
