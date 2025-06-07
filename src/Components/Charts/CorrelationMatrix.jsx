import React, { memo, useMemo, useRef, useEffect } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { Text } from '@visx/text';
import { localPoint } from '@visx/event';

const DEFAULT_MARGIN = { top: 10, left: 10, right: 40, bottom: 10 };
const LEGEND_MARGIN = { top: 10, left: 10, right: 10, bottom: 10 };
const TOOLTIP_STYLES = {
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
  padding: '4px 6px',
  borderRadius: '3px',
  fontSize: '11px',
  lineHeight: '1.2',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 1000
};
const BACKGROUND_COLOR = 'transparent';
const TOOLTIP_HIDE_DELAY = 300;

// Mantendo as cores originais da matriz de correlação
const NEGATIVE_COLOR = 'tomato';
const NEUTRAL_COLOR = 'white';
const POSITIVE_COLOR = 'steelblue';

const ColorGradient = memo(() => (
  <defs>
    <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style={{ stopColor: NEGATIVE_COLOR }} />
      <stop offset="50%" style={{ stopColor: NEUTRAL_COLOR }} />
      <stop offset="100%" style={{ stopColor: POSITIVE_COLOR }} />
    </linearGradient>
  </defs>
));

const LegendText = memo(({ x, y, value }) => (
  <Text x={x} y={y} textAnchor="middle" fontSize={10}>
    {value}
  </Text>
));

const MatrixCell = memo(({ 
  row, 
  col, 
  value, 
  x, 
  y, 
  width, 
  height, 
  color, 
  events,
  onTooltipShow,
  onTooltipHide 
}) => (
  <rect
    x={x}
    y={y}
    width={width}
    height={height}
    fill={color}
    stroke="#ffffff"
    onClick={() => events && alert(`clicked: ${JSON.stringify(value)}`)}
    onMouseLeave={onTooltipHide}
    onMouseMove={(event) => {
      const coords = localPoint(event);
      onTooltipShow({
        row,
        col,
        value,
        coords
      });
    }}
  />
));

const Legend = memo(({ width, height, ySize, xOffset }) => (
  <Group top={LEGEND_MARGIN.top} left={xOffset}>
    <ColorGradient />
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill="url(#bar-gradient)"
      stroke="#ffffff"
    />
    <LegendText x={width + 10} y={5} value="-1.0" />
    <LegendText x={width + 10} y={ySize / 2 + 5} value="0.0" />
    <LegendText x={width + 10} y={ySize + 2.5} value="1.0" />
  </Group>
));

const TooltipContent = memo(({ data }) => (
  <div style={{ whiteSpace: 'nowrap' }}>
    <div>Row: {data.row}</div>
    <div>Column: {data.col}</div>
    <div>Value: {data.value.toFixed(3)}</div>
  </div>
));

const CorrelationMatrix = ({
  width,
  height,
  chartSettings,
  events = false,
  margin = DEFAULT_MARGIN,
  gap = 1,
}) => {
  const svgRef = useRef(null);
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltip();

  // Garantir que o gráfico se ajuste ao tamanho do contêiner
  useEffect(() => {
    if (svgRef.current && width > 0 && height > 0) {
      svgRef.current.setAttribute('width', width);
      svgRef.current.setAttribute('height', height);
      
      // Log para debug
      console.log(`CorrelationMatrix - Dimensões atualizadas: ${width}x${height}`);
    }
  }, [width, height]);

  // Memoize calculations
  const { xSize, ySize, rectWidth, rectHeight, variables, legendRectWidth, legendRectHeight, legendXOffset } = useMemo(() => {
    const xSize = Math.max(0, width - margin.left - margin.right);
    const ySize = Math.max(0, height - margin.bottom - margin.top);
    
    // Garantir que chartSettings.chartData existe e é um objeto
    if (!chartSettings?.chartData || typeof chartSettings.chartData !== 'object') {
      return {
        xSize,
        ySize,
        rectWidth: 0,
        rectHeight: 0,
        variables: [],
        legendRectWidth: 0,
        legendRectHeight: 0,
        legendXOffset: 0
      };
    }
    
    const variables = Object.keys(chartSettings.chartData);
    const rectWidth = variables.length ? (xSize - gap * (variables.length - 1)) / variables.length : 0;
    const rectHeight = variables.length ? (ySize - gap * (variables.length - 1)) / variables.length : 0;
    
    const legendRectWidth = (margin.right - LEGEND_MARGIN.left - LEGEND_MARGIN.right) / 2;
    const legendRectHeight = ySize;
    const legendXOffset = margin.left + xSize + LEGEND_MARGIN.left;

    return { xSize, ySize, rectWidth, rectHeight, variables, legendRectWidth, legendRectHeight, legendXOffset };
  }, [width, height, margin, gap, chartSettings?.chartData]);

  const colorScale = useMemo(() => 
    scaleLinear({
      domain: [-1, 0, 1],
      range: [NEGATIVE_COLOR, NEUTRAL_COLOR, POSITIVE_COLOR]
    })
  , []);

  const handleTooltipShow = ({ row, col, value, coords }) => {
    if (!coords) return;
    
    showTooltip({
      tooltipData: { row, col, value },
      tooltipTop: coords.y,
      tooltipLeft: coords.x,
    });
  };

  const handleTooltipHide = () => {
    setTimeout(() => {
      hideTooltip();
    }, TOOLTIP_HIDE_DELAY);
  };

  // Se não há dados ou o componente é muito pequeno
  if (!chartSettings?.chartData || 
      typeof chartSettings.chartData !== 'object' || 
      Object.keys(chartSettings.chartData).length === 0 || 
      width < 10) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffffff' 
      }}>
        <p>Não há dados para exibir</p>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <svg 
        ref={svgRef}
        width={width} 
        height={height}
        style={{ 
          background: 'white',
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      >
        <Group top={margin.top} left={margin.left}>
          {variables.map((row, i) =>
            variables.map((col, j) => {
              // Verificar se o valor existe e é um número
              const rawValue = chartSettings.chartData[row]?.[col];
              const value = typeof rawValue === 'number' && !isNaN(rawValue) ? rawValue : 0;
              
              return (
                <MatrixCell
                  key={`cell-${i}-${j}`}
                  row={row}
                  col={col}
                  value={value}
                  x={j * rectWidth + j * gap}
                  y={i * rectHeight + i * gap}
                  width={rectWidth}
                  height={rectHeight}
                  color={colorScale(value)}
                  events={events}
                  onTooltipShow={handleTooltipShow}
                  onTooltipHide={handleTooltipHide}
                />
              );
            })
          )}
        </Group>
        <Legend 
          width={legendRectWidth} 
          height={legendRectHeight} 
          ySize={ySize}
          xOffset={legendXOffset}
        />
      </svg>

      {tooltipData && (
        <div
          style={{
            position: 'absolute',
            left: tooltipLeft,
            top: tooltipTop,
            transform: 'translate(-50%, -100%)',
            ...TOOLTIP_STYLES
          }}
        >
          <TooltipContent data={tooltipData} />
        </div>
      )}
    </div>
  );
};

export default memo(CorrelationMatrix);