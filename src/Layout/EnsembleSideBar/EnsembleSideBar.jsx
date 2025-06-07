import React, { useEffect, useState } from "react";
import TreeView from "../../Components/TreeView";
import Accordion from "../../Components/Accordion";
import { ChartSettings } from "utils/ChartSettings";
import { ChartType } from "utils/ChartType";
import { ChartOptions } from "utils/ChartOptions";

export default function EnsembleSideBar({
  onCreateChart = () => {},
  restRoute = "/list-ensembles",
}) {
  const [treeData, setTreeData] = useState([]);
  const [selectedChartTypes, setSelectedChartTypes] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ensembleList, setEnsembleList] = useState([]);

  useEffect(() => {
    console.log("Carregando dados de ensembles de:", process.env.REACT_APP_BACKEND_URL + restRoute);
    setIsLoading(true);
    
    fetch(process.env.REACT_APP_BACKEND_URL + restRoute)
      .then((res) => {
        console.log("Resposta recebida de list-ensembles:", res);
        return res.json();
      })
      .then((data) => {
        console.log("Dados de ensembles recebidos:", data);
        
        var keyIdx = 1;
        var tree = [];
        const ensembles = [];
        
        // Verifica se os dados estão no formato esperado
        if (typeof data !== 'object') {
          console.error("Dados recebidos não estão no formato esperado:", data);
          setDebugInfo(`Erro: Formato de dados inválido: ${JSON.stringify(data)}`);
          setIsLoading(false);
          return;
        }
        
        for (var ensemble in data) {
          ensembles.push(ensemble); // Guardar a lista de todos os ensembles
          
          var ensembleNode = {
            key: keyIdx++,
            label: ensemble,
            isChecked: true, // Pré-selecionar todos ensembles por padrão
            children: [],
          };
          
          // Verificar se data[ensemble] é um array
          if (!Array.isArray(data[ensemble])) {
            console.warn(`Data para ensemble ${ensemble} não é um array:`, data[ensemble]);
            // Tentar converter para array se for uma string
            if (typeof data[ensemble] === 'string') {
              try {
                const parsed = JSON.parse(data[ensemble]);
                data[ensemble] = Array.isArray(parsed) ? parsed : [data[ensemble]];
              } catch (e) {
                data[ensemble] = [data[ensemble]];
              }
            } else {
              data[ensemble] = [data[ensemble]];
            }
          }
          
          for (var [simIdx, simulation] of Object.entries(data[ensemble])) {
            var simulationNode = {
              key: keyIdx++,
              label: simulation,
              isChecked: true, // Pré-selecionar todas simulações por padrão
            };
            ensembleNode.children.push(simulationNode);
          }
          tree.push(ensembleNode);
        }
        
        console.log("Dados de árvore processados:", tree);
        setEnsembleList(ensembles);
        setTreeData(tree);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar dados de ensembles:", err);
        setDebugInfo(`Erro ao carregar ensembles: ${err.message}`);
        setIsLoading(false);
      });
  }, [restRoute]);

  const onCheckboxChange = (e) => {
    // Verificar se ChartType.fromChartTypeString existe
    if (!ChartType || typeof ChartType.fromChartTypeString !== 'function') {
      console.error("ChartType.fromChartTypeString não está definido");
      setDebugInfo("Erro: ChartType.fromChartTypeString não está definido");
      return;
    }
    
    const selectedType = ChartType.fromChartTypeString(
      e.target.id.replace("checkbox-", ""),
    );
    
    console.log("Tipo de gráfico selecionado:", selectedType);
    
    if (selectedChartTypes.includes(selectedType)) {
      setSelectedChartTypes((oldValues) => {
        return oldValues.filter((chartType) => chartType !== selectedType);
      });
    } else {
      setSelectedChartTypes([...selectedChartTypes, selectedType]);
    }
  };

  const handleCreateChart = () => {
    // Debug dos dados selecionados antes de enviar
    console.log("Criando gráfico com os seguintes dados:");
    console.log("- Tipos de gráficos selecionados:", selectedChartTypes);
    console.log("- Dados de árvore:", treeData);
    
    // Verificar se há tipos de gráficos selecionados
    if (!selectedChartTypes.length) {
      console.warn("Nenhum tipo de gráfico selecionado");
      setDebugInfo("Aviso: Nenhum tipo de gráfico selecionado");
      return;
    }
    
    // Verificar se há ensembles/simulações selecionados
    const selectedEnsembles = [];
    const selectedSimulations = [];
    
    for (const ensembleNode of treeData) {
      if (ensembleNode.isChecked) {
        selectedEnsembles.push(ensembleNode.label);
        
        for (const simulationNode of ensembleNode.children) {
          if (simulationNode.isChecked) {
            selectedSimulations.push(simulationNode.label);
          }
        }
      }
    }
    
    console.log("- Ensembles selecionados:", selectedEnsembles);
    console.log("- Simulações selecionadas:", selectedSimulations);
    
    // Se não houver ensembles selecionados, usar todos
    if (selectedEnsembles.length === 0) {
      console.warn("Nenhum ensemble selecionado, usando todos os ensembles disponíveis.");
      
      // Usar todos os ensembles da lista
      const allEnsembles = [...ensembleList];
      console.log("Todos os ensembles disponíveis:", allEnsembles);
      
      // Atualizar a árvore para marcar todos os ensembles e simulações
      const updatedTreeData = treeData.map(ensembleNode => ({
        ...ensembleNode,
        isChecked: true,
        children: ensembleNode.children.map(simulationNode => ({
          ...simulationNode,
          isChecked: true
        }))
      }));
      
      setTreeData(updatedTreeData);
      
      // Criar um novo array de chartTypes
      const newChartTreeRootList = [];
      
      for (const newChart of selectedChartTypes) {
        let chartSettings = new ChartSettings(
          newChart,
          `Gráfico ${ChartType.getDisplayName ? ChartType.getDisplayName(newChart) : newChart}`,
          "plot-" + Math.floor(Math.random() * 10000)  // ID aleatório para evitar colisões
        );
        
        // Definir ensembles e simulações diretamente
        chartSettings.ensembleList = allEnsembles;
        
        // Obter todas as simulações de todos os ensembles
        const allSimulations = [];
        for (const ensembleNode of treeData) {
          for (const simulationNode of ensembleNode.children) {
            allSimulations.push(simulationNode.label);
          }
        }
        
        chartSettings.simulationList = allSimulations;
        
        newChartTreeRootList.push(chartSettings);
      }
      
      // Chamar a função onCreateChart com os chartSettings criados diretamente
      onCreateChart(selectedChartTypes, updatedTreeData);
      
      return;
    }
    
    // Chamar a função onCreateChart normalmente se houver seleções
    onCreateChart(selectedChartTypes, treeData);
  };
  
  // Array de fallback caso ChartType.chartTypeList não exista
  const availableChartTypes = ChartType && Array.isArray(ChartType.chartTypeList) 
    ? ChartType.chartTypeList 
    : ['DR', 'TEMPORAL', 'CORRELATIONMATRIX'];

  // Pré-selecionar DR por padrão
  useEffect(() => {
    if (selectedChartTypes.length === 0 && availableChartTypes.includes('DR') && ChartType) {
      setSelectedChartTypes([ChartType.DR]);
    }
  }, [availableChartTypes]);

  return (
    <>
      <div className="border-1 rounded-md m-1">
        <Accordion title="Filter Options">
          <p>Selecione os filtros para visualização</p>
          {debugInfo && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-2">
              {debugInfo}
            </div>
          )}
        </Accordion>
      </div>
      <div className="border-1 rounded-md m-1 bg-gray-200 border-gray-200">
        {isLoading ? (
          <div className="p-2">Carregando dados...</div>
        ) : treeData.length === 0 ? (
          <div className="p-2">Nenhum dado disponível. Tente recarregar a página.</div>
        ) : (
          <TreeView treeData={treeData} />
        )}
      </div>
      <div className="border-1 rounded-md m-1 bg-gray-200 border-gray-200">
        <h1 className="p-2 font-bold">Select chart type</h1>
        <ul className="p-2">
          {availableChartTypes.map((chartType, index) => (
            <li key={`chartType-${index}`} className="mb-1">
              <input
                type="checkbox"
                id={`checkbox-${chartType}`}
                checked={selectedChartTypes.includes(
                  ChartType && typeof ChartType.fromChartTypeString === 'function'
                    ? ChartType.fromChartTypeString(chartType)
                    : chartType
                )}
                onChange={onCheckboxChange}
                className="mr-2"
              />
              <label htmlFor={`checkbox-${chartType}`}>{chartType}</label>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleCreateChart}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        Create chart
      </button>
      
      {/* Painel de Debug */}
      <div className="border-1 rounded-md m-1 mt-4 bg-gray-100 p-2">
        <h2 className="font-bold">Informações de Debug</h2>
        <div className="text-xs overflow-auto max-h-40">
          <p>Tipos selecionados: {selectedChartTypes.join(', ') || 'nenhum'}</p>
          <p>Ensembles carregados: {treeData.length}</p>
          <details>
            <summary>Dados da árvore (clique para expandir)</summary>
            <pre>{JSON.stringify(treeData, null, 2)}</pre>
          </details>
        </div>
      </div>
    </>
  );
}