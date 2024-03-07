import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3'

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