import React, { useEffect, useRef, useState, memo } from "react";
import { Group } from "@visx/group";
import { scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { Text } from "@visx/text";
import { Brush } from '@visx/brush';
import { Circle, LinePath, Polygon } from "@visx/shape";
import * as d3 from "d3";

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
  const [selectedPoints, setSelectedPoints] = useState([]);

  var groups = [];
  var groupsPoints = {};
  var xMax = -Number.MIN_VALUE,
    yMax = -Number.MIN_VALUE;
  var xMin = Number.MAX_VALUE,
    yMin = Number.MAX_VALUE;
  for (var item in chartSettings.chartData) {
    groups.push(item);
    if (groupsPoints[item] === undefined) groupsPoints[item] = [];
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

  const onBrushChange = (extent) => {
    console.log(extent);
    if (!extent) {
      setSelectedPoints([]);
      return;
    }
    // Find points within the brush extent
    const {x0, y0, x1, y1} = extent;
    const selected = groups.map((element) => {
      console.log(element);
      return chartSettings.chartData[element].filter(point => {
        const px = xScale(point.x);
        const py = yScale(point.y);
        return px >= x0 && px <= x1 && py >= y0 && py <= y1;
      })
    });

    setSelectedPoints(selected);
  };

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
          <Brush
          xScale={xScale}
          yScale={yScale}
          width={xSize}
          height={ySize}
          handleSize={8}
          onChange={onBrushChange}
          selectedBoxStyle={{
            fill: "rgba(66, 153, 225, 0.2)",
            stroke: "#4299e1"
          }}
        />
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
