import React, { useEffect, useRef, useState, memo } from "react";
import { ChartSettings } from "utils/ChartSettings";
import { ChartType } from "utils/ChartType";
import { ChartOptions } from "utils/ChartOptions";
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";
import closeIcon from "../Images/close.png";
import optionsIcon from "../Images/options.png";
import parentIcon from "../Images/arrow-small-up.png";
import ModalChartSettings from "./ModalChartSettings";
import CorrelationMatrix from "./Charts/CorrelationMatrix";
import DRScatterPlot from "./Charts/DRScatterPlot";
import TemporalPlot from "./Charts/TemporalPlot";

import "@xyflow/react/dist/base.css";

const MINWIDTH = 200,
  MINHEIGHT = 200;

// Função auxiliar para processar dados do backend
const processBackendData = (data, chartType) => {
  if (!data || typeof data !== 'object') {
    console.warn('Dados inválidos recebidos do backend:', data);
    return {};
  }
  
  // Caso específico para dados de DR
  if (chartType === ChartType.DR) {
    const processedData = {};
    
    // Para cada ensemble na resposta
    Object.keys(data).forEach(ensemble => {
      // Obter os dados do ensemble
      const ensembleData = data[ensemble];
      
      // Processar os dados dependendo do formato
      if (Array.isArray(ensembleData)) {
        // Se já for um array, processar cada item
        processedData[ensemble] = ensembleData.map(item => {
          // Se for objeto com record_object, extrair as propriedades
          if (item && item.record_object) {
            return {
              name: item.name || item.record_object.name || 'unnamed',
              x: item.record_object.x,
              y: item.record_object.y
            };
          }
          // Se já tiver propriedades x e y, manter como está
          else if (item && 'x' in item && 'y' in item) {
            return {
              name: item.name || 'unnamed',
              x: item.x,
              y: item.y
            };
          }
          // Se for um array de coordenadas
          else if (Array.isArray(item) && item.length >= 2) {
            return {
              name: item[2] || 'unnamed',
              x: item[0],
              y: item[1]
            };
          }
          // Caso contrário, retornar objeto padrão
          else {
            console.warn('Formato de ponto inválido:', item);
            return { name: 'invalid', x: 0, y: 0 };
          }
        });
      }
      // Se for string (possível JSON)
      else if (typeof ensembleData === 'string') {
        try {
          // Tentar fazer parse
          const parsedData = JSON.parse(ensembleData);
          
          if (Array.isArray(parsedData)) {
            processedData[ensemble] = parsedData.map(item => {
              if (typeof item === 'object' && item !== null) {
                return {
                  name: item.name || 'unnamed',
                  x: item.x !== undefined ? item.x : 0,
                  y: item.y !== undefined ? item.y : 0
                };
              } else {
                return { name: 'invalid', x: 0, y: 0 };
              }
            });
          } else {
            processedData[ensemble] = [];
          }
        } catch (e) {
          console.error('Erro ao processar JSON para ensemble', ensemble, e);
          processedData[ensemble] = [];
        }
      }
      // Se for objeto (não array)
      else if (typeof ensembleData === 'object' && ensembleData !== null) {
        const points = [];
        
        // Tentar extrair pontos do objeto
        for (const key in ensembleData) {
          const item = ensembleData[key];
          
          if (typeof item === 'object' && item !== null) {
            points.push({
              name: item.name || key,
              x: item.x !== undefined ? item.x : 0,
              y: item.y !== undefined ? item.y : 0
            });
          }
        }
        
        processedData[ensemble] = points;
      }
      // Caso contrário, usar array vazio
      else {
        console.warn('Dados inválidos para ensemble', ensemble, ensembleData);
        processedData[ensemble] = [];
      }
    });
    
    return processedData;
  }
  
  // Para outros tipos de gráfico, manter os dados originais
  return data;
};

const DraggableWindow = ({ data }) => {
  let chartSettings = data.chartSettings;
  const closeWindow = data.closeWindow;
  const container = useRef(null);
  const resizible = useRef(null);
  const windowBodyId = "window-body-" + chartSettings.chartId;

  const [currentChartSettings, setCurrentChartSettings] = useState(chartSettings);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [dimensions, setDimensions] = useState([MINWIDTH, MINHEIGHT - 64]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  let modalTitle = "Chart settings for " + currentChartSettings.chartTitle;

  const openSettings = (e) => {
    setIsOpenModal(true);
  };

  const saveChartSettings = (modifiedChartSettings) => {
    setCurrentChartSettings(modifiedChartSettings);
    setIsOpenModal(!isOpenModal);
  };

  const closeWindowPressed = (e) => {
    closeWindow(chartSettings.chartId);
  };

  // Função para criar dados de exemplo quando não há dados reais
  const createSyntheticData = () => {
    console.log("Criando dados sintéticos para debug");
    
    // Dados básicos para diferentes tipos de gráfico
    switch (currentChartSettings.chartType) {
      case ChartType.DR:
        return {
          'Região Norte': Array(5).fill().map((_, i) => ({
            name: `Simulação ${i+1}`,
            x: Math.random() * 10 - 5,
            y: Math.random() * 10 - 5
          })),
          'Região Nordeste': Array(5).fill().map((_, i) => ({
            name: `Simulação ${i+6}`,
            x: Math.random() * 10,
            y: Math.random() * 10
          })),
          'Região Sudeste': Array(5).fill().map((_, i) => ({
            name: `Simulação ${i+11}`,
            x: Math.random() * 5,
            y: Math.random() * -10
          }))
        };
        
      case ChartType.CORRELATIONMATRIX:
        const variables = ['Var1', 'Var2', 'Var3', 'Var4', 'Var5'];
        const matrix = {};
        
        variables.forEach(v1 => {
          matrix[v1] = {};
          variables.forEach(v2 => {
            if (v1 === v2) {
              matrix[v1][v2] = 1.0;
            } else {
              matrix[v1][v2] = Math.random() * 2 - 1; // -1 a 1
            }
          });
        });
        
        return matrix;
        
      case ChartType.TEMPORAL:
        return {
          'Região Norte': {
            'Sim1': Array(10).fill().map((_, i) => [2015 + i, Math.random() * 100]),
            'Sim2': Array(10).fill().map((_, i) => [2015 + i, Math.random() * 100 + 50])
          },
          'Região Nordeste': {
            'Sim3': Array(10).fill().map((_, i) => [2015 + i, Math.random() * 100 + 100]),
            'Sim4': Array(10).fill().map((_, i) => [2015 + i, Math.random() * 100 + 150])
          }
        };
        
      default:
        return {
          'Região Norte': Array(5).fill().map((_, i) => ({
            name: `Simulação ${i+1}`,
            x: Math.random() * 10 - 5,
            y: Math.random() * 10 - 5
          }))
        };
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Depuração: log do URL da requisição
    const url = process.env.REACT_APP_BACKEND_URL + currentChartSettings.getRestUrl();
    console.log("Fazendo requisição para:", url);
    
    // Verificar se a URL é apenas "/"
    if (url.endsWith('/') && url.indexOf('?') === -1) {
      console.warn("URL inválida: apenas raiz. Usando URL default para o tipo de gráfico.");
      
      // Construir URL padrão baseada no tipo de gráfico
      let defaultUrl = process.env.REACT_APP_BACKEND_URL;
      
      switch (currentChartSettings.chartType) {
        case ChartType.DR:
          defaultUrl += "/dimensional-reduction?method=PCA";
          break;
        case ChartType.TEMPORAL:
          defaultUrl += "/temporal-evolution";
          break;
        case ChartType.CORRELATIONMATRIX:
          defaultUrl += "/correlation-matrix";
          break;
        default:
          defaultUrl += "/dimensional-reduction";
      }
      
      console.log("Usando URL padrão:", defaultUrl);
      
      // Fazer requisição para a URL padrão
      fetch(defaultUrl)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Erro na requisição: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(dataResponse => {
          console.log("Dados recebidos:", dataResponse);
          
          // Processar os dados
          const processedData = processBackendData(dataResponse, currentChartSettings.chartType);
          console.log("Dados processados:", processedData);
          
          // Verificar se temos dados válidos
          if (!processedData || Object.keys(processedData).length === 0) {
            console.warn("Nenhum dado válido retornado pela API, usando dados sintéticos");
            
            // Criar dados sintéticos
            const syntheticData = createSyntheticData();
            setChartData(syntheticData);
            currentChartSettings.chartData = syntheticData;
          } else {
            // Usar os dados reais
            setChartData(processedData);
            currentChartSettings.chartData = processedData;
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar dados:", err);
          
          // Em caso de erro, usar dados sintéticos
          console.log("Usando dados sintéticos devido ao erro");
          const syntheticData = createSyntheticData();
          setChartData(syntheticData);
          currentChartSettings.chartData = syntheticData;
          
          setError(err.message);
          setLoading(false);
        });
      
      return;
    }
    
    // URL normal - fazer requisição normalmente
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro na requisição: ${res.status} ${res.statusText}`);
        }
        console.log("Resposta recebida:", res);
        return res.json();
      })
      .then((dataResponse) => {
        console.log("Dados recebidos:", dataResponse);
        
        // Processar os dados dependendo do tipo de gráfico
        const processedData = processBackendData(dataResponse, currentChartSettings.chartType);
        console.log("Dados processados:", processedData);
        
        // Verificar se temos dados processados
        if (!processedData || Object.keys(processedData).length === 0) {
          console.warn("Nenhum dado processado para exibir, usando dados sintéticos");
          
          // Criar dados sintéticos
          const syntheticData = createSyntheticData();
          setChartData(syntheticData);
          currentChartSettings.chartData = syntheticData;
        } else {
          // Usar os dados reais
          setChartData(processedData);
          currentChartSettings.chartData = processedData;
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
        
        // Em caso de erro, usar dados sintéticos
        console.log("Usando dados sintéticos devido ao erro");
        const syntheticData = createSyntheticData();
        setChartData(syntheticData);
        currentChartSettings.chartData = syntheticData;
        
        setError(err.message);
        setLoading(false);
      });
  }, [currentChartSettings.getRestUrl()]);

  // Renderização do título com depuração
  const displayTitle = typeof currentChartSettings.chartTitle === 'string' 
    ? currentChartSettings.chartTitle 
    : 'Visualization';

  return (
    <>
      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 border-2 border-black bg-white !z-50"
        id="top-target"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="w-2 h-2 border-2 border-black bg-white !z-50"
        id="top-source"
      />

      {/* Right handles */}
      <Handle
        type="target"
        position={Position.Right}
        className="w-2 h-2 border-2 border-black bg-white !z-50"
        id="right-target"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 border-2 border-black bg-white !z-50"
        id="right-source"
      />

      {/* Bottom handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        className="w-2 h-2 border-2 border-black bg-white !z-50"
        id="bottom-target"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 border-2 border-black bg-white !z-50"
        id="bottom-source"
      />

      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 border-2 border-black bg-white !z-50"
        id="left-target"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-2 h-2 border-2 border-black bg-white !z-50"
        id="left-source"
      />

      <NodeResizer
        minWidth={MINWIDTH}
        minHeight={MINHEIGHT}
        onResizeEnd={() => {
          const plotWidth = container.current.offsetWidth;
          const plotHeight = container.current.offsetHeight;
          setDimensions([plotWidth, plotHeight]);
        }}
      />
      <div
        id={"viz-" + chartSettings.chartId}
        ref={resizible}
        className="flex flex-col items-stretch min-w-full min-h-full max-w-full max-h-full border-2 overflow-clip"
      >
        <div className="handle justify-items-stretch">
          <div
            id="header"
            className="bg-gray-300 px-2 h-16 flex flex-row space-x-2 rounded"
          >
            <div className="grow place-self-center">
              <h2 className="text-center">{displayTitle}</h2>
            </div>
            <div className="place-self-center flex justify-end space-x-2">
              <button
                className="border-2 border-black rounded-lg p-1"
                onClick={openSettings}
              >
                <img
                  src={optionsIcon}
                  width="24"
                  height="24"
                  alt="chart options window"
                />
              </button>
              <button
                className="border-2 border-black rounded-lg p-1"
                onClick={closeWindowPressed}
              >
                <img
                  src={closeIcon}
                  width="24"
                  height="24"
                  alt="close window"
                />
              </button>
            </div>
          </div>
        </div>
        <div
          id={windowBodyId}
          className="flex items-center flex-auto max-w-full max-h-full overflow-auto"
          ref={container}
        >
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <p>Carregando dados...</p>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center">
              <p>Erro ao carregar dados: {error}</p>
              <p>Usando dados de exemplo para visualização.</p>
            </div>
          ) : !currentChartSettings.chartData || 
              Object.keys(currentChartSettings.chartData).length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <p>Nenhum dado disponível para visualização. Verifique as seleções de ensemble e simulação.</p>
            </div>
          ) : (
            <>
              {currentChartSettings.chartType === ChartType.CORRELATIONMATRIX ? (
                <CorrelationMatrix
                  width={dimensions[0]}
                  height={dimensions[1]}
                  chartSettings={currentChartSettings}
                />
              ) : currentChartSettings.chartType === ChartType.DR ? (
                <DRScatterPlot
                  width={dimensions[0]}
                  height={dimensions[1]}
                  chartSettings={currentChartSettings}
                />
              ) : (
                <TemporalPlot
                  width={dimensions[0]}
                  height={dimensions[1]}
                  chartSettings={currentChartSettings}
                />
              )}
            </>
          )}
        </div>
      </div>
      <ModalChartSettings
        isOpen={isOpenModal}
        setIsOpenModal={() => setIsOpenModal(!isOpenModal)}
        title={modalTitle}
        chartSettings={currentChartSettings}
        saveChartSettings={saveChartSettings}
        dimensions={dimensions}
      ></ModalChartSettings>
    </>
  );
};

export default memo(DraggableWindow);