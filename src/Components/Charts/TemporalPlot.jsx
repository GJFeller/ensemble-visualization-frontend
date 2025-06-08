import React, { useState, memo, useMemo, useEffect, useCallback } from 'react';
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
import { AxisBottom, AxisLeft } from '@visx/axis';

const defaultMargin = { top: 10, left: 60, right: 100, bottom: 50 };
const legendMargin = { top: 10, left: 10, right: 10, bottom: 10 };

function TemporalPlot({
  width,
  height,
  chartSettings,
  events = false,
  margin = defaultMargin,
}) {
  console.log('TemporalPlot rendered with:', { width, height, chartSettings, margin });

  // Chart sizes
  const xSize = width > margin.left + margin.right
    ? width - margin.left - margin.right
    : width;
  const ySize = height > margin.bottom + margin.top
    ? height - margin.bottom - margin.top
    : height;

  console.log('Chart dimensions:', { xSize, ySize });

  // Color palette
  const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"];
  const background = "#ffffff";

  // Tooltip setup
  let tooltipTimeout = 0;
  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "white",
    padding: "6px",
    borderRadius: "4px",
    fontSize: "9px",
  };
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltip();

  // State for hover point and external selection
  const [hoverPoint, setHoverPoint] = useState(null);
  const [externalSelection, setExternalSelection] = useState(null);
  const [hoveredSeries, setHoveredSeries] = useState(null);

  // Process data and create scales
  const { xScale, yScale, groups, areaData, allPoints } = useMemo(() => {
    if (!chartSettings?.chartData) {
      console.log('No chartData available');
      return { xScale: null, yScale: null, groups: [], areaData: {}, allPoints: [] };
    }

    console.log('TemporalPlot chartData:', chartSettings.chartData);

    const groups = Object.keys(chartSettings.chartData);
    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    const areaData = {};
    const allPoints = [];

    // Process data to find bounds and create area data
    groups.forEach(group => {
      const timePoints = new Map();
      const groupData = chartSettings.chartData[group];
      
      console.log(`Processing group ${group}:`, groupData);
      
      if (groupData && typeof groupData === 'object') {
        Object.entries(groupData).forEach(([simulation, points]) => {
          console.log(`Processing simulation ${simulation}:`, points);
          
          if (Array.isArray(points)) {
            points.forEach(point => {
              // Suporte para diferentes formatos de dados
              let x, y;
              if (Array.isArray(point)) {
                [x, y] = point;
              } else if (typeof point === 'object') {
                x = point.x || point.time || point.year;
                y = point.y || point.value;
              }
              
              if (x !== undefined && y !== undefined) {
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
              }
            });
          }
        });
      }

      areaData[group] = Array.from(timePoints.entries())
        .sort(([a], [b]) => a - b)
        .map(([x, { min, max }]) => ({
          x,
          yMin: min,
          yMax: max
        }));
    });

    console.log('Bounds:', { xMin, xMax, yMin, yMax });
    console.log('AllPoints:', allPoints);

    // Se não encontrou dados válidos, retorna escalas padrão
    if (xMin === Infinity || yMin === Infinity) {
      console.log('No valid data found, using default scales');
      return { 
        xScale: scaleLinear({ domain: [0, 1], range: [0, xSize] }), 
        yScale: scaleLinear({ domain: [0, 1], range: [ySize, 0] }), 
        groups: [], 
        areaData: {}, 
        allPoints: [] 
      };
    }

    const xScale = scaleLinear({
      domain: [xMin, xMax],
      range: [0, xSize],
    });

    const yScale = chartSettings.temporalSettings?.logScale
      ? scaleSymlog({
          domain: [yMin, yMax],
          range: [ySize, 0],
        })
      : scaleLinear({
          domain: [yMin, yMax],
          range: [ySize, 0],
        });

    console.log('Created scales - xScale domain:', xScale.domain(), 'yScale domain:', yScale.domain());

    return { xScale, yScale, groups, areaData, allPoints };
  }, [chartSettings?.chartData, xSize, ySize, chartSettings?.temporalSettings?.logScale]);

  // Create voronoi diagram for precise hover detection
  const voronoiLayout = useMemo(() => {
    if (!allPoints || !xScale || !yScale) return null;

    return voronoi({
      x: d => xScale(d.x),
      y: d => yScale(d.y),
      width: xSize,
      height: ySize
    })(allPoints);
  }, [allPoints, xScale, yScale, xSize, ySize]);

  // Listener para atualizações de seleção de outros gráficos
  useEffect(() => {
    const handleSelectionUpdate = (event) => {
      if (event.detail.chartId === chartSettings.chartId) {
        console.log('Received external selection for temporal chart:', chartSettings.chartId, event.detail.selection);
        setExternalSelection(event.detail.selection);
      }
    };

    document.addEventListener('chartSelectionUpdate', handleSelectionUpdate);
    
    return () => {
      document.removeEventListener('chartSelectionUpdate', handleSelectionUpdate);
    };
  }, [chartSettings.chartId]);

  // Função para determinar se uma série deve ser destacada
  const isSeriesHighlighted = useCallback((seriesName) => {
    if (externalSelection && externalSelection.size > 0) {
      // Se há seleção externa, verifica se algum ponto da série está selecionado
      return externalSelection.has(seriesName);
    }
    return true; // Se não há seleção externa, todas as séries são destacadas
  }, [externalSelection]);

  // Função para lidar com clique em séries para propagação
  const handleSeriesClick = useCallback((seriesName, event) => {
    event.stopPropagation();
    // Ao clicar, propaga a seleção dessa série
    const selection = new Set([seriesName]);
    if (chartSettings && chartSettings.propagateSelection) {
      chartSettings.propagateSelection(selection);
    }
  }, [chartSettings]);

  // Mouse handlers
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

  // Early return se não há dados válidos
  if (!chartSettings?.chartData || width < 10 || !xScale || !yScale) {
    console.log('Early return - missing data or invalid dimensions');
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ccc'
      }}>
        <Text textAnchor="middle" fontSize={14} fill="#666">
          Sem dados para exibir
        </Text>
      </div>
    );
  }

  return (
    <>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} />
        <Group top={margin.top} left={margin.left}>
          {/* Grid lines (optional) */}
          <g className="grid-lines" opacity={0.1}>
            {/* Vertical grid lines */}
            {xScale.ticks(Math.min(12, Math.floor(xSize / 50))).map((tick, i) => (
              <line
                key={`vgrid-${i}`}
                x1={xScale(tick)}
                y1={0}
                x2={xScale(tick)}
                y2={ySize}
                stroke="#999"
                strokeWidth={1}
              />
            ))}
            {/* Horizontal grid lines */}
            {yScale.ticks(Math.min(10, Math.floor(ySize / 30))).map((tick, i) => (
              <line
                key={`hgrid-${i}`}
                x1={0}
                y1={yScale(tick)}
                x2={xSize}
                y2={yScale(tick)}
                stroke="#999"
                strokeWidth={1}
              />
            ))}
          </g>
          {/* Draw areas if enabled */}
          {chartSettings.temporalSettings?.drawAreas && groups.map((group, groupIndex) => {
            const isHighlighted = isSeriesHighlighted(group);
            const areaPoints = areaData[group];
            
            console.log(`Rendering area for group ${group}:`, areaPoints);
            
            if (!areaPoints || areaPoints.length === 0) {
              console.log(`No area data for group ${group}`);
              return null;
            }
            
            return (
              <Area
                key={`area-${group}`}
                data={areaPoints}
                x={d => xScale(d.x)}
                y0={d => yScale(d.yMin)}
                y1={d => yScale(d.yMax)}
                fill={colors[groupIndex % colors.length]}
                opacity={isHighlighted ? 0.2 : 0.05}
                curve={curveLinear}
              />
            );
          })}

          {/* Draw lines for each series */}
          {groups.map((group, groupIndex) => {
            const isHighlighted = isSeriesHighlighted(group);
            const groupData = chartSettings.chartData[group];
            
            console.log(`Rendering group ${group}:`, groupData);
            
            if (!groupData || typeof groupData !== 'object') {
              console.log(`No valid data for group ${group}`);
              return null;
            }
            
            return Object.entries(groupData).map(([simulation, points]) => {
              console.log(`Rendering line for ${group}-${simulation}:`, points);
              
              if (!Array.isArray(points) || points.length === 0) {
                console.log(`No valid points for ${group}-${simulation}`);
                return null;
              }

              // Converte pontos para formato padronizado
              const lineData = points.map(point => {
                if (Array.isArray(point)) {
                  return { x: point[0], y: point[1] };
                } else if (typeof point === 'object') {
                  return { 
                    x: point.x || point.time || point.year, 
                    y: point.y || point.value 
                  };
                }
                return null;
              }).filter(point => point && point.x !== undefined && point.y !== undefined);

              console.log(`Line data for ${group}-${simulation}:`, lineData);

              if (lineData.length === 0) {
                console.log(`No valid line data for ${group}-${simulation}`);
                return null;
              }

              return (
                <LinePath
                  key={`line-${group}-${simulation}`}
                  data={lineData}
                  x={d => xScale(d.x)}
                  y={d => yScale(d.y)}
                  stroke={colors[groupIndex % colors.length]}
                  strokeWidth={isHighlighted ? 2 : 0.5}
                  opacity={isHighlighted ? 1 : 0.3}
                  curve={curveLinear}
                  onClick={(event) => handleSeriesClick(group, event)}
                  onMouseEnter={() => setHoveredSeries(group)}
                  onMouseLeave={() => setHoveredSeries(null)}
                  style={{
                    cursor: 'pointer',
                    filter: hoveredSeries === group ? 'brightness(1.2)' : 'none'
                  }}
                />
              );
            });
          })}

          {/* Mouse detection area for tooltip */}
          <rect
            width={xSize}
            height={ySize}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'crosshair' }}
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

          {/* Draw highlighted points for selected series */}
          {externalSelection && externalSelection.size > 0 &&
            groups.map((group, groupIndex) => {
              if (!isSeriesHighlighted(group)) return null;
              
              const groupData = chartSettings.chartData[group];
              if (!groupData || typeof groupData !== 'object') return null;
              
              return Object.entries(groupData).map(([simulation, points]) => {
                if (!Array.isArray(points)) return null;
                
                return points.map((point, pointIndex) => {
                  let x, y;
                  if (Array.isArray(point)) {
                    [x, y] = point;
                  } else if (typeof point === 'object') {
                    x = point.x || point.time || point.year;
                    y = point.y || point.value;
                  }
                  
                  if (x === undefined || y === undefined) return null;
                  
                  return (
                    <Circle
                      key={`point-${group}-${simulation}-${pointIndex}`}
                      cx={xScale(x)}
                      cy={yScale(y)}
                      r={3}
                      fill={colors[groupIndex % colors.length]}
                      stroke="#000"
                      strokeWidth={1}
                      opacity={0.8}
                    />
                  );
                });
              });
            })
          }

          {/* X-axis with values */}
          <AxisBottom
            top={ySize}
            scale={xScale}
            numTicks={Math.min(12, Math.floor(xSize / 50))}
            stroke="#333"
            tickStroke="#333"
            tickFormat={(value) => {
              // Formato mais legível para anos/tempo
              if (value >= 1000) {
                return Math.round(value).toString();
              } else {
                return value.toFixed(1);
              }
            }}
            tickLabelProps={() => ({
              fill: '#333',
              fontSize: 9,
              textAnchor: 'middle',
            })}
          />

          {/* Y-axis with values */}
          <AxisLeft
            scale={yScale}
            numTicks={Math.min(10, Math.floor(ySize / 30))}
            stroke="#333"
            tickStroke="#333"
            tickFormat={(value) => {
              // Opção 1: Notação científica para valores grandes
              if (Math.abs(value) >= 1000000) {
                return value.toExponential(1);
              } else if (Math.abs(value) >= 1000) {
                return Math.round(value).toLocaleString();
              } else {
                return value.toFixed(2);
              }
            }}
            tickLabelProps={() => ({
              fill: '#333',
              fontSize: 9,
              textAnchor: 'end',
              dx: '-0.25em',
              dy: '0.25em',
            })}
          />

          {/* Axis labels */}
          <Text
            x={xSize / 2}
            y={ySize + 40}
            textAnchor="middle"
            fontSize={11}
            fill="#333"
            fontWeight="bold"
          >
            Tempo
          </Text>
          <Text
            x={-ySize / 2}
            y={-40}
            textAnchor="middle"
            fontSize={11}
            fill="#333"
            fontWeight="bold"
            transform={`rotate(-90, ${-ySize / 2}, -40)`}
          >
            {chartSettings.temporalSettings?.temporalVariable || 'Valor'}
          </Text>
        </Group>

        {/* Legend */}
        <Group top={legendMargin.top} left={margin.left + xSize + legendMargin.left}>
          {groups.map((group, i) => {
            const isHighlighted = isSeriesHighlighted(group);
            return (
              <React.Fragment key={`legend-${group}`}>
                <circle
                  cx={0}
                  cy={i * 20}
                  r={6}
                  fill={colors[i % colors.length]}
                  opacity={isHighlighted ? 1 : 0.5}
                  stroke={isHighlighted && externalSelection ? '#000' : 'none'}
                  strokeWidth={isHighlighted && externalSelection ? 2 : 0}
                  style={{ cursor: 'pointer' }}
                  onClick={(event) => handleSeriesClick(group, event)}
                />
                <Text
                  x={12}
                  y={i * 20}
                  dy=".35em"
                  textAnchor="start"
                  fontSize={10}
                  opacity={isHighlighted ? 1 : 0.5}
                  style={{ cursor: 'pointer' }}
                  onClick={(event) => handleSeriesClick(group, event)}
                >
                  {group}
                </Text>
              </React.Fragment>
            );
          })}
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
              {tooltipData.group}
            </div>
            <div style={{ fontSize: '9px' }}>Simulation: {tooltipData.simulation}</div>
            <div style={{ fontSize: '9px' }}>
              {typeof tooltipData.year === 'number' ? 
                (tooltipData.year >= 1000 ? Math.round(tooltipData.year) : tooltipData.year.toFixed(1)) : 
                tooltipData.year
              }: {typeof tooltipData.value === 'number' ? tooltipData.value.toFixed(3) : tooltipData.value}
            </div>
          </div>
        </Tooltip>
      )}
    </>
  );
}

export default memo(TemporalPlot)