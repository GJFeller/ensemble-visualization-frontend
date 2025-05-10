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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(process.env.REACT_APP_BACKEND_URL + restRoute)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Falha ao carregar dados: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        var keyIdx = 1;
        var tree = [];
        for (var ensemble in data) {
          var ensembleNode = {
            key: keyIdx++,
            label: ensemble,
            isChecked: false,
            children: [],
          };
          for (var [simIdx, simulation] of Object.entries(data[ensemble])) {
            var simulationNode = {
              key: keyIdx++,
              label: simulation,
              isChecked: false,
            };
            ensembleNode.children.push(simulationNode);
          }
          tree.push(ensembleNode);
        }
        setTreeData(tree);
        setError(null);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [restRoute]);

  const onCheckboxChange = (e) => {
    // Verificar se ChartType.fromChartTypeString existe
    if (!ChartType || typeof ChartType.fromChartTypeString !== 'function') {
      console.error("ChartType.fromChartTypeString não está definido");
      return;
    }
    
    const selectedType = ChartType.fromChartTypeString(
      e.target.id.replace("checkbox-", ""),
    );
    
    if (selectedChartTypes.includes(selectedType)) {
      setSelectedChartTypes((oldValues) => {
        return oldValues.filter((chartType) => chartType !== selectedType);
      });
    } else {
      setSelectedChartTypes([...selectedChartTypes, selectedType]);
    }
  };
  
  // Array de fallback caso ChartType.chartTypeList não exista
  const availableChartTypes = ChartType && Array.isArray(ChartType.chartTypeList) 
    ? ChartType.chartTypeList 
    : ['DR', 'TEMPORAL', 'CORRELATIONMATRIX'];

  return (
    <>
      <div className="border-1 rounded-md m-1">
        <Accordion title="Filter Options">
          <p>My content</p>
        </Accordion>
      </div>
      <div className="border-1 rounded-md m-1 bg-gray-200 border-gray-200">
        {loading ? (
          <p>Carregando dados...</p>
        ) : error ? (
          <p>Erro: {error}</p>
        ) : (
          <TreeView treeData={treeData} />
        )}
      </div>
      <div className="border-1 rounded-md m-1 bg-gray-200 border-gray-200">
        <h1>Select chart type</h1>
        <ul>
          {/* Usar availableChartTypes em vez de ChartType.chartTypeList diretamente */}
          {availableChartTypes.map((chartType, index) => (
            <li key={`chartType-${index}`}>
              <input
                type="checkbox"
                id={`checkbox-${chartType}`}
                checked={selectedChartTypes.includes(
                  ChartType && typeof ChartType.fromChartTypeString === 'function'
                    ? ChartType.fromChartTypeString(chartType)
                    : chartType
                )}
                onChange={onCheckboxChange}
              />
              <label htmlFor={`checkbox-${chartType}`}>{chartType}</label>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => onCreateChart(selectedChartTypes, treeData)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading || selectedChartTypes.length === 0}
      >
        Create chart
      </button>
    </>
  );
}