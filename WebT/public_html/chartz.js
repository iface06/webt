//http://www.williammalone.com/articles/html5-canvas-javascript-bar-graph/
WEBT = {}
WEBT.namespace = function(ns) {
    var parts = ns.split("."),
            parent = WEBT,
            i;

    if (parts[0] === "WEBT") {
        parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i++) {
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {}
        }
        parent = parent[parts[i]];
    }
    return parent;
};

WEBT.Bar = function(name, value){
    this.name = name;
    this.value = value;
};

WEBT.chartzCreator = (function() {
    var numberOfColumns = 1;
    window.onload = function() {
        var canvasContext = document.getElementById("barChart").getContext("2d");
        canvasContext.canvas.width = 300;
        canvasContext.canvas.height = 200;
        canvasContext.fillStyle = 'grey';
        canvasContext.fillRect('0', '0', '250', '150');
    };

    var addInputField = function addInputField() {

        var div = createTag('div');
        div.className = 'bar-data';
        div.appendChild(createLabel(numberOfColumns + ": "));
        div.appendChild(createTextInputField('barName' + numberOfColumns));
        div.appendChild(createNumberInputField('barValue' + numberOfColumns));

        document.getElementById('inputFields').appendChild(div);
        numberOfColumns++;
    };

    var createLabel = function(text) {
        var label = document.createElement('label');
        label.innerHTML = text;
        return label;
    };

    var createTextInputField = function(name) {
        var value = createTag('input');
        value.type = "text";
        value.name = name;
        value.className = 'bar-name';

        return value;
    };

    var createNumberInputField = function(name) {
        var number = createTag('input');
        number.type = "number";
        number.name = name;
        number.className = 'bar-value';

        return number;
    };

    var readBarData = function() {
        var barData = new Array();
        var divs = document.getElementsByClassName('bar-data');
        for(var i = 0; i < divs.length; i++) {
            var barDiv = divs[i];
            var barValue = barDiv.getElementsByClassName('bar-value')[0].value;
            var barName = barDiv.getElementsByClassName('bar-name')[0].value;
            var bar = new WEBT.Bar(barName, barValue);
            barData.push(bar);
        }
    };

    var createTag = function(tagName) {
        return document.createElement(tagName);
    };

    function getElementsByClass(rows, className) {
        var findings = new Array();
        var y = 0;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].getAttribute('className')
                    && rows[i].getAttribute('className').indexOf(className) > -1) {
                findings[y++] = rows[i];
            }
        }
        return findings;
    }
    
    return {
        addInputField: addInputField,
        readBarData: readBarData
    };
}());

