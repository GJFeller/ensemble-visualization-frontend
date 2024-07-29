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

  const createChart = (treeData = []) => {
    console.log("App.createChart()");
    console.log(treeData);
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
    console.log(selectedEnsembleList);
    console.log(selectedSimulationList);
    setVisualizationList(
      [
        ...visualizationList,
        <DraggableWindow 
          key={"viz-"+vizId++} 
          restRoute={"/dimensional-reduction?method=PCA"}
          chartType={ChartUtils.ChartType.DR}
          selectedEnsembleList={selectedEnsembleList}
          selectedSimulationList={selectedSimulationList}
        />, 
        <DraggableWindow 
          key={"viz-"+vizId++} 
          restRoute={"/temporal-evolution"} 
          chartType={ChartUtils.ChartType.TEMPORAL}
          selectedEnsembleList={selectedEnsembleList}
          selectedSimulationList={selectedSimulationList}
        />
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
            {visualizationList}
          </VisualizationMain>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App;
