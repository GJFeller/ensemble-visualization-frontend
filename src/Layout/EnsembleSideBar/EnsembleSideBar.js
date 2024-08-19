import React, { useEffect, useState } from 'react';
import TreeView from '../../Components/TreeView';
import Accordion from '../../Components/Accordion';
import { ChartType } from '../../utils/ChartUtils';

let chartTypeIdxKey = 0;

export default function EnsembleSideBar({
  onCreateChart = () => {},
  restRoute = "/list-ensembles"
}) {
  const [treeData, setTreeData] = useState([]);
  const [selectedChartTypes, setSelectedChartTypes] = useState([]);

  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND_URL+restRoute)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      var keyIdx = 1;
      var tree = [];
      for(var ensemble in data) {
        var ensembleNode = {
          key: keyIdx++,
          label: ensemble,
          isChecked: false,
          children: []
        };
        for(var [simIdx, simulation] of Object.entries(data[ensemble])) {
          var simulationNode = {
            key: keyIdx++,
            label: simulation,
            isChecked: false
          };
          ensembleNode.children.push(simulationNode);
        }
        tree.push(ensembleNode);
      }
      setTreeData(tree);
    })
  }, [restRoute]);

  const onCheckboxChange = (e) => {
    const selectedType = ChartType.fromChartTypeString(e.target.id.replace('checkbox-', ''));
    //var currentSelectedChartTypes = [...selectedChartTypes];
    if(selectedChartTypes.includes(selectedType)) {
      setSelectedChartTypes(oldValues => {
        return oldValues.filter(chartType => chartType !== selectedType);  
      })
    }
    else {
      setSelectedChartTypes([
        ...selectedChartTypes,
        selectedType
      ])
    }
  };

  return (
        <>
            <div className='border-1 rounded-md m-1'>
            <Accordion title="Filter Options">
              <p>My content</p>
            </Accordion>
            </div>
            <div className='border-1 rounded-md m-1 bg-gray-200 border-gray-200'>
              <TreeView treeData={treeData}/>
            </div>
            <div className='border-1 rounded-md m-1 bg-gray-200 border-gray-200'>
              <h1>Select chart type</h1>
              <ul>
                {ChartType.chartTypeList.map((chartType) => {
                  return (
                    <>
                      <li key={'chartType'-chartTypeIdxKey++}>
                        <input 
                          type="checkbox" 
                          id={"checkbox-"+chartType}
                          checked={selectedChartTypes.includes(ChartType.fromChartTypeString(chartType))}
                          onChange={onCheckboxChange}
                        /> 
                        <label htmlFor={"checkbox-"+chartType}>{chartType}</label>
                      </li>
                    </>
                  );
                })}
              </ul>
            </div>
            <button onClick={() => onCreateChart(selectedChartTypes, treeData)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create chart</button>
        </>
  );
}