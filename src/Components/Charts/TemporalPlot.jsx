import React, { useState, memo, useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleSymlog } from '@visx/scale';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { Text } from '@visx/text';
import { localPoint } from '@visx/event';
import { LinePath } from '@visx/shape';
import { Area } from '@visx/shape';
import { Circle } from '@visx/shape';
import { curveLinear } from '@visx/curve';
import { voronoi } from '@visx/voronoi';

const defaultMargin = { top: 10, left: 10, right: 100, bottom: 30 };
const legendMargin = { top: 10, left: 10, right: 10, bottom: 10 };

function TemporalPlot({
  width,
  height,
  chartSettings,
  events = false,
  margin = defaultMargin,
}) {
  // Chart sizes
  const xSize = width > margin.left + margin.right
    ? width - margin.left - margin.right
    : width;
  const ySize = height > margin.bottom + margin.top
    ? height - margin.bottom - margin.top
    : height;

  // Color palette
  const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"];
  const background = "#ffffff";

  // Tooltip setup
  let tooltipTimeout = 0;
  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "white",
    padding: "8px",
    borderRadius: "4px",
  };
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltip();

  // State for hover point
  const [hoverPoint, setHoverPoint] = useState(null);

  // Process data and create scales
  const { xScale, yScale, groups, areaData, allPoints } = useMemo(() => {
    if (!chartSettings?.chartData) {
      return { xScale: null, yScale: null, groups: [], areaData: {}, allPoints: [] };
    }

    const groups = Object.keys(chartSettings.chartData);
    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    const areaData = {};
    const allPoints = [];

    // Process data to find bounds and create area data
    groups.forEach(group => {
      const timePoints = new Map();
      
      Object.entries(chartSettings.chartData[group]).forEach(([simulation, points]) => {
        points.forEach(point => {
          const [x, y] = point;
          xMin = Math.min(xMin, x);
          xMax = Math.max(xMax, x);
          yMin = Math.min(yMin, y);
          yMax = Math.max(yMax, y);

          // Store point with metadata
          allPoints.push({
            x,
            y,
            group,
            simulation,
            originalPoint: point
          });

          if (!timePoints.has(x)) {
            timePoints.set(x, { min: y, max: y });
          } else {
            const current = timePoints.get(x);
            current.min = Math.min(current.min, y);
            current.max = Math.max(current.max, y);
          }
        });
      });

      areaData[group] = Array.from(timePoints.entries())
        .sort(([a], [b]) => a - b)
        .map(([x, { min, max }]) => ({
          x,
          yMin: min,
          yMax: max
        }));
    });

    const xScale = scaleLinear({
      domain: [xMin, xMax],
      range: [0, xSize],
    });

    const yScale = chartSettings.temporalSettings.logScale
      ? scaleSymlog({
          domain: [yMin, yMax],
          range: [ySize, 0],
        })
      : scaleLinear({
          domain: [yMin, yMax],
          range: [ySize, 0],
        });

    return { xScale, yScale, groups, areaData, allPoints };
  }, [chartSettings?.chartData, xSize, ySize, chartSettings?.temporalSettings?.logScale]);

  // Create voronoi diagram
  const voronoiLayout = useMemo(() => {
    if (!allPoints || !xScale || !yScale) return null;

    return voronoi({
      x: d => xScale(d.x),
      y: d => yScale(d.y),
      width: xSize,
      height: ySize
    })(allPoints);
  }, [allPoints, xScale, yScale, xSize, ySize]);

  const handleMouseMove = (event) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    if (!voronoiLayout) return;

    const coords = localPoint(event);
    const x = coords.x - margin.left;
    const y = coords.y - margin.top;
    const closest = voronoiLayout.find(x, y, 100);

    if (closest) {
      const { group, simulation, x: pointX, y: pointY } = closest.data;

      showTooltip({
        tooltipData: {
          group,
          simulation,
          year: pointX,
          value: pointY
        },
        tooltipTop: coords.y,
        tooltipLeft: coords.x,
      });

      setHoverPoint({
        x: xScale(pointX),
        y: yScale(pointY),
        color: colors[groups.indexOf(group) % colors.length]
      });
    }
  };

  const handleMouseLeave = () => {
    tooltipTimeout = window.setTimeout(() => {
      hideTooltip();
      setHoverPoint(null);
    }, 300);
  };

  if (!chartSettings?.chartData || width < 10) return null;

  return (
    <>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} />
        <Group top={margin.top} left={margin.left}>
          {/* Draw areas */}
          {chartSettings.temporalSettings.drawAreas && groups.map((group, groupIndex) => (
            <Area
              key={`area-${group}`}
              data={areaData[group]}
              x={d => xScale(d.x)}
              y0={d => yScale(d.yMin)}
              y1={d => yScale(d.yMax)}
              fill={colors[groupIndex % colors.length]}
              opacity={0.2}
              curve={curveLinear}
            />
          ))}

          {/* Draw lines */}
          {groups.map((group, groupIndex) => (
            Object.entries(chartSettings.chartData[group]).map(([simulation, points]) => (
              <LinePath
                key={`line-${group}-${simulation}`}
                data={points.map(p => ({ x: p[0], y: p[1] }))}
                x={d => xScale(d.x)}
                y={d => yScale(d.y)}
                stroke={colors[groupIndex % colors.length]}
                strokeWidth={1}
                curve={curveLinear}
              />
            ))
          ))}

          {/* Mouse detection area */}
          <rect
            width={xSize}
            height={ySize}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'pointer' }}
          />

          {/* Draw hover point */}
          {hoverPoint && (
            <>
              <Circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r={5}
                fill={hoverPoint.color}
                stroke="white"
                strokeWidth={2}
                style={{ pointerEvents: 'none' }}
              />
              <Circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r={2}
                fill="white"
                style={{ pointerEvents: 'none' }}
              />
            </>
          )}
        </Group>

        {/* Legend */}
        <Group top={legendMargin.top} left={margin.left + xSize + legendMargin.left}>
          {groups.map((group, i) => (
            <React.Fragment key={`legend-${group}`}>
              <circle
                cx={0}
                cy={i * 25}
                r={7}
                fill={colors[i % colors.length]}
              />
              <Text
                x={12}
                y={i * 25}
                dy=".5em"
                textAnchor="start"
                fontSize={12}
              >
                {group}
              </Text>
            </React.Fragment>
          ))}
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div>
            <div>
              <strong className="text-xs">{tooltipData.simulation}</strong>
            </div>
            <div className="text-xs">Year: {tooltipData.year}</div>
            <div className="text-xs">Value: {tooltipData.value}</div>
          </div>
        </Tooltip>
      )}
    </>
  );
}

export default memo(TemporalPlot);