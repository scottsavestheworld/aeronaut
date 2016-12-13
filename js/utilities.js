var $$ = {};

// ========================================================
//                   SUBTYPE CONSTRUCTORS
// ========================================================

//--------------------------------------------------------- Models

$$.Contact = function (dataObject, updateModel) {
    return $$.getModel(dataObject, updateModel, "Contact");
};
$$.Room = function (dataObject, updateModel) {
    return $$.getModel(dataObject, updateModel, "Room");
};
$$.Message = function (dataObject, updateModel) {
    return $$.getModel(dataObject, updateModel, "Message");
};

//--------------------------------------------------------- Modules

$$.App = function (moduleData) {
    return new Module.App(moduleData);
};
$$.Devices = function (moduleData) {
    return new Module.Devices(moduleData);
};
$$.Login = function (moduleData) {
    return new Module.Login(moduleData);
};
$$.Navigation = function (moduleData) {
    return new Module.Navigation(moduleData);
};
$$.Results = function (moduleData) {
    return new Module.Results(moduleData);
};
$$.Specifics = function (moduleData) {
    return new Module.Specifics(moduleData);
};
//$$.Search = function (moduleData) {
//    return new Module.Search(moduleData);
//};

//--------------------------------------------------------- Components

$$.Basic = function (dataObject) {
    return new Component.Basic(dataObject);
};
$$.List = function (dataObject) {
    return new Component.List(dataObject);
};
$$.Image = function (dataObject) {
     return new Component.Image(dataObject);
};
$$.Text = function (dataObject) {
     return new Component.Text(dataObject);
};
$$.Icon = function (dataObject) {
    return new Component.Icon(dataObject);
};
$$.Input = function (dataObject) {
    return new Component.Input(dataObject);
};
$$.Time = function (dataObject) {
    return new Component.Time(dataObject);
};
$$.Name = function (modelObject, dataObject) {
    return new Component.Name(modelObject, dataObject);
};
$$.Avatar = function (modelObject, dataObject) {
    return new Component.Avatar(modelObject, dataObject);
};
$$.Status = function (modelObject, dataObject) {
    return new Component.Status(modelObject, dataObject);
};
$$.Card = function (modelObject, dataObject) {
    return new Component.Card(modelObject, dataObject);
};


// ========================================================
//                    STRING UTILITIES
// ========================================================

//--------------------------------------------------------- Capitalize

$$.capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

//--------------------------------------------------------- Get Initial

$$.getInitial = function (string) {
    return string.charAt(0).toUpperCase();
};

//--------------------------------------------------------- Get Initials

$$.getInitials = function (stringArray) {
    stringArray = stringArray || [];
    var initials = "";
    var totalStrings = stringArray.length;
    var i = 0;

    for (i; i < totalStrings; i++) {
        initials += $$.getInitial(stringArray[i]);
    }
    return initials;
};


// ========================================================
//                   TYPEOF VERIFICATION
// ========================================================

//--------------------------------------------------------- Variable Type Check

$$.array = function (value, newValue) {
    return Array.isArray(value) ? value : newValue;
};

$$.boolean = function (value, newValue) {
    return typeof value == "boolean" ? value : newValue;
};

$$.number = function (value, newValue) {
    return typeof value == "number" && !isNaN(value) ? value : newValue;
};

$$.object = function (value, newValue) {
    return typeof value == "object" && value != null ? value : newValue;
};

$$.string = function (value, newValue) {
    return typeof value == "string" ? value : newValue;
};

$$.view = function (value, newValue) {
    return ($$.object(value, false) && value.isView) ? value : newValue;
}

$$.component = function (value, newValue) {
    return ($$.object(value, false) && value.isComponent) ? value : newValue;
}

$$.module = function (value, newValue) {
    return ($$.object(value, false) && value.isModule) ? value : newValue;
}

$$.model = function (value, newValue) {
    return ($$.object(value, false) && value.isModel) ? value : newValue;
}

// ========================================================
//                   ARCHETYPE UTILITIES
// ========================================================

//--------------------------------------------------------- Extend Class

$$.extendClass = function (newClass, baseClass) {
    var BaseMethods = function () {};

    BaseMethods.prototype = baseClass.prototype;
    newClass.prototype = new BaseMethods();
    newClass.prototype.constructor = newClass;
    newClass.superclass = baseClass.prototype;
};

//--------------------------------------------------------- Get Model

$$.getModel = function (dataObject, updateModel, modelType) {
    var data = $$.object(dataObject, {});
    if (data.ID) {
        var modelObject = app.models[modelType.toLowerCase()][data.ID];
        if (modelObject) {
            if (updateModel) {
                modelObject.updateProps(data);
            }
            return modelObject;
        } else {
            return new Model[modelType](data);
        }
    }
};

//--------------------------------------------------------- Get Archetype

$$.getArchetype = function (object) {
    if (object.hasOwnProperty("archetype")) {
        return object.archetype;
    } else {
        // error log not a valid object
        return null;
    }
};

//--------------------------------------------------------- Get Subtype

$$.getSubtype = function (object) {
    if (object.hasOwnProperty("subtype")) {
        return object.subtype;
    } else {
        // error log not a valid object
        return null;
    }
};

//--------------------------------------------------------- Get/Create Element

$$.getElement = function (stringOrElement) {
    if (stringOrElement instanceof HTMLElement) {
        return stringOrElement;
    } else {
        var string       = $$.string(stringOrElement, "");
        var element      = null;
        var elementClass = "";
        var elementID    = "";
        var elementTag   = string;

        switch (string.charAt(0)) {
            case "#":
                elementID  = string.substr(1);
                elementTag = "<div>"
                element    = document.getElementById(elementID);
                break;
            case ".":
                elementClass = string.substr(1);
                elementTag   = "<div>";
                element      = document.getElementsByClassName(elementClass)[0];
                break;
            case "@":
                element = app.modules[string.substr(1)].element;
                break;
            default:
                if (string === "<body>") {
                    element = document.body;
                } else {
                    element = document.getElementsByTagName(string)[0];
                }
                break;
        }
        if (!element) {
            try {
                element = document.createElement(elementTag.replace(/<|>/g,""));
            } catch (error) {
                element = document.createElement("div");
            }
            if (elementID) {
                element.id = elementID;
            }
            if (elementClass) {
                element.className = elementClass
            }
        }
        return (element);
    }
};


// ========================================================
//                      TIME UTILITIES
// ========================================================

//--------------------------------------------------------- Get Interval

$$.getInterval = function (intervalString) {
    var timeout  = 0;
    var interval = 0;

    if (intervalString === "every day" || intervalString === "every hour" || intervalString === "every minute") {
        var now = $$.formatTime("[H],[i],[s]").split(",").map(Number);
        switch (intervalString) {
            case "every day":
                timeout  = 86400 - ((now[0] * 3600) + (now[1] * 60) + now[2]);
                interval = 86400;
                break;
            case "every hour":
                timeout  = 3600 - ((now[1] * 60) + now[2]);
                interval = 3600;
                break;
            case "every minute":
                timeout  = 60 - now[2];
                interval = 60;
                break;
            default:
        };
    }

    if (interval > 0) {
        return { "timeout" : timeout, "interval" : interval };
    } else {
        return null;
    }
};

//--------------------------------------------------------- Format Time

$$.formatTime = function (format, timestamp) {
    format = $$.string(format, "");
    var smartTime = format.indexOf("[ST]") > -1 ? true : false;
    var smartDate = format.indexOf("[SD]") > -1 ? true : false;
    format.replace(/\[ST\]/g, "").replace(/\[SD\]/g, "");

    format        = Dictionary.timeFormats[format] || format;
    timestamp     = $$.number(timestamp, Date.now());

    function pad0(number) { return number < 10 ? "0" + number : number; }

    var n       = new Date(Date.now());
    var t       = new Date(timestamp);
    var f        = {};
        f.D        = t.getDate();
        f.DD    = pad0(f.D);
        f.DDDD    = Dictionary.timeStrings.days[t.getDay()];
        f.DDD    = f.DDDD.substring(0, 3);
        f.M        = t.getMonth() + 1;
        f.MM    = pad0(f.M);
        f.MMMM    = Dictionary.timeStrings.months[t.getMonth()];
        f.MMM   = f.MMMM.substring(0, 3);
        f.YYYY    = t.getFullYear();
        f.YY    = f.YYYY.toString().substr(2);
        f.H        = t.getHours();
        f.HH    = pad0(f.H);
        f.h        = f.H > 12 ? f.H - 12 : f.H == 0 ? 12 : f.H;
        f.hh    = pad0(f.h);
        f.m     = t.getMinutes();
        f.mm    = pad0(f.m);
        f.s     = t.getSeconds();
        f.ss    = pad0(f.s);
        f.pm    = f.H < 12 ? Dictionary.timeStrings.am : Dictionary.timeStrings.pm;

    var today = parseInt(n.getFullYear() + "" + pad0(n.getMonth() + 1) + "" + pad0(n.getDate()));
    timestamp = parseInt(f.YYYY + "" + f.MM + "" + f.DD);

    if (format == "[date or time]") {
        if (timestamp == today) { format = Dictionary.timeFormats["[time]"]; }
        else { format = Dictionary.timeFormats["[date]"]; }
    }
    if (smartTime) {
        if (timestamp == today) {
            format = Dictionary.timeStrings.today;
        }
        else if (timestamp == today + 1) {
            format = Dictionary.timeStrings.tomorrow;
        }
        else if (timestamp == today - 1) {
            format = Dictionary.timeStrings.yesterday;
        }
        else if (n.getFullYear() == f.YYYY) {
            switch (format) {
                case Dictionary.timeFormats["[date]"]:
                    format = Dictionary.timeFormats["[date this year]"];
                    break;
                case Dictionary.timeFormats["[full date]"]:
                    format = Dictionary.timeFormats["[full date this year]"];
            }
        }
    }

    for (var i in f) {
        var regex = new RegExp("\\[" + i + "\\]", "g");
        format = format.replace(regex, f[i]);
    }
    return (format);
};

//--------------------------------------------------------- Format Timer

$$.formatTimer = function (timestamp, format) {
    format = $$.string(format, "[d]:[h]:[m]:[s]");
    timestamp       = Math.round(timestamp / 1000);
    var clearEmpty  = true;
    var trimZero    = true;

    var timer = {};
        timer.d = Math.floor((timestamp % 31536000) / 86400);
        timer.h = Math.floor(((timestamp % 31536000) % 86400) / 3600);
        timer.m = Math.floor((((timestamp % 31536000) % 86400) % 3600) / 60);
        timer.s = (((timestamp % 31536000) % 86400) % 3600) % 60;

    for (var i in timer) {
        if (i == "d" && format.indexOf("[h]") < 0 && format.indexOf("[d]") > -1) {
            timer[i] ++;
        }
        else if (i == "h" && format.indexOf("[m]") < 0 && format.indexOf("[h]") > -1) {
            timer[i] ++ ;
        }
        else if (i == "m" && format.indexOf("[s]") < 0 && format.indexOf("[m]") > -1) {
            timer[i] ++;
        }

        var regex = new RegExp("\\[" + i + "\\]", "g");

        if (clearEmpty && (timer[i] != 0 || i == "m")) {
            format = format.substring(format.indexOf("[" + i + "]"));
            clearEmpty = false;
        }
        else if (trimZero || trimZero && i == "m") {
            trimZero = false;
        }
        else if (timer[i] < 10) {
            timer[i] = "0" + timer[i];
        }
        format = format.replace(regex, timer[i])
    }

    return (format)
};

// ========================================================
//                      TIME UTILITIES
// ========================================================

$$.getKeyCode = function (keyName) {
    var keys = {
        backspace  : [8],
        tab        : [9],
        enter      : [13],
        shift      : [16],
        ctrl       : [17],
        alt        : [18],
        pause      : [19],
        capslock   : [20],
        escape     : [27],
        spacebar   : [32],
        pageup     : [33],
        pagedown   : [34],
        end        : [35],
        home       : [36],
        left       : [37],
        up         : [38],
        right      : [39],
        down       : [40],
        insert     : [45],
        delete     : [46],
        0          : [48, 96],
        1          : [49, 97],
        2          : [50, 98],
        3          : [51, 99],
        4          : [52, 100],
        5          : [53, 101],
        6          : [54, 102],
        7          : [55, 103],
        8          : [56, 104],
        9          : [57, 105],
        a          : [65],
        b          : [66],
        c          : [67],
        d          : [68],
        e          : [69],
        f          : [70],
        g          : [71],
        h          : [72],
        i          : [73],
        j          : [74],
        k          : [75],
        l          : [76],
        m          : [77],
        n          : [78],
        o          : [79],
        p          : [80],
        q          : [81],
        r          : [82],
        s          : [83],
        t          : [84],
        u          : [85],
        v          : [86],
        w          : [87],
        x          : [88],
        y          : [89],
        z          : [90],
        window     : [91, 92],
        command    : [91, 92],
        select     : [93],
        multiply   : [106],
        add        : [107],
        subtract   : [108],
        decimal    : [110],
        divide     : [111],
        f1         : [112],
        f2         : [113],
        f3         : [114],
        f4         : [115],
        f5         : [116],
        f6         : [117],
        f7         : [118],
        f8         : [119],
        f9         : [120],
        f10        : [121],
        f11        : [122],
        f12        : [123],
        numlock    : [144],
        scrolllock : [145],
        ";"        : [186],
        "="        : [187],
        ","        : [188],
        "-"        : [189, 108],
        "."        : [190, 110],
        "/"        : [191, 111],
        "`"        : [192],
        "["        : [219],
        "]"        : [221],
        "'"        : [222]
    };
    return keys[keyName];
};
