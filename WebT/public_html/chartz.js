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

WEBT.BarChart = function(barTitle, bars, context){
	this.barTitle = barTitle;
	this.width = context.canvas.width;
	this.height = context.canvas.height;
	this.paddingArroundCanvas = 5;
	this.spaceBetweenBars = 10;
	this.barColors = ["red", "green"];
	var canvasContext = context;
	var bars = bars;
	var xLabelHeight = 25;
	var yLabelHeight = 25;
	var barCharTitleHeight = 25;
	var reservedHeightPerBar = this.height - this.paddingArroundCanvas - barCharTitleHeight - yLabelHeight - xLabelHeight
	var reservedWidthPerBar = (this.width / bars.getNumberOfBars());
	var ratio = 0;
	var maxBarValue = 0;
	
	
	this.draw = function(){
		maxBarValue = bars.calculateMaxBarValue();
		this.drawTitle();
		for(var i = 0; i < bars.getNumberOfBars(); i++){
			this.drawYlabel(i);
			this.drawBar(i);
			this.drawXlabel(i);
		}
	};
	
	this.drawTitle = function(){
		canvasContext.font = "bold 20px sans-serif";
		canvasContext.textAlign = "center"
		canvasContext.fillStyle = 'black';
		canvasContext.fillText(barTitle, this.width / 2, barCharTitleHeight);
	};
	
	this.drawYlabel = function(i){
		var bar = bars.get(i);
		canvasContext.fillStyle = 'black';
		canvasContext.font = "12px sans-serif";
		canvasContext.textAlign = "center";
		var ratio = bar.value / maxBarValue;
		var barHeight = reservedHeightPerBar * ratio;
		var upperLeftCornerY = this.height - barHeight;
		canvasContext.fillText(bar.value, i * reservedWidthPerBar + reservedWidthPerBar / 2, upperLeftCornerY);

	}

	this.drawBar = function(i){
		var bar = bars.get(i);
		var space = this.spaceBetweenBars;
		canvasContext.fillStyle = this.barColors[i % this.barColors.length];
		var upperLeftCornerX = reservedWidthPerBar * i  + this.paddingArroundCanvas;
		var ratio = bar.value / maxBarValue;
		var barHeight = height * ratio;
		var upperLeftCornerY = reservedHeightPerBar - barHeight;
		canvasContext.fillRect(upperLeftCornerX, upperLeftCornerY, reservedWidthPerBar - space, barHeight); 
	};
	
	this.drawXlabel = function(i){
		var bar = bars.get(i);
		canvasContext.fillStyle = 'black';
		canvasContext.font = "12px sans-serif";
		canvasContext.textAlign = "center";
		canvasContext.fillText(bar.name, i * reservedWidthPerBar + reservedWidthPerBar / 2, this.height);
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
        canvasContext.canvas.height = 300;
        canvasContext.fillStyle = '#eee';
        canvasContext.fillRect('0', '0', '600', '300');
		return canvasContext;
	};
	
    var addInputField = function addInputField() {

        var div = createTag('div');
        div.className = 'bar-data';
		div.id = 'bar-data-' + numberOfColumns;
		div.appendChild(createDeleteButton());
        div.appendChild(createTextInputField('barName' + numberOfColumns));
        div.appendChild(createNumberInputField('barValue' + numberOfColumns));

        document.getElementById('inputFields').appendChild(div);
        numberOfColumns++;
    };
	
	var createDeleteButton = function(){
		var button = document.createElement('input');
		button.type = 'button';
		button.value = 'löschen';
		button.onclick = function(event){
			deleteInputField(event.currentTarget.parentNode);
			drawBarChart();
		};
		return button;
	};
	
	var deleteInputField = function(barDataRow){
		barDataRow.parentNode.removeChild(barDataRow);
		numberOfColumns--;
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
		number.onkeydown = function(event){
			if(event.keyIdentifier === 'U+0009'){
				drawBarChart();
				addInputField();
			}
		};

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
		var barTitle = getBarTitle();
		var chart = new WEBT.BarChart(barTitle, bars, context);
		chart.draw();
	};
	
	var getBarTitle = function(){
		var barChartTitleInput = document.getElementById('barChartTitle');
		return barChartTitleInput.value;
	}

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
		drawBarChart: drawBarChart,
		deleteInputField: deleteInputField
    };
}());