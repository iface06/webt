//http://www.williammalone.com/articles/html5-canvas-javascript-bar-graph/
WEBT = {}
WEBT.namespace = function(ns){
    var parts = ns.split("."),
        parent = WEBT,
        i;
    
    if(parts[0] === "WEBT"){
        parts = parts.slice(1);
    }
    
    for(i = 0;  i < parts.length; i++){
        if(typeof parent[parts[i]] === "undefined"){
            parent[parts[i]] = {}
        }
        parent = parent[parts[i]];
    }
    return parent;
};

WEBT.chartzCreator = (function(){
    var numberOfColumns = 1;
    window.onload = function(){
    var canvasContext = document.getElementById("barChart").getContext("2d")
    canvasContext.canvas.width = 300;
    canvasContext.canvas.height = 200;
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect('0', '0', '250', '150');
    };
    
    var addInputField = function addInputField(){

        var div = createTag('div');
        div.appendChild(createLabel(numberOfColumns +": "));
        div.appendChild(createTextInputField());
        div.appendChild(createNumberInputField());

        document.getElementById('inputFields').appendChild(div);
        numberOfColumns++;   
    }
    
    var createLabel = function(text){
        var label = document.createElement('label');
        label.innerHTML = text;
        return label;
    }
    
    var createTextInputField = function(name){
        var value = createTag('input');
        value.type = "text";
        value.name = name;

        return value;
    }
    
    var createNumberInputField = function(name){
        var number = createTag('input');
        number.type = "number";
        number.name = name;
        
        return number
    }
    
    var readBarData = function(){
        
    }
    
    var createTag = function(tagName){
        return document.createElement(tagName);
    }
    
    return {
        addInputField : addInputField
    };
}())

