var Log = {
    types: {

    },
    properties: {
        fileOutput     : false,
        consoleOutput  : true,
        debuggerOutput : false
    },
    output: function (output, style1, style2) {
        if (this.properties.fileOutput)     { $$.fileOutput(output); }
        if (this.properties.consoleOutput)  { console.log(output, style1, style2); }
        if (this.properties.dubuggerOutput) { $$.debuggerOutput(output); }
    },
    for: {
        archetype : {
            model     : true,
            module    : false,
            component : false
        },
        method: {
            model: {
                remove                    : false,
                updateProperty            : false,
                updateProperties          : false,
                addView                   : false,
                removeView                : false,
                updateViews               : false,
                removeAllViews            : false,
                addRelationship           : false,
                removeRelationship        : false,
                resetRelationshipCategory : false,
                resetAllRelationships     : false
            },
            component: {
                signal         : false,
                addSignal      : false,
                updateProperty : false
            },
            module: {
                signal         : false,
                addSignal      : false,
                updateProperty : false
            }
        }
    },
    write: function (method, object, outcome, arg1, arg2) {
        if (Log.for.archetype[object.archetype] || Log.for.method[object.archetype][method]) {
            arg1 = arg1 ? JSON.stringify(arg1) : "";
            arg2 = arg2 ? ", " + JSON.stringify(arg2) : "";
            var style1, style2;
            if (outcome === "OK") {
                outcome = "%cSUCCESS";
                style1  = "color: #AAA;";
                style2  = "";
            } else {
                var severity = "severe";
                outcome = "%cERROR: " + outcome + "%c";
                style1  = "color: #F80;";
                style2  = "color: #666;";
                if (outcome.charAt(outcome.length - 3) === "!") {
                    style1 = "color: #F00; font-weight: bold";
                }
            }
            var output =
                "\n" + outcome + " | " + object.subtype + "." + method + "(" + arg1 + arg2 + ")" +
                "\nOrigin: \"" + (object.ID || object.subtype) + "\"";
            Log.output(output, style1, style2);
        }
    }
}
