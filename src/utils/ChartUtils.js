import * as d3 from 'd3'
import * as utils from './utils'

/**
 * It connects to the backend to get options for charts which comes from the backend application.
 * E.g. dimensionality reduction techniques, variables from the simulations, etc.
 *
 */
class ChartOptions {

   #drMethodList
   #ensembleVariableList

   constructor() {
      if(ChartOptions.instance) {
         return ChartOptions.instance;
      }
      this.#drMethodList = [];
      this.#ensembleVariableList = [];
      ChartOptions.instance = this;
      return ChartOptions.instance;
   }

   get drMethodList() { return this.#drMethodList; }
   get ensembleVariableList() {return this.#ensembleVariableList; }

   async connect() {
      if (!this.#drMethodList.length) {
         try {
            let response = await fetch(process.env.REACT_APP_BACKEND_URL+"/dr-methods");
            this.#drMethodList = await response.json();
         }
         catch(err) {
            console.log(err);
         }
      }
      if (!this.#ensembleVariableList.length) {
         try {
            let response = await fetch(process.env.REACT_APP_BACKEND_URL+"/variables");
            this.#ensembleVariableList = await response.json();
         }
         catch(err) {
            console.log(err);
         }
      }
      return this;
   }

   getOptions(chartType) {
      switch(chartType) {
         case ChartType.DR:
            return this.drMethodList;
         case ChartType.TEMPORAL:
            return this.ensembleVariableList;
         default:
            throw new Error("Chart type does not exist")
      }
      
   }
}

export let chartOptions = await new ChartOptions().connect();

/**
 * It stores settings used by a chart.
 */
export class ChartSettings {

   #chartType = ChartType.DR;
   #chartTitle = "Title"
   #chartId = ""
   #chartData = null;

   #drSettings = {
     drMethod: chartOptions.drMethodList[0],
     showConvexHull: true
   };

   #temporalSettings = {
     temporalVariable: chartOptions.ensembleVariableList[0],
     logScale: false,
     drawAreas: true,
   };

   constructor(chartType = ChartType.DR, chartTitle = "Title", chartId = "", chartData = null) {
      this.#chartType = chartType;
      this.#chartTitle = chartTitle;
      this.#chartId = chartId;
      this.#chartData = chartData;
   }

   get drSettings() { return this.#drSettings; }
   get temporalSettings() { return this.#temporalSettings; }
   get chartType() { return this.#chartType; }
   get chartTitle() { return this.#chartTitle; }
   get chartId() { return this.#chartId; }
   get chartData() {return this.#chartData; }

   set chartTitle(chartTitle) { this.#chartTitle = chartTitle; }
   set chartId(chartId) { this.#chartId = chartId; }
   set drSettings(drSettings) { this.#drSettings = drSettings; }
   set temporalSettings(temporalSettings) { this.#temporalSettings = temporalSettings; }
   set chartType(chartType) { this.#chartType = chartType; }
   set chartData(chartData) { this.#chartData = chartData; }

   static getSettings() {
      switch(this.chartType) {
         case ChartType.DR:
            return this.drSettings;
         case ChartType.TEMPORAL:
            return this.temporalSettings;
         default:
            throw new Error("Chart type does not exist")
      }
   }

   clone = function() {
      let clonedInstance = new ChartSettings(this.chartType, this.chartTitle, this.chartId);
      clonedInstance.drSettings = JSON.parse(JSON.stringify(this.drSettings));
      clonedInstance.temporalSettings = JSON.parse(JSON.stringify(this.temporalSettings));
      clonedInstance.chartData = JSON.parse(JSON.stringify(this.chartData))
      return clonedInstance;
   }

   getRestUrl = function() {
      let restUrl = "/";
      switch(this.chartType) {
         case ChartType.DR:
            restUrl = restUrl.concat('dimensional-reduction');
            return restUrl.concat('?method=', this.drSettings.drMethod);
         case ChartType.TEMPORAL:
            return restUrl.concat('', 'temporal-evolution');
            // TODO: Fazer a URL escolhendo a variavel
         default:
            throw new Error("Chart type does not exist")
      }

   }
}


export class ChartType {
   static #_DR = 0;
   static #_TEMPORAL = 1;

   static get DR() { return this.#_DR; }
   static get TEMPORAL() { return this.#_TEMPORAL; }

}

d3.selection.prototype.moveToFront = function() {
   d3.select(this).raise()
   return this;
};


export class ChartRender {

    static drawChart(chartId, chartSettings) {
       switch(chartSettings.chartType) {
          case ChartType.DR:
             this.#drawScatterPlot(chartId, chartSettings);
             break;
          case ChartType.TEMPORAL:
             this.#drawTimeChart(chartId, chartSettings);
             break;
          default:
             throw new Error("Chart type does not exist")
       }
    }
    /**
     * Function to draw a timeline chart
     * 
     * @param {string} chartId 
     * @param {*} data 
     */
    static #drawTimeChart(chartId, chartSettings) {
        let data = chartSettings.chartData;
        // Get dimensions for the plot
        if(document.getElementById(chartId) === null)
         return;
        const container = document.getElementById(chartId).parentNode;
        const margin = {top: 10, right: 100, bottom: 30, left: 120};
        const legendMargin = {top: 10, right: 5, bottom: 10, left: 10}
        const plotWidth = container.offsetWidth - margin.left - margin.right;
        const plotHeight = container.offsetHeight - margin.top - margin.bottom;
        var groups = [];
        var xMax = -Number.MAX_VALUE, yMax = -Number.MAX_VALUE;
        var xMin = Number.MAX_VALUE, yMin = Number.MAX_VALUE;
        var groupsAreaTemp = {}, groupsArea = {};
    
        const xAccessor = d => d[0]
        const yAccessor = d => d[1]
    
        for(var item in data) {
            groups.push(item);
            groupsAreaTemp = {};
            groupsArea[item] = [];
            //console.log(data[item]);
            for(const [key, points] of Object.entries(data[item])) {
                // eslint-disable-next-line no-loop-func
                points.forEach((point) => {
                  xMax = Math.max(xMax, point[0]);
                  xMin = Math.min(xMin, point[0]);
                  yMax = Math.max(yMax, point[1]);
                  yMin = Math.min(yMin, point[1]);
                  if(groupsAreaTemp[point[0]] === undefined) {
                     groupsAreaTemp[point[0]] = {};
                     groupsAreaTemp[point[0]].yMin = Number.MAX_VALUE;
                     groupsAreaTemp[point[0]].yMax = -Number.MAX_VALUE;
                  }
                  groupsAreaTemp[point[0]].yMin = Math.min(groupsAreaTemp[point[0]].yMin, point[1]);
                  groupsAreaTemp[point[0]].yMax = Math.max(groupsAreaTemp[point[0]].yMax, point[1]);
                });
            }
            for(const [key, areaRange] of Object.entries(groupsAreaTemp)) {
                var areaPoint = {};
                areaPoint.x = key;
                areaPoint.yMin = areaRange.yMin;
                areaPoint.yMax = areaRange.yMax;
                groupsArea[item].push(areaPoint);
            }
        };
        //console.log(groupsArea);
        
        // Setting dimensions and margin for the plot
        d3.select("#"+chartId).selectAll("g").remove();
        const svg = d3.select("#"+chartId)
                        .attr("width", plotWidth + margin.left + margin.right)
                        .attr("height", plotHeight + margin.top + margin.bottom)
                      .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // Add X axis
        const x = d3.scaleLinear()
                    .domain([xMin, xMax])
                    .range([0, plotWidth]);
        svg.selectAll(chartId+"-lineXAxis")
           .remove();
        svg.append("g")
           .attr("class", chartId+"-lineXAxis")
           .attr("transform", "translate(0," + plotHeight + ")")
           .call(d3.axisBottom(x))
           .attr("opacity", "1")
        
        // Add Y axis
        const y = d3.scaleLinear()
                    .domain([yMin, yMax])
                    .range([ plotHeight, 0]);
        svg.selectAll(chartId+"-lineYAxis")
           .remove();
        svg.append("g")
           .attr("class", chartId+"-lineYAxis")
           .call(d3.axisLeft(y))
           .attr("opacity", "1");
        
           // Color scale: give me a specie name, I return a color
        var color = d3.scaleOrdinal()
          .domain(groups)
          .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854']);
       
        // Remove old dots
        svg.selectAll("path")
           .remove()
           .exit();
       
       d3.selectAll(".timechartTooltip")
         .remove()
         .exit();
       var tooltip = d3.select("body")
           .append("div")
           .attr("class", "timechartTooltip")
           .style("position", "absolute")
           .style("z-index", "10")
           .style("visibility", "hidden")
           .style("background", "#fff")
           .style("border-width", "1px")
           .style("border-style", "solid")
           .style("border-color", "#000")
           .style("padding-left", "2px")
           .style("padding-right", "2px")
           .text("a simple tooltip");
    
       const tooltipDot = svg
           .append("circle")
           .attr("r", 5)
           .attr("fill", "#fc8781")
           .attr("stroke", "black")
           .attr("stroke-width", 2)
           .style("opacity", 0)
           .style('pointer-events', 'none')
       // Drawing areas
       groups.forEach((ensemble) => {
          svg
             .append("path")
             .datum(groupsArea[ensemble])
             .attr("fill", color(ensemble))
             .attr("stroke", color(ensemble))
             .attr("opacity", 0.2)
             .attr("d", d3.area()
               .x(function(d) { return x(d.x); })
               .y0(function(d) { return y(d.yMin); })
               .y1(function(d) { return y(d.yMax); })
             );
       });
       // Add the line
       groups.forEach((ensemble) => {
          for(const [simulation, points] of Object.entries(data[ensemble])) {
             svg
                .append("path")
                .datum(data[ensemble][simulation])
                .attr("fill", "none")
                .style("stroke", color(ensemble))
                .attr("stroke-width", 1)
                .attr("d", d3.line()
                 .x(function(d) { return x(d[0]) })
                 .y(function(d) { return y(d[1]) })
                )
                .on('touchmouse mousemove', function(event){
                  const mousePos = d3.pointer(event, this);
                  const year = x.invert(mousePos[0]);
                  const yearBisector = d3.bisector(d => d[0]).center;
                  const bisectionIndex = yearBisector(data[ensemble][simulation], year);
                  const hoveredIndexData = data[ensemble][simulation][bisectionIndex]
                  //const hoveredIndexData = data[ensemble][simulation][Math.max(0,bisectionIndex - 1)]
                  console.log(simulation + ": " +hoveredIndexData)
    
                  // Update Image
                  tooltipDot.style('opacity', 1)
                    .attr('cx', x(xAccessor(hoveredIndexData)))
                    .attr('cy', y(yAccessor(hoveredIndexData)))
                   
                   tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px").style("visibility", "visible")
                   tooltip.text(simulation +":\n"+"Ano: "+hoveredIndexData[0]+"\nValor: "+hoveredIndexData[1])
                })
                .on('mouseleave', function(event){
                   tooltipDot.style("opacity", 0)
                   tooltip.style("visibility", "hidden")
                });
          }
       });
    
       var legendContainer = svg.append("g")
                               .attr("transform", "translate(" + plotWidth + "," + 0 + ")");
       
       legendContainer.selectAll("legenddots")
                      .data(groups)
                      .enter()
                      .append("circle")
                        .attr("cx", legendMargin.left)
                        .attr("cy", function(d,i){ return legendMargin.top + i*25; })
                        .attr("r", 7)
                        .style("fill", function(d){ return color(d); });
       
       legendContainer.selectAll("legendlabels")
                      .data(groups)
                      .enter()
                      .append("text")
                        .attr("x", legendMargin.left+10)
                        .attr("y", function(d,i){ return legendMargin.top + i*25; })
                        .style("fill", function(d){ return color(d); })
                        .text(function(d){ return d})
                        .attr("text-anchor", "left")
                        .style("alignment-baseline", "middle");
                       
    }

    /**
     * Function to draw a scatter plot from DR data
     * 
     * @param {string} chartId 
     * @param {*} data 
     */
    static #drawScatterPlot(chartId, chartSettings) {
        let data = chartSettings.chartData;
        // Get dimensions for the plot
        if(document.getElementById(chartId) === null)
         return;
        console.log(document.getElementById(chartId));
        const container = document.getElementById(chartId).parentNode;
        const margin = {top: 10, right: 100, bottom: 30, left: 10};
        const legendMargin = {top: 10, right: 5, bottom: 10, left: 10}
        const plotWidth = container.offsetWidth - margin.left - margin.right;
        const plotHeight = container.offsetHeight - margin.top - margin.bottom;
        const pointRadius = 4;
        var groups = []
    
        // FIXME: For some reason, the backend is returning each simulation as a string instead of a object.
        // Here we are going to convert this string into a JSON object
        var convertedData = {}
        for(var ensemble in data) {
          convertedData[ensemble] = []
          // eslint-disable-next-line no-loop-func
          data[ensemble].forEach((simulation) => {
             convertedData[ensemble].push(JSON.parse(simulation));
          });
        }
        var xMax = -Number.MIN_VALUE, yMax = -Number.MIN_VALUE;
        var xMin = Number.MAX_VALUE, yMin = Number.MAX_VALUE;
        for(var item in convertedData) {
            groups.push(item);
            // eslint-disable-next-line no-loop-func
            convertedData[item].forEach((simulation) => {
                //console.log(point);
                xMax = Math.max(xMax, simulation.x);
                xMin = Math.min(xMin, simulation.x);
                yMax = Math.max(yMax, simulation.y);
                yMin = Math.min(yMin, simulation.y);
            });
        };
    
        // Setting dimensions and margin for the plot
        d3.select("#"+chartId).selectAll("g").remove();
        const svg = d3.select("#"+chartId)
                        .attr("width", plotWidth + margin.left + margin.right)
                        .attr("height", plotHeight + margin.top + margin.bottom)
                      .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // Add X axis
        const x = d3.scaleLinear()
                    .domain([xMin, xMax])
                    .range([0, plotWidth]);
        svg.selectAll(chartId+"-scatterXAxis")
           .remove();
        svg.append("g")
           .attr("class", chartId+"-scatterXAxis")
           .attr("transform", "translate(0," + plotHeight + ")")
           .call(d3.axisBottom(x))
           .attr("opacity", "0")
        
        // Add Y axis
        const y = d3.scaleLinear()
                    .domain([yMin, yMax])
                    .range([ plotHeight, 0]);
        svg.selectAll(chartId+"-scatterYAxis")
           .remove();
        svg.append("g")
           .attr("class", chartId+"-scatterYAxis")
           .call(d3.axisLeft(y))
           .attr("opacity", "0");
        
        // Color scale: give me a specie name, I return a color
        var color = d3.scaleOrdinal()
          .domain(groups)
          .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854']);
        
        // Remove old dots
        svg.selectAll("dot")
           .remove()
           .exit();
        
       d3.selectAll(".scatterTooltip")
         .remove()
         .exit();
    
       var tooltip = d3.select("body")
           .append("div")
           .attr("class", "scatterTooltip")
           .style("position", "absolute")
           .style("z-index", "10")
           .style("visibility", "hidden")
           .style("background", "#fff")
           .style("border-width", "1px")
           .style("border-style", "solid")
           .style("border-color", "#000")
           .style("padding-left", "2px")
           .style("padding-right", "2px")
           .text("a simple tooltip");
       
       let points = {};
        // Drawing the convex hull for each ensemble
        groups.forEach((element) => {
          // Creating the convex hull for each group
          var pxPoint = convertedData[element].map((d) => [x(d.x), y(d.y)]);
          var hull = d3.polygonHull(pxPoint);
          svg.append('g')
             .append('path')
             .style("stroke", color(element))
             .style("fill-opacity", "0.3")
             .style("fill", color(element))
             .attr("d", `M${hull.join("L")}Z`);
        });
       svg.call(d3.brush().on("start brush end", ({selection}) => {
          let value = [];
          if (selection) {
             const [[x0, y0], [x1, y1]] = selection;
             value = d3.selectAll(".points").style("fill", "gray")
                           .filter(d => x0 <= x(d.x) && x(d.x) < x1
                         && y0 <= y(d.y) && y(d.y) < y1)
                           .style("fill", function(d) { return color(utils.getKeyByValueAttribute(convertedData, "name", d.name))})
                           .data();
    
          }
          else {
             d3.selectAll("dot").style("fill", d => color(utils.getKeyByValueAttribute(convertedData, "name", d.name)));
          }
       }))
        // Add dots
        groups.forEach((element) => {
          // Adding points
          points = svg.append('g')
            .selectAll("dot")
            .data(convertedData[element])
            .enter()
            .append("circle")
              .attr("class", "points")
              .attr("cx", function (d) { return x(d.x); } )
              .attr("cy", function (d) { return y(d.y); } )
              .attr("r", pointRadius)
              .style("fill", color(element))
              .text(function (d) { return d.name; })
              .on("mouseover", function(event, d) {
                d3.select(this)
                  .transition()
                  .duration(100)
                  .attr("r", pointRadius*2); 
                tooltip.text(d.name); 
                return tooltip.style("visibility", "visible");
              })
              .on("mousemove", function(event) {return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
              .on("mouseout", function() {
                d3.select(this)
                  .transition()
                  .duration(100)
                  .attr("r", pointRadius);
                  return tooltip.style("visibility", "hidden");
               });
        });
    
       var legendContainer = svg.append("g")
                               .attr("transform", "translate(" + plotWidth + "," + 0 + ")");
       
       legendContainer.selectAll("legenddots")
                      .data(groups)
                      .enter()
                      .append("circle")
                        .attr("cx", legendMargin.left)
                        .attr("cy", function(d,i){ return legendMargin.top + i*25; })
                        .attr("r", 7)
                        .style("fill", function(d){ return color(d); });
       
       legendContainer.selectAll("legendlabels")
                      .data(groups)
                      .enter()
                      .append("text")
                        .attr("x", legendMargin.left+10)
                        .attr("y", function(d,i){ return legendMargin.top + i*25; })
                        .style("fill", function(d){ return color(d); })
                        .text(function(d){ return d})
                        .attr("text-anchor", "left")
                        .style("alignment-baseline", "middle");
       
    }
}
