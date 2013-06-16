WEBT = {}
WEBT.chartzCreator = (function() {
    var numberOfColumns = 0;
    window.onload = function() {
        createCanvasArea();
    };

    var createCanvasArea = function() {
        var canvasContext = document.getElementById("barChart").getContext("2d");
        canvasContext.canvas.width = 600;
        canvasContext.canvas.height = 300;
        canvasContext.fillStyle = '#eee';
        canvasContext.fillRect('0', '0', '600', '300');
        return canvasContext;
    };

    var addInputField = function addInputField() {
        numberOfColumns++;
        var div = createTag('div');
        div.className = 'bar-data';
        div.id = 'bar-data-' + numberOfColumns;
        div.appendChild(createDeleteButton());
        div.appendChild(createBarNameInputField('barName' + numberOfColumns));
        div.appendChild(createBarValueInputField('barValue' + numberOfColumns));

        document.getElementById('inputFields').appendChild(div);
    };

    var createDeleteButton = function() {
        var button = document.createElement('input');
        button.type = 'button';
        button.value = 'löschen';
        button.className = 'row-button';
        button.onclick = function(event) {
            deleteInputField(event.currentTarget.parentNode);
            drawBarChart();
        };
        return button;
    };

    var deleteInputField = function(barDataRow) {
        barDataRow.parentNode.removeChild(barDataRow);
        numberOfColumns--;
    };

    var createBarNameInputField = function(name) {
        var value = createTag('input');
        value.type = "text";
        value.name = name;
        value.id = name;
        value.className = 'bar-name';
        value.placeholder = 'Säulenname';

        return value;
    };

    var createBarValueInputField = function(name) {
        var number = createTag('input');
        number.type = "number";
        number.name = name;
        number.id = name;
        number.className = 'bar-value';
        number.placeholder = 'Wert';
        number.onkeydown = function(event) {
            if (event.keyIdentifier === 'U+0009' && !event.shiftKey) {
                var idParts = event.target.parentNode.id.split('-');
                if (!(Number(idParts[2]) < numberOfColumns)) {
                    drawBarChart();
                    addInputField();
                }
            }
        };

        return number;
    };

    var readBarData = function() {
        var bars = new WEBT.Bars();
        var divs = document.getElementsByClassName('bar-data');
        for (var i = 0; i < divs.length; i++) {
            var barDiv = divs[i];
            var barValue = barDiv.getElementsByClassName('bar-value')[0].value;
            var barName = barDiv.getElementsByClassName('bar-name')[0].value;
            var bar = new WEBT.Bar(barName, barValue);
            bars.put(bar);
        }
        return bars;
    };
    
    var reset = function(){
        window.location = './chartz.html';
    };

    var drawBarChart = function() {
        var bars = WEBT.chartzCreator.readBarData();
        var context = createCanvasArea();        
        var chart = new WEBT.BarChart(bars, context);
        chart.barTitle = getBarTitle();
        chart.barUnit = getBarUnit();
        chart.draw();
    };

    var getBarTitle = function() {
        var barChartTitleInput = document.getElementById('barTitle');
        return barChartTitleInput.value;
    };
    var getBarUnit = function() {
        var barChartTitleInput = document.getElementById('barUnit');
        return barChartTitleInput.value;
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
        drawBarChart: drawBarChart,
        deleteInputField: deleteInputField,
        reset: reset
    };
}());

WEBT.BarChart = function(bars, context) {
    this.barTitle;
    this.barUnit; 
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
    var yEndPoint = this.height - xLabelHeight;
    var reservedWidthPerBar = (this.width / bars.getNumberOfBars());
    var maxBarValue = 0;


    this.draw = function() {
        maxBarValue = bars.calculateMaxBarValue();
        this.drawTitle();
        for (var i = 0; i < bars.getNumberOfBars(); i++) {
            this.drawYlabel(i);
            this.drawBar(i);
            this.drawXlabel(i);
        }
    };

    this.drawTitle = function() {
        canvasContext.font = "bold 20px sans-serif";
        canvasContext.textAlign = "center";
        canvasContext.fillStyle = 'black';
        
        canvasContext.fillText(this.barTitle, this.width / 2, barCharTitleHeight);
    };

    this.drawYlabel = function(i) {
        var bar = bars.get(i);
        canvasContext.fillStyle = 'black';
        canvasContext.font = "12px sans-serif";
        canvasContext.textAlign = "center";
        var barHeight = this.calculateBarHeight(bar);
        var upperLeftCornerY = yEndPoint - barHeight - yLabelHeight / 6;
        var value = bar.value;
        if(this.barUnit)
            value += " " + this.barUnit;
        canvasContext.fillText(value, i * reservedWidthPerBar + reservedWidthPerBar / 2, upperLeftCornerY);

    };

    this.drawBar = function(i) {
        var bar = bars.get(i);
        var space = this.spaceBetweenBars;
        canvasContext.fillStyle = this.barColors[i % this.barColors.length];
        var upperLeftCornerX = reservedWidthPerBar * i + this.paddingArroundCanvas;
        var barHeight = this.calculateBarHeight(bar);
        var upperLeftCornerY = yEndPoint - barHeight;
        canvasContext.fillRect(upperLeftCornerX, upperLeftCornerY, reservedWidthPerBar - space, barHeight);
    };

    this.calculateBarHeight = function(bar) {
        var ratio = bar.value / maxBarValue;
        var yStartPoint = barCharTitleHeight + yLabelHeight;
        var yEndPoint = this.height - xLabelHeight;
        return (yEndPoint - yStartPoint) * ratio;
    };


    this.drawXlabel = function(i) {
        var bar = bars.get(i);
        canvasContext.fillStyle = 'black';
        canvasContext.font = "12px sans-serif";
        canvasContext.textAlign = "center";
        canvasContext.fillText(bar.name, i * reservedWidthPerBar + reservedWidthPerBar / 2, yEndPoint + xLabelHeight / 2);
    };
};

WEBT.Bars = function() {
    this.bars = new Array();

    this.calculateMaxBarValue = function() {
        var max = 0;
        for (var i = 0; i < this.bars.length; i++) {
            var barValue = Number(this.bars[i].value);
            if (barValue > max) {
                max = barValue;
            }
        }
        return max;
    };

    this.put = function(bar) {
        this.bars.push(bar);
    };

    this.get = function(i) {
        return this.bars[i];
    };

    this.getNumberOfBars = function() {
        return this.bars.length;
    };
};

WEBT.Bar = function(name, value) {
    this.name = name;
    this.value = value;
};




