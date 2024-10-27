import React, { useEffect, useRef, useState, memo } from "react";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { useTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { Text } from "@visx/text";
import { localPoint } from "@visx/event";

function max(data, value) {
  return Math.max(...data.map(value));
}

function min(data, value) {
  return Math.min(...data.map(value));
}

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
  const background = "#ffffff";

  // Tooltip variables
  let tooltipTimeout = 0;
  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "white",
    padding: "8px",
    borderRadius: "4px",
  };
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } =
    useTooltip();

  //useEffect(() => {
  //  fetch(process.env.REACT_APP_BACKEND_URL + chartSettings.getRestUrl())
  //    .then((res) => {
  //      return res.json();
  //    })
  //    .then((dataResponse) => {
  //      chartSettings.chartData = dataResponse;
  //    });
  //}, [chartSettings]);

  return chartSettings.chartData === null || width < 10 ? null : (
    <>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} />
        <Group top={margin.top} left={margin.left}>
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
                  onClick={() => {
                    if (events)
                      alert(
                        `clicked: ${JSON.stringify(chartSettings.chartData[row][col])}`,
                      );
                  }}
                  onMouseLeave={() => {
                    tooltipTimeout = window.setTimeout(() => {
                      hideTooltip();
                    }, 300);
                  }}
                  onMouseMove={(event) => {
                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                    const coords = localPoint(event);
                    let data = {};
                    data.row = row;
                    data.col = col;
                    data.value = chartSettings.chartData[row][col];
                    showTooltip({
                      tooltipData: data,
                      tooltipTop: coords.y,
                      tooltipLeft: coords.x,
                    });
                  }}
                />
              </g>
            )),
          )}
        </Group>
        <Group
          top={legendMargin.top}
          left={margin.left + xSize + legendMargin.left}
        >
          <defs>
            <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "tomato" }} />
              <stop offset="50%" style={{ stopColor: "white" }} />
              <stop offset="100%" style={{ stopColor: "steelblue" }} />
            </linearGradient>
          </defs>
          <rect
            x={0}
            y={0}
            width={legendRectWidth}
            height={legendRectHeight}
            fill={"url(#bar-gradient)"}
            stroke="#ffffff"
          ></rect>
          <Text
            x={legendRectWidth + 10}
            y={5}
            textAnchor="middle"
            fontSize={10}
          >
            -1.0
          </Text>
          <Text
            x={legendRectWidth + 10}
            y={ySize / 2 + 5}
            textAnchor="middle"
            fontSize={10}
          >
            0.0
          </Text>
          <Text
            x={legendRectWidth + 10}
            y={ySize + 2.5}
            textAnchor="middle"
            fontSize={10}
          >
            1.0
          </Text>
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div>
            <div>
              <strong className="text-xs">Row: {tooltipData.row}</strong>
            </div>
            <div>
              <strong className="text-xs">Column: {tooltipData.col}</strong>
            </div>
            <div className="text-xs">Value: {tooltipData.value}</div>
          </div>
        </Tooltip>
      )}
    </>
  );
}

export default CorrelationMatrix;
