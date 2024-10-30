import React, { useEffect, useRef, useState, memo } from "react";
import { Group } from "@visx/group";
import { scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { Text } from "@visx/text";
import { localPoint } from "@visx/event";
import { Circle, LinePath, Polygon } from "@visx/shape";
import * as d3 from "d3";

function max(data, value) {
  return Math.max(...data.map(value));
}

function min(data, value) {
  return Math.min(...data.map(value));
}

const defaultMargin = { top: 10, left: 10, right: 100, bottom: 10 };
const legendMargin = { top: 10, left: 10, right: 10, bottom: 10 };

function DRScatterPlot({
  width,
  height,
  chartSettings,
  events = false,
  margin = defaultMargin,
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
  const background = "#ffffff";
  const pointRadius = 2;

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

  var groups = [];
  var groupsPoints = {};
  var xMax = -Number.MIN_VALUE,
    yMax = -Number.MIN_VALUE;
  var xMin = Number.MAX_VALUE,
    yMin = Number.MAX_VALUE;
  for (var item in chartSettings.chartData) {
    groups.push(item);
    if (groupsPoints[item] === undefined) groupsPoints[item] = [];
    console.log(chartSettings.chartData);
    // eslint-disable-next-line no-loop-func
    chartSettings.chartData[item].forEach((simulation) => {
      xMax = Math.max(xMax, simulation.x);
      xMin = Math.min(xMin, simulation.x);
      yMax = Math.max(yMax, simulation.y);
      yMin = Math.min(yMin, simulation.y);
    });
  }

  const xScale = scaleLinear({
    domain: [xMin, xMax],
    range: [0, xSize],
  });
  const yScale = scaleLinear({
    domain: [yMin, yMax],
    range: [ySize, 0],
  });
  const colorScale = scaleOrdinal({
    domain: groups,
    range: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"],
  });

  return chartSettings.chartData === null || width < 10 ? null : (
    <>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} />
        {/* Plot group */}
        <Group top={margin.top} left={margin.left}>
          {/* Plot hull polygon */}
          {groups.map((element) => {
            var pxPoint = chartSettings.chartData[element].map((d) => [
              xScale(d.x),
              yScale(d.y),
            ]);
            var hull = d3.polygonHull(pxPoint);
            console.log(hull);
            return (
              <Polygon
                points={hull}
                stroke={colorScale(element)}
                strokeWidth={1}
                fill={colorScale(element)}
                fillOpacity={0.2}
              />
            );
          })}
          {/* Plot points */}
          {groups.map((element) =>
            chartSettings.chartData[element].map((point, i) => {
              return (
                <Circle
                  key={`point-${element}-${i}`}
                  className="dot"
                  cx={xScale(point.x)}
                  cy={yScale(point.y)}
                  r={pointRadius}
                  fill={colorScale(element)}
                />
              );
            }),
          )}
        </Group>
        {/* Legend group */}
        <Group
          top={legendMargin.top}
          left={margin.left + xSize + legendMargin.left}
        >
          {groups.map((element, i) => {
            return (
              <>
                <Circle
                  key={`legent-point-${element}`}
                  className="dot"
                  cx={0}
                  cy={i * 20}
                  r={7}
                  fill={colorScale(element)}
                />
                <Text x={12} y={i * 20 + 2} textAnchor="left" fontSize={8}>
                  {element}
                </Text>
              </>
            );
          })}
        </Group>
      </svg>
    </>
  );
}

export default DRScatterPlot;
