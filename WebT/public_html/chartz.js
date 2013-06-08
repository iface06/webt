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

WEBT.Bars = function(){
    this.bars = new Array();
    
    this.calculateMaxBarValue = function(){
        var max = 0;
        for(var i = 0; i < this.bars. length; i++){
			var barValue = Number(this.bars[i].value);
            if(barValue > max) {
                max = barValue;
            }
        }
        return max;
    };
    
    this.put = function(bar){
        this.bars.push(bar);
    };
	
	this.get = function(i){
		return this.bars[i];
	}
    
    this.getNumberOfBars = function(){
        return this.bars.length;
    };
};

WEBT.BarChart = function(bars, context){
	this.width = context.canvas.width;
	this.height = context.canvas.height;
	this.paddingArroundCanvas = 5;
	this.spaceBetweenBars = 10;
	this.barColors = ["red", "green"];
	var canvasContext = context;
	var bars = bars;
	var xLabelHeight = 25;
	var yLabelHeight = 25;
	var reservedHeightPerBar = this.height - this.paddingArroundCanvas;
	var reservedWidthPerBar = (this.width / bars.getNumberOfBars());
	var ratio = 0;
	var maxBarValue = 0;
	
	
	this.draw = function(){
		maxBarValue = bars.calculateMaxBarValue();
		for(var i = 0; i < bars.getNumberOfBars(); i++){
			this.drawBar(i);
			this.drawXlabel(i);
			
		}
	};

	this.drawBar = function(i){
		var bar = bars.get(i);
		var ratio = bar.value / maxBarValue;
		var barHeight = (reservedHeightPerBar - yLabelHeight) * ratio;
		var space = this.spaceBetweenBars;
		canvasContext.fillStyle = this.barColors[i % this.barColors.length];
		var upperLeftCornerX = reservedWidthPerBar * i  + this.paddingArroundCanvas;
		var upperLeftCornerY = this.height - barHeight;
		canvasContext.fillRect(upperLeftCornerX, upperLeftCornerY, reservedWidthPerBar - space, barHeight - xLabelHeight); 
	};
	
	this.drawXlabel = function(i){
		var bar = bars.get(i);
		canvasContext.fillText(bar.name, i * reservedWidthPerBar + reservedWidthPerBar / 2, reservedHeightPerBar);
	};
};

WEBT.chartzCreator = (function() {
    var numberOfColumns = 1;
    window.onload = function() {
        createCanvasArea();
    };
	
	var createCanvasArea = function(){
		var canvasContext = document.getElementById("barChart").getContext("2d");
        canvasContext.canvas.width = 600;
        canvasContext.canvas.height = 200;
        canvasContext.fillStyle = '#eee';
        canvasContext.fillRect('0', '0', '600', '300');
		canvasContext.font = "bold 12px sans-serif";
		canvasContext.textAlign = "center";
		return canvasContext;
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
        var bars = new WEBT.Bars();
        var divs = document.getElementsByClassName('bar-data');
        for(var i = 0; i < divs.length; i++) {
            var barDiv = divs[i];
            var barValue = barDiv.getElementsByClassName('bar-value')[0].value;
            var barName = barDiv.getElementsByClassName('bar-name')[0].value;
            var bar = new WEBT.Bar(barName, barValue);
            bars.put(bar);
        }
		return bars;
    };
	
	var drawBarChart = function(){
		var bars = WEBT.chartzCreator.readBarData();
		var context = createCanvasArea();
		var chart = new WEBT.BarChart(bars, context);
		chart.draw();
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
        readBarData: readBarData,
		drawBarChart: drawBarChart
    };
}());

