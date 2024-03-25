import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3'

/**
 * Function to draw a timeline chart
 * 
 * @param {string} chartId 
 * @param {*} data 
 */
export function drawTimeChart(chartId, data) {
    // Get dimensions for the plot
    const container = document.getElementById(chartId).parentNode;
    const margin = {top: 10, right: 100, bottom: 30, left: 120};
    const legendMargin = {top: 10, right: 5, bottom: 10, left: 10}
    const plotWidth = container.offsetWidth - margin.left - margin.right;
    const plotHeight = container.offsetHeight - margin.top - margin.bottom;
    var groups = []
    var xMax = -Number.MIN_VALUE, yMax = -Number.MIN_VALUE;
    var xMin = Number.MAX_VALUE, yMin = Number.MAX_VALUE;

    for(var item in data) {
        groups.push(item);
        //console.log(data[item]);
        for(const [key, points] of Object.entries(data[item])) {
            points.forEach((point) => {
              xMax = Math.max(xMax, point[0]);
              xMin = Math.min(xMin, point[0]);
              yMax = Math.max(yMax, point[1]);
              yMin = Math.min(yMin, point[1]);
            });
        }
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
      .range([ "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3"]);
   
   // TODO: Draw the lines and the area
    // Remove old dots
    svg.selectAll("path")
       .remove()
       .exit();
   
   // Add the line
   groups.forEach((ensemble) => {
      for(const [simulation, points] of Object.entries(data[ensemble])) {
         svg
           .append("path")
           .datum(data[ensemble][simulation])
           .attr("fill", "none")
           .style("stroke", color(ensemble))
           .attr("stroke-width", 1.5)
           .attr("d", d3.line()
             .x(function(d) { console.log(d); return x(d[0]) })
             .y(function(d) { return y(d[1]) })
             )
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
                    .attr("x", legendMargin.left+20)
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
export function drawScatterPlot(chartId, data) {
    // Get dimensions for the plot
    const container = document.getElementById(chartId).parentNode;
    const margin = {top: 10, right: 30, bottom: 30, left: 60};
    const plotWidth = container.offsetWidth - margin.left - margin.right;
    const plotHeight = container.offsetHeight - margin.top - margin.bottom;
    const pointRadius = 2;
    var groups = []

    var xMax = -Number.MIN_VALUE, yMax = -Number.MIN_VALUE;
    var xMin = Number.MAX_VALUE, yMin = Number.MAX_VALUE;
    for(var item in data) {
        groups.push(item);
        data[item].forEach((point) => {
            //console.log(point);
            xMax = Math.max(xMax, point[0]);
            xMin = Math.min(xMin, point[0]);
            yMax = Math.max(yMax, point[1]);
            yMin = Math.min(yMin, point[1]);
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
      .range([ "#440154ff", "#21908dff", "#fde725ff"]);
    
    // Remove old dots
    svg.selectAll("dot")
       .remove()
       .exit();
    
    // Add dots
    groups.forEach((element) => {
      // Adding points
      svg.append('g')
        .selectAll("dot")
        .data(data[element])
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d[0]); } )
          .attr("cy", function (d) { return y(d[1]); } )
          .attr("r", pointRadius)
          .style("fill", color(element));
      // Creating the convex hull for each group
      var pxPoint = data[element].map((d) => [x(d[0]), y(d[1])]);
      var hull = d3.polygonHull(pxPoint);
      svg.append('g')
         .append('path')
         .style("stroke", color(element))
         .style("fill-opacity", "0.3")
         .style("fill", color(element))
         .attr("d", `M${hull.join("L")}Z`);
    });

}

export function drawBarChart(chartId) {
    const data = [12, 5, 6, 6, 9, 10];
    const container = document.getElementById(chartId).parentNode;
    console.log(container);
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const barSize = width/data.length - 5*(data.length-1);
    console.log("width: " + width);
    console.log("height: " + height);
    console.log("barSize: " + barSize);

    const svg = d3.select("#"+chartId)
                  .attr("width", width)
                  .attr("height", height);

        var bars = svg.selectAll("rect")
        .remove()
        .exit()
        .data(data);

        
        bars.enter()
            .append("rect")
            .attr("x", (d, i) => i * (barSize + 10))
            .attr("y", (d, i) => height - 10 * d)
            .attr("width", barSize)
            .attr("height", (d, i) => d * 10)
            .attr("fill", "green");
        
            console.log(svg.selectAll("rect"));
}