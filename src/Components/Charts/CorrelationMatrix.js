import React, { useEffect, useRef, useState, memo } from "react";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { HeatmapCircle, HeatmapRect } from "@visx/heatmap";
import { Text } from "@visx/text";

const background = "#ffffff";
const cool1 = "#122549";
const cool2 = "#b4fbde";

function max(data, value) {
  return Math.max(...data.map(value));
}

function min(data, value) {
  return Math.min(...data.map(value));
}

// accessors
//const bins = (d) => d.bins;
//const count = (d) => d.count;
//const colorMax = max(binData, (d) => max(bins(d), count));
//const bucketSizeMax = max(binData, (d) => bins(d).length);
//

const defaultMargin = { top: 10, left: 10, right: 40, bottom: 10 };
const legendMargin = { top: 10, left: 10, right: 10, bottom: 10 };

function CorrelationMatrix({
  width,
  height,
  chartSettings,
  events = false,
  margin = defaultMargin,
  gap = 1,
}) {
  // Chart sizes and variables
  const xSize =
    width > margin.left + margin.right
      ? width - margin.left - margin.right
      : width;
  const ySize =
    height > margin.bottom + margin.top
      ? height - margin.bottom - margin.top
      : height;

  let rectWidth = 0;
  let rectHeight = 0;
  let variables = [];
  if (
    chartSettings.chartData !== null &&
    chartSettings.chartData.length !== 0
  ) {
    variables = Object.keys(chartSettings.chartData);
    rectWidth = (xSize - gap * (variables.length - 1)) / variables.length;
    rectHeight = (ySize - gap * (variables.length - 1)) / variables.length;
  }
  // Legend sizes
  const legendRectWidth =
    (margin.right - legendMargin.left - legendMargin.right) / 2;
  const legendRectHeight = ySize;

  // Color scale
  const colorScale = scaleLinear({
    domain: [-1, 0, 1],
    range: ["tomato", "white", "steelblue"],
  });

  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND_URL + chartSettings.getRestUrl())
      .then((res) => {
        return res.json();
      })
      .then((dataResponse) => {
        chartSettings.chartData = dataResponse;
      });
  }, [chartSettings]);

  //const binWidth = xMax / binData.length;
  //const binHeight = yMax / bucketSizeMax;

  //xScale.range([0, xMax]);
  //yScale.range([yMax, 0]);

  return chartSettings.chartData === null || width < 10 ? null : (
    <svg width={width} height={height}>
      <rect x={0} y={0} width={width} height={height} fill={background} />
      <Group top={margin.top} left={margin.left}>
        {/* Add column labels */}
        {console.log(variables)}
        {console.log("Dimensions:", rectWidth, rectHeight)}
        {variables.map((variable, i) => (
          <Text
            key={`column-${i}`}
            x={i * rectWidth + rectWidth / 2}
            y={-20}
            textAnchor="middle"
            fontSize={12}
          >
            {variable}
          </Text>
        ))}

        {/* Add row labels */}
        {variables.map((variable, i) => (
          <Text
            key={`row-${i}`}
            x={-10}
            y={i * rectHeight + rectHeight / 2}
            textAnchor="end"
            fontSize={12}
          >
            {variable}
          </Text>
        ))}

        {/* Create correlation matrix cells */}
        {variables.map((row, i) =>
          variables.map((col, j) => (
            <g key={`cell-${i}-${j}`}>
              <rect
                x={j * rectWidth + j * gap}
                y={i * rectHeight + i * gap}
                width={rectWidth}
                height={rectHeight}
                fill={colorScale(chartSettings.chartData[row][col])}
                stroke="#ffffff"
              />
            </g>
          )),
        )}
      </Group>
      <Group
        top={legendMargin.top}
        left={margin.left + xSize + legendMargin.left}
      >
        <rect
          x={0}
          y={0}
          width={legendRectWidth}
          height={legendRectHeight}
          fill={colorScale(1)}
          stroke="#ffffff"
        ></rect>
      </Group>
    </svg>
  );
}

export default CorrelationMatrix;
