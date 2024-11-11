import React, { useEffect, useRef, useState, memo } from "react";
import { Group } from "@visx/group";
import { scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
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

  // Tooltip variables and styles
  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "white",
    padding: "8px",
    borderRadius: "4px",
  };
  
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip();

  const [brushing, setBrushing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState(new Set());
  const [brushBox, setBrushBox] = useState(null);

  let tooltipTimeout = 0;

  // Clear tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      hideTooltip();
    }
  }, [isDragging]);

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

  // Check if a point is within the brush selection
  const isPointInBrush = (point) => {
    if (!brushBox) return false;
    const { x0, x1, y0, y1 } = brushBox;
    return (
      point.x >= x0 &&
      point.x <= x1 &&
      point.y >= y0 &&
      point.y <= y1
    );
  };

  // Handle brush events
  const onBrushStart = () => {
    setBrushing(true);
    setIsDragging(true);
    hideTooltip();
  };

  const onBrushEnd = () => {
    setBrushing(false);
    setIsDragging(false);
  };
  
  const onBrushUpdate = (bbox) => {
    if (!bbox) {
      setSelectedPoints(new Set());
      setBrushBox(null);
      return;
    }

    const { x0, x1, y0, y1 } = bbox;
    const selected = new Set();

    Object.entries(chartSettings.chartData).forEach(([ensemble, points]) => {
      points.forEach(point => {
        if (
          point.x >= x0 &&
          point.x <= x1 &&
          point.y >= y0 &&
          point.y <= y1
        ) {
          selected.add(point.name);
        }
      });
    });

    setSelectedPoints(selected);
    setBrushBox(bbox);
  };

  // Handle tooltip events
  const handleMouseMove = (event, point, group) => {
    if (isDragging) {
      hideTooltip();
      return;
    }

    // Only show tooltip if there's no brush or if point is within brush
    if (brushBox && !isPointInBrush(point)) {
      hideTooltip();
      return;
    }
    
    event.stopPropagation();
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    
    const coords = localPoint(event);
    const data = {
      group: group,
      x: point.x.toFixed(2),
      y: point.y.toFixed(2),
      name: point.name
    };
    
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: data
    });
  };

  const handleMouseLeave = (event) => {
    event.stopPropagation();
    tooltipTimeout = window.setTimeout(() => {
      hideTooltip();
    }, 300);
  };

  return chartSettings.chartData === null || width < 10 ? null : (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} />
        <Group top={margin.top} left={margin.left}>
          {/* Brush component first (at the bottom) */}
          <g className="brush-layer">
            <Brush
              xScale={xScale}
              yScale={yScale}
              width={xSize}
              height={ySize}
              handleSize={8}
              resizeTriggerAreas={['left', 'right', 'top', 'bottom', 'center']}
              brushDirection="both"
              initialBrushPosition={{
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 },
              }}
              onBrushStart={onBrushStart}
              onChange={brush => {
                if (!brush) {
                  onBrushUpdate(null);
                  return;
                }
                setIsDragging(true);
                const { x0, x1, y0, y1 } = brush;
                onBrushUpdate({ x0, x1, y0, y1 });
              }}
              onBrushEnd={onBrushEnd}
              onClick={() => {
                setSelectedPoints(new Set());
                setBrushBox(null);
              }}
            />
          </g>
          
          {/* Hull polygons with pointer-events:none */}
          <g 
            className="hull-layer" 
            style={{ pointerEvents: 'none' }}
          >
            {groups.map((element) => {
              var pxPoint = chartSettings.chartData[element].map((d) => [
                xScale(d.x),
                yScale(d.y),
              ]);
              var hull = d3.polygonHull(pxPoint);
              return (
                hull && (
                  <Polygon
                    key={`hull-${element}`}
                    points={hull}
                    stroke={colorScale(element)}
                    strokeWidth={1}
                    fill={colorScale(element)}
                    fillOpacity={0.2}
                    style={{ pointerEvents: 'none' }}
                  />
                )
              );
            })}
          </g>
          
          {/* Points layer */}
          <g 
            className="points-layer"
            style={{ pointerEvents: 'none' }}
          >
            {groups.map((element) =>
              chartSettings.chartData[element].map((point, i) => {
                const isSelected = !brushBox || isPointInBrush(point);
                return (
                  <Circle
                    key={`point-${element}-${i}`}
                    className="dot"
                    cx={xScale(point.x)}
                    cy={yScale(point.y)}
                    r={pointRadius}
                    fill={colorScale(element)}
                    opacity={isSelected ? 1 : 0.3}
                    onMouseMove={(event) => handleMouseMove(event, point, element)}
                    onMouseLeave={handleMouseLeave}
                    style={{ 
                      cursor: isSelected ? 'pointer' : 'default',
                      pointerEvents: isSelected ? 'visible' : 'none'
                    }}
                  />
                );
              }),
            )}
          </g>
        </Group>
        
        {/* Legend group */}
        <Group
          top={legendMargin.top}
          left={margin.left + xSize + legendMargin.left}
        >
          {groups.map((element, i) => {
            return (
              <React.Fragment key={`legend-${element}`}>
                <Circle
                  className="dot"
                  cx={0}
                  cy={i * 20}
                  r={7}
                  fill={colorScale(element)}
                />
                <Text x={12} y={i * 20 + 2} textAnchor="left" fontSize={8}>
                  {element}
                </Text>
              </React.Fragment>
            );
          })}
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipData && !isDragging && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden',
            pointerEvents: 'none'
          }}
        >
          <Tooltip 
            top={tooltipTop} 
            left={tooltipLeft} 
            style={{
              ...tooltipStyles,
              whiteSpace: 'nowrap',
              transform: `translate(-50%, ${tooltipTop < 40 ? 25 : -100}%)`,
            }}
          >
            <div className="text-xs">
              <div>
                <strong>Group: {tooltipData.group}</strong>
              </div>
              <div>X: {tooltipData.x}</div>
              <div>Y: {tooltipData.y}</div>
              {tooltipData.name && <div>Name: {tooltipData.name}</div>}
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default DRScatterPlot;