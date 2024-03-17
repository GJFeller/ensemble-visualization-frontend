import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3'

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
        data[item].forEach((point) => {
            console.log(point);
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
       .call(d3.axisLeft(y));
    
    // Color scale: give me a specie name, I return a color
    var color = d3.scaleOrdinal()
      .domain(groups)
      .range([ "#440154ff", "#21908dff", "#fde725ff"])
    
    // Remove old dots
    svg.selectAll("dot")
       .remove()
       .exit();
    
    // Add dots
    groups.forEach((element) => {
      svg.append('g')
        .selectAll("dot")
        .data(data[element])
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d[0]); } )
          .attr("cy", function (d) { return y(d[1]); } )
          .attr("r", pointRadius)
          .style("fill", color(element));
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