import React, { useState, memo, useMemo, useRef, useEffect } from 'react';
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

// Updated color palette to match the main branch
const COLORS = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"];

// Função auxiliar para garantir que um valor seja um array
const ensureArray = (value) => Array.isArray(value) ? value : [];

function TemporalPlot({
  width,
  height,
  chartSettings,
  events = false,
  margin = defaultMargin,
}) {
  const svgRef = useRef(null);
  
  // Chart sizes
  const xSize = width > margin.left + margin.right
    ? width - margin.left - margin.right
    : width;
  const ySize = height > margin.bottom + margin.top
    ? height - margin.bottom - margin.top
    : height;

  // Background color
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
  
  // Garantir que o gráfico se ajuste ao tamanho do contêiner
  useEffect(() => {
    if (svgRef.current && width > 0 && height > 0) {
      svgRef.current.setAttribute('width', width);
      svgRef.current.setAttribute('height', height);
      
      // Log para debug
      console.log(`TemporalPlot - Dimensões atualizadas: ${width}x${height}`);
    }
  }, [width, height]);

  // Process data and create scales
  const { xScale, yScale, groups, areaData, allPoints } = useMemo(() => {
    // Verificações de segurança
    if (!chartSettings?.chartData) {
      return { xScale: null, yScale: null, groups: [], areaData: {}, allPoints: [] };
    }

    // Garantir que chartData é um objeto
    if (typeof chartSettings.chartData !== 'object' || chartSettings.chartData === null) {
      console.error("chartData não é um objeto válido:", chartSettings.chartData);
      return { xScale: null, yScale: null, groups: [], areaData: {}, allPoints: [] };
    }

    // Obter grupos e verificar se são válidos
    const groups = Object.keys(chartSettings.chartData);
    if (groups.length === 0) {
      console.warn("Nenhum grupo encontrado em chartData");
      return { xScale: null, yScale: null, groups: [], areaData: {}, allPoints: [] };
    }

    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    const areaData = {};
    const allPoints = [];

    // Process data to find bounds and create area data
    groups.forEach(group => {
      const timePoints = new Map();
      
      // Verificar se chartSettings.chartData[group] é um objeto
      if (!chartSettings.chartData[group] || typeof chartSettings.chartData[group] !== 'object') {
        console.warn(`Grupo ${group} não contém dados válidos`);
        return; // Skip this group
      }

      Object.entries(chartSettings.chartData[group]).forEach(([simulation, points]) => {
        // Verificar se points é um array
        if (!Array.isArray(points)) {
          console.warn(`Pontos para ${group}.${simulation} não é um array:`, points);
          return; // Skip this simulation
        }

        // Agora é seguro fazer forEach
        points.forEach(point => {
          // Verificar se point é um array ou objeto com propriedades
          if (!Array.isArray(point) && typeof point !== 'object') {
            console.warn(`Ponto inválido em ${group}.${simulation}:`, point);
            return; // Skip this point
          }

          // Extrair coordenadas x e y do ponto
          let x, y;
          if (Array.isArray(point)) {
            [x, y] = point;
          } else {
            x = point.x !== undefined ? point.x : point.time;
            y = point.y !== undefined ? point.y : point.value;
          }

          // Verificar se x e y são números válidos
          if (typeof x !== 'number' || typeof y !== 'number' || 
              isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
            console.warn(`Coordenadas inválidas em ${group}.${simulation}:`, x, y);
            return; // Skip this point
          }

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

      // Criar dados de área apenas se houver pontos
      if (timePoints.size > 0) {
        areaData[group] = Array.from(timePoints.entries())
          .sort(([a], [b]) => a - b)
          .map(([x, { min, max }]) => ({
            x,
            yMin: min,
            yMax: max
          }));
      } else {
        areaData[group] = [];
      }
    });

    // Verificar se temos pontos após o processamento
    if (allPoints.length === 0) {
      console.warn("Nenhum ponto válido encontrado após processamento");
      return { xScale: null, yScale: null, groups: [], areaData: {}, allPoints: [] };
    }

    // Verificar os limites
    if (!isFinite(xMin) || !isFinite(xMax) || !isFinite(yMin) || !isFinite(yMax)) {
      console.error("Limites inválidos:", { xMin, xMax, yMin, yMax });
      // Usar valores padrão para limites
      xMin = 0;
      xMax = 1;
      yMin = 0;
      yMax = 1;
    }

    // Adicionar um pouco de espaço para melhor visualização
    const xPadding = (xMax - xMin) * 0.05;
    const yPadding = (yMax - yMin) * 0.05;

    const xScale = scaleLinear({
      domain: [xMin - xPadding, xMax + xPadding],
      range: [0, xSize],
    });

    const yScale = chartSettings.temporalSettings?.logScale
      ? scaleSymlog({
          domain: [yMin - yPadding, yMax + yPadding],
          range: [ySize, 0],
        })
      : scaleLinear({
          domain: [yMin - yPadding, yMax + yPadding],
          range: [ySize, 0],
        });

    return { xScale, yScale, groups, areaData, allPoints };
  }, [chartSettings?.chartData, xSize, ySize, chartSettings?.temporalSettings?.logScale]);

  // Create voronoi diagram
  const voronoiLayout = useMemo(() => {
    if (!allPoints || !xScale || !yScale || allPoints.length === 0) return null;

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
    if (!coords) return;
    
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
        color: COLORS[groups.indexOf(group) % COLORS.length]
      });
    }
  };

  const handleMouseLeave = () => {
    tooltipTimeout = window.setTimeout(() => {
      hideTooltip();
      setHoverPoint(null);
    }, 300);
  };

  // Renderizar mensagem se não houver dados
  if (!chartSettings?.chartData || width < 10 || !xScale || !yScale || groups.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Não há dados disponíveis para visualização</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg 
        ref={svgRef}
        width={width} 
        height={height}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <rect x={0} y={0} width={width} height={height} fill={background} />
        <Group top={margin.top} left={margin.left}>
          {/* Draw areas */}
          {chartSettings.temporalSettings?.drawAreas && groups.map((group, groupIndex) => {
            // Verificar se areaData[group] existe e tem elementos
            if (!areaData[group] || areaData[group].length === 0) return null;
            
            return (
              <Area
                key={`area-${group}`}
                data={areaData[group]}
                x={d => xScale(d.x)}
                y0={d => yScale(d.yMin)}
                y1={d => yScale(d.yMax)}
                fill={COLORS[groupIndex % COLORS.length]}
                opacity={0.2}
                curve={curveLinear}
              />
            );
          })}

          {/* Draw lines */}
          {groups.map((group, groupIndex) => {
            // Verificar se chartSettings.chartData[group] existe
            if (!chartSettings.chartData[group]) return null;
            
            return Object.entries(chartSettings.chartData[group]).map(([simulation, points]) => {
              // Verificar se points é um array e tem elementos
              if (!Array.isArray(points) || points.length === 0) return null;
              
              const processedPoints = points.map(p => {
                if (Array.isArray(p)) {
                  return { x: p[0], y: p[1] };
                } else if (typeof p === 'object') {
                  return { 
                    x: p.x !== undefined ? p.x : p.time, 
                    y: p.y !== undefined ? p.y : p.value 
                  };
                }
                return null;
              }).filter(p => p !== null && 
                            typeof p.x === 'number' && 
                            typeof p.y === 'number' &&
                            isFinite(p.x) && 
                            isFinite(p.y));
              
              // Se não houver pontos processados válidos, não renderizar
              if (processedPoints.length === 0) return null;
              
              return (
                <LinePath
                  key={`line-${group}-${simulation}`}
                  data={processedPoints}
                  x={d => xScale(d.x)}
                  y={d => yScale(d.y)}
                  stroke={COLORS[groupIndex % COLORS.length]}
                  strokeWidth={1}
                  curve={curveLinear}
                />
              );
            });
          })}

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
                fill={COLORS[i % COLORS.length]}
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
    </div>
  );
}

export default memo(TemporalPlot);