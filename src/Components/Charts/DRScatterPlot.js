import React, { useEffect, useMemo, useCallback, memo } from "react";
import { Group } from "@visx/group";
import { scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { Text } from "@visx/text";
import { Brush } from '@visx/brush';
import { Circle, LinePath, Polygon } from "@visx/shape";
import * as d3 from "d3";

const DEFAULT_MARGIN = { top: 10, left: 10, right: 100, bottom: 10 };
const LEGEND_MARGIN = { top: 10, left: 10, right: 10, bottom: 10 };
const POINT_RADIUS = 2;
const TOOLTIP_HIDE_DELAY = 300;
const COLOR_PALETTE = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"];

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "rgba(0,0,0,0.9)",
  color: "white",
  padding: "8px",
  borderRadius: "4px",
  zIndex: 1000,
  position: 'absolute',
  pointerEvents: 'none',
};

// Memoized legend component
const Legend = memo(({ groups, colorScale, margin, xSize }) => (
  <Group top={LEGEND_MARGIN.top} left={margin.left + xSize + LEGEND_MARGIN.left}>
    {groups.map((element, i) => (
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
    ))}
  </Group>
));

// Memoized hull component
const Hulls = memo(({ groups, chartData, colorScale, xScale, yScale }) => (
  <g className="hull-layer" style={{ pointerEvents: 'none' }}>
    {groups.map((element) => {
      const pxPoints = chartData[element]?.map((d) => [
        xScale(d.x),
        yScale(d.y),
      ]) || [];
      const hull = d3.polygonHull(pxPoints);
      return hull && (
        <Polygon
          key={`hull-${element}`}
          points={hull}
          stroke={colorScale(element)}
          strokeWidth={1}
          fill={colorScale(element)}
          fillOpacity={0.2}
          style={{ pointerEvents: 'none' }}
        />
      );
    })}
  </g>
));

function DRScatterPlot({
  width,
  height,
  chartSettings,
  events = false,
  margin = DEFAULT_MARGIN,
}) {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip();

  // Memoized calculations
  const { xSize, ySize, groups, scales, bounds } = useMemo(() => {
    // Check if chartSettings and chartData exist
    if (!chartSettings?.chartData) {
      return {
        xSize: 0,
        ySize: 0,
        groups: [],
        scales: null,
        bounds: null
      };
    }

    const xSize = Math.max(0, width - margin.left - margin.right);
    const ySize = Math.max(0, height - margin.bottom - margin.top);
    
    const groups = Object.keys(chartSettings.chartData);
    const bounds = groups.reduce((acc, item) => {
      if (Array.isArray(chartSettings.chartData[item])) {
        chartSettings.chartData[item].forEach((simulation) => {
          acc.xMax = Math.max(acc.xMax, simulation.x);
          acc.xMin = Math.min(acc.xMin, simulation.x);
          acc.yMax = Math.max(acc.yMax, simulation.y);
          acc.yMin = Math.min(acc.yMin, simulation.y);
        });
      }
      return acc;
    }, {
      xMax: -Number.MIN_VALUE,
      yMax: -Number.MIN_VALUE,
      xMin: Number.MAX_VALUE,
      yMin: Number.MAX_VALUE
    });

    const scales = {
      xScale: scaleLinear({
        domain: [bounds.xMin, bounds.xMax],
        range: [0, xSize],
      }),
      yScale: scaleLinear({
        domain: [bounds.yMin, bounds.yMax],
        range: [ySize, 0],
      }),
      colorScale: scaleOrdinal({
        domain: groups,
        range: COLOR_PALETTE,
      })
    };

    return { xSize, ySize, groups, scales, bounds };
  }, [width, height, margin, chartSettings?.chartData]);

  const [brushing, setBrushing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedPoints, setSelectedPoints] = React.useState(new Set());
  const [brushBox, setBrushBox] = React.useState(null);

  const handleMouseMove = useCallback((event, point, group) => {
    if (isDragging || (brushBox && !isPointInBrush(point, brushBox))) {
      hideTooltip();
      return;
    }

    event.stopPropagation();
    const coords = localPoint(event);
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: {
        ensemble: group,
        name: point.name
      }
    });
  }, [isDragging, brushBox, showTooltip, hideTooltip]);

  const handleMouseLeave = useCallback((event) => {
    event.stopPropagation();
    setTimeout(hideTooltip, TOOLTIP_HIDE_DELAY);
  }, [hideTooltip]);

  const isPointInBrush = useCallback((point, brush) => {
    if (!brush) return false;
    const { x0, x1, y0, y1 } = brush;
    return point.x >= x0 && point.x <= x1 && point.y >= y0 && point.y <= y1;
  }, []);

  const onBrushUpdate = useCallback((bbox) => {
    if (!bbox || !chartSettings?.chartData) {
      setSelectedPoints(new Set());
      setBrushBox(null);
      return;
    }

    const selected = new Set();
    Object.entries(chartSettings.chartData).forEach(([ensemble, points]) => {
      if (Array.isArray(points)) {
        points.forEach(point => {
          if (isPointInBrush(point, bbox)) {
            selected.add(point.name);
          }
        });
      }
    });

    setSelectedPoints(selected);
    setBrushBox(bbox);
  }, [chartSettings?.chartData, isPointInBrush]);

  return !chartSettings?.chartData || width < 10 ? null : (
    <>
      <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
        <svg width={width} height={height}>
          <rect x={0} y={0} width={width} height={height} fill="#ffffff" />
          <Group top={margin.top} left={margin.left}>
            <Brush
              xScale={scales.xScale}
              yScale={scales.yScale}
              width={xSize}
              height={ySize}
              handleSize={8}
              resizeTriggerAreas={['left', 'right', 'top', 'bottom', 'center']}
              brushDirection="both"
              initialBrushPosition={{
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 },
              }}
              onBrushStart={() => {
                setBrushing(true);
                setIsDragging(true);
                hideTooltip();
              }}
              onChange={brush => {
                if (!brush) {
                  onBrushUpdate(null);
                  return;
                }
                setIsDragging(true);
                onBrushUpdate(brush);
              }}
              onBrushEnd={() => {
                setBrushing(false);
                setIsDragging(false);
              }}
              onClick={() => {
                setSelectedPoints(new Set());
                setBrushBox(null);
              }}
            />

            <Hulls
              groups={groups}
              chartData={chartSettings.chartData}
              colorScale={scales.colorScale}
              xScale={scales.xScale}
              yScale={scales.yScale}
            />
            
            <g className="points-layer" style={{ pointerEvents: 'none' }}>
              {groups.map((element) =>
                (chartSettings.chartData[element] || []).map((point, i) => {
                  const isSelected = !brushBox || isPointInBrush(point, brushBox);
                  return (
                    <Circle
                      key={`point-${element}-${i}`}
                      className="dot"
                      cx={scales.xScale(point.x)}
                      cy={scales.yScale(point.y)}
                      r={POINT_RADIUS}
                      fill={scales.colorScale(element)}
                      opacity={isSelected ? 1 : 0.3}
                      onMouseMove={(event) => handleMouseMove(event, point, element)}
                      onMouseLeave={handleMouseLeave}
                      style={{ 
                        cursor: isSelected ? 'pointer' : 'default',
                        pointerEvents: isSelected ? 'visible' : 'none'
                      }}
                    />
                  );
                })
              )}
            </g>
          </Group>
          
          <Legend
            groups={groups}
            colorScale={scales.colorScale}
            margin={margin}
            xSize={xSize}
          />
        </svg>

        {tooltipData && !isDragging && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
            <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
              <div className="text-xs">
                <div><strong>Ensemble: {tooltipData.ensemble}</strong></div>
                {tooltipData.name && <div>Simulation: {tooltipData.name}</div>}
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(DRScatterPlot);