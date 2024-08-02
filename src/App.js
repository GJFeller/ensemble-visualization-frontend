import './App.css';
import EnsembleSideBar from './Layout/EnsembleSideBar/EnsembleSideBar';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import VisualizationMain from './Layout/VisualizationMain/VisualizationMain';
import DraggableWindow from './Components/DraggableWindow';
import { useState } from 'react';
import * as ChartUtils from './utils/ChartUtils';

let vizId = 0;

function App() {
  const [visualizationList, setVisualizationList] = useState([]);

  const closeWindow = (id) => {
    console.log(id);
    console.log(visualizationList);
    const newVisualizationList = visualizationList.filter((el) => el.id !== id);
    console.log(newVisualizationList);
    setVisualizationList(newVisualizationList);
  }

  const createChart = (treeData = []) => {
    let selectedEnsembleList = []
    let selectedSimulationList = []
    for (const ensembleNode of treeData) {
      if(ensembleNode.isChecked) {
        selectedEnsembleList.push(ensembleNode.label);
        for (const simulationNode of ensembleNode.children) {
          if(simulationNode.isChecked) 
            selectedSimulationList.push(simulationNode.label);
        }
      }
    }
    setVisualizationList(
      [
        ...visualizationList,
        {
          id: "viz-"+vizId,
          component:
             <DraggableWindow 
               key={"viz-"+vizId}
               id={"viz-"+vizId++}
               chartType={ChartUtils.ChartType.DR}
               selectedEnsembleList={selectedEnsembleList}
               selectedSimulationList={selectedSimulationList}
               closeWindow={closeWindow}
             />, 
        },
        {
          id: "viz-"+vizId,
          component:
            <DraggableWindow 
              key={"viz-"+vizId} 
              id={"viz-"+vizId++}
              chartType={ChartUtils.ChartType.TEMPORAL}
              selectedEnsembleList={selectedEnsembleList}
              selectedSimulationList={selectedSimulationList}
              closeWindow={closeWindow}
            />,
        }
      ]
    )
  };

  return (
    <div className="bg-slate-400">
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel minSize={20} maxSize={20}>
          <div className="min-h-screen bg-slate-400">
            <EnsembleSideBar 
              onCreateChart={createChart}
            >

            </EnsembleSideBar>
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel>
          <VisualizationMain>
            {visualizationList.map((element) => element.component)}
          </VisualizationMain>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App;
