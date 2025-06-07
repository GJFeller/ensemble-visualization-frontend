import EnsembleSideBar from "./Layout/EnsembleSideBar/EnsembleSideBar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import VisualizationMain from "./Layout/VisualizationMain/VisualizationMain";
import { useState, useEffect } from "react";
import { ChartSettings } from "utils/ChartSettings";
import { ChartType } from "utils/ChartType";
import { ChartOptions } from "utils/ChartOptions";

import "./App.css";

let plotId = 0;

function App() {
  const [visualizationTreeRootList, setVisualizationList] = useState([]);
  const [debugInfo, setDebugInfo] = useState({
    backendUrl: process.env.REACT_APP_BACKEND_URL || 'Não definida',
    chartTypes: [],
    createdCharts: 0,
    lastRequestUrl: '',
    ensemblesSelected: [],
    simulationsSelected: []
  });

  // Efeito para verificar se tudo está configurado corretamente
  useEffect(() => {
    console.log("Verificando configuração do aplicativo:");
    
    // Verificar URL do backend
    if (!process.env.REACT_APP_BACKEND_URL) {
      console.error("REACT_APP_BACKEND_URL não está definida!");
      setDebugInfo(prev => ({
        ...prev,
        backendError: "REACT_APP_BACKEND_URL não está definida!"
      }));
    } else {
      console.log("REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);
    }
    
    // Verificar ChartType
    if (!ChartType) {
      console.error("ChartType não está definido!");
      setDebugInfo(prev => ({
        ...prev,
        chartTypeError: "ChartType não está definido!"
      }));
    } else {
      console.log("ChartType disponível:", ChartType);
      setDebugInfo(prev => ({
        ...prev,
        chartTypes: Object.keys(ChartType).filter(key => typeof ChartType[key] !== 'function')
      }));
    }
    
    // Verificar ChartOptions
    if (!ChartOptions) {
      console.error("ChartOptions não está definido!");
      setDebugInfo(prev => ({
        ...prev,
        chartOptionsError: "ChartOptions não está definido!"
      }));
    } else {
      console.log("ChartOptions disponível:", ChartOptions);
    }
    
    // Fazer uma requisição de teste para o backend
    if (process.env.REACT_APP_BACKEND_URL) {
      console.log("Testando conexão com o backend...");
      
      fetch(`${process.env.REACT_APP_BACKEND_URL}/variables`)
        .then(res => {
          console.log("Resposta do teste de conexão:", res);
          if (res.ok) {
            setDebugInfo(prev => ({
              ...prev,
              connectionTest: "Conexão com backend OK"
            }));
          } else {
            setDebugInfo(prev => ({
              ...prev,
              connectionTest: `Erro: ${res.status} ${res.statusText}`
            }));
          }
          return res.json();
        })
        .then(data => {
          console.log("Dados do teste de conexão:", data);
          setDebugInfo(prev => ({
            ...prev,
            variables: Array.isArray(data) ? data : ["Formato de dados inesperado"]
          }));
        })
        .catch(err => {
          console.error("Erro no teste de conexão:", err);
          setDebugInfo(prev => ({
            ...prev,
            connectionTest: `Erro: ${err.message}`
          }));
        });
    }
  }, []);

  const closeWindow = (id) => {
    const newVisualizationTreeRootList = visualizationTreeRootList.filter(
      (el) => el.chartId !== id,
    );
    setVisualizationList(newVisualizationTreeRootList);
  };

  const createChart = (chartType = [], treeData = []) => {
    // Debug
    console.log("Função createChart chamada com:");
    console.log("- chartType:", chartType);
    console.log("- treeData:", treeData);
    
    let selectedEnsembleList = [];
    let selectedSimulationList = [];
    
    for (const ensembleNode of treeData) {
      if (ensembleNode.isChecked) {
        selectedEnsembleList.push(ensembleNode.label);
        for (const simulationNode of ensembleNode.children) {
          if (simulationNode.isChecked)
            selectedSimulationList.push(simulationNode.label);
        }
      }
    }
    
    // Debug
    console.log("- selectedEnsembleList:", selectedEnsembleList);
    console.log("- selectedSimulationList:", selectedSimulationList);
    
    // Atualizar informações de debug
    setDebugInfo(prev => ({
      ...prev,
      ensemblesSelected: selectedEnsembleList,
      simulationsSelected: selectedSimulationList,
      createdCharts: prev.createdCharts + chartType.length
    }));
    
    const newChartTreeRootList = [];
    
    for (const newChart of chartType) {
      console.log("Criando gráfico do tipo:", newChart);
      
      let chartSettings = new ChartSettings(
        newChart,
        `Gráfico ${ChartType ? 
          (typeof ChartType.getDisplayName === 'function' ? 
            ChartType.getDisplayName(newChart) : 
            newChart) : 
          newChart}`,
        "plot-" + plotId++,
      );
      
      console.log("ChartSettings criado:", chartSettings);
      
      chartSettings.ensembleList = [...selectedEnsembleList];
      chartSettings.simulationList = [...selectedSimulationList];
      
      // Debug - verificar a URL que será usada
      const restUrl = chartSettings.getRestUrl();
      console.log("URL que será usada para buscar dados:", restUrl);
      
      setDebugInfo(prev => ({
        ...prev,
        lastRequestUrl: restUrl
      }));
      
      // Adicionar log para verificar as propriedades do objeto chartSettings
      console.log("Propriedades de chartSettings:");
      console.log("- chartType:", chartSettings.chartType);
      console.log("- ensembleList:", chartSettings.ensembleList);
      console.log("- simulationList:", chartSettings.simulationList);
      console.log("- drSettings:", chartSettings.drSettings);
      console.log("- temporalSettings:", chartSettings.temporalSettings);
      
      newChartTreeRootList.push(chartSettings);
    }
    
    console.log("Novos gráficos a serem adicionados:", newChartTreeRootList);
    
    setVisualizationList([
      ...visualizationTreeRootList,
      ...newChartTreeRootList,
    ]);
  };

  return (
    <div className="bg-slate-400">
      {/* Painel de Debug */}
      <div className="bg-white p-2 mb-2 text-xs">
        <h2 className="font-bold">Informações de Debug</h2>
        <div>
          <p>Backend URL: {debugInfo.backendUrl}</p>
          <p>ChartTypes disponíveis: {debugInfo.chartTypes.join(', ')}</p>
          <p>Último teste de conexão: {debugInfo.connectionTest || 'Não realizado'}</p>
          <p>Gráficos criados: {debugInfo.createdCharts}</p>
          <p>Última URL de requisição: {debugInfo.lastRequestUrl || 'Nenhuma'}</p>
          <p>Ensembles selecionados: {debugInfo.ensemblesSelected.join(', ') || 'Nenhum'}</p>
          <p>Simulações selecionadas: {debugInfo.simulationsSelected.join(', ') || 'Nenhuma'}</p>
          {debugInfo.backendError && <p className="text-red-500">Erro: {debugInfo.backendError}</p>}
          {debugInfo.chartTypeError && <p className="text-red-500">Erro: {debugInfo.chartTypeError}</p>}
          {debugInfo.chartOptionsError && <p className="text-red-500">Erro: {debugInfo.chartOptionsError}</p>}
        </div>
      </div>
      
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel minSize={20} maxSize={20}>
          <div className="min-h-screen bg-slate-400">
            <EnsembleSideBar onCreateChart={createChart}></EnsembleSideBar>
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel>
          <VisualizationMain
            vizTreeRootList={visualizationTreeRootList}
            closeWindow={closeWindow}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;