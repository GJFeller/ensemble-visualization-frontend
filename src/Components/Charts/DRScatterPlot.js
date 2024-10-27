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

  return chartSettings.chartData === null || width < 10 ? null : (
    <>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} />
        {/* Plot group */}
        <Group top={margin.top} left={margin.left}></Group>
        {/* Legend group */}
        <Group
          top={legendMargin.top}
          left={margin.left + xSize + legendMargin.left}
        ></Group>
      </svg>
    </>
  );
}

export default DRScatterPlot;
