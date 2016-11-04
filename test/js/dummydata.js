var dummydata = {
    contact: 
    [{
        ID            : "Contact1",
        firstName     : "Scott",
        lastName      : "Van Der Sluys",
        image         : "test/img/avatar.jpg",
        status        : "available",
        rosterState   : "not-in-contacts",
        jobTitle      : "Codes Stuff",
        emails        : { work : "svandersluys@vidyo.com"},
        phones        : { home : "201-207-3695"}
    },
    {
        ID            : "Contact2",
        firstName     : "Bala",
        lastName      : "Pitchandi",
        image         : "",
        status        : "offline",
        rosterState   : "not-in-contacts",
        jobTitle      : "The Boss",
        emails        : { work : "bala@vidyo.com"},
        phones        : { home : ""}
    },
    {
        ID            : "Contact3",
        firstName     : "Marek",
        lastName      : "Fiuk",
        image         : "",
        status        : "available",
        rosterState   : "not-in-contacts",
        jobTitle      : "Codes Stuff",
        emails        : { work : "marek@vidyo.com"},
        phones        : { home : ""}
    },
    {
        ID            : "Contact4",
        firstName     : "Jay",
        lastName      : "Sylvester",
        image         : "",
        status        : "available",
        rosterState   : "not-in-contacts",
        jobTitle      : "Codes Stuff",
        emails        : { work : "marek@vidyo.com"},
        phones        : { home : ""}
    },
    {
        ID            : "Contact5",
        firstName     : "Pratyush",
        lastName      : "Tewari",
        image         : "",
        status        : "busy",
        rosterState   : "not-in-contacts",
        jobTitle      : "Codes Stuff",
        emails        : { work : "marek@vidyo.com"},
        phones        : { home : ""}
    },
    {
        ID            : "Contact6",
        firstName     : "Pradnya",
        lastName      : "Wakchaure",
        image         : "",
        status        : "offline",
        rosterState   : "not-in-contacts",
        jobTitle      : "Codes Stuff",
        emails        : { work : "marek@vidyo.com"},
        phones        : { home : ""}
    }],
    room: 
    [{
        ID            : "Room1",
        name          : "Awesome Room",
        image         : "http://imageonefranchise.com/wp-content/uploads/2016/01/green-office-furniture-classic.jpg",
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
