import EnsembleSideBar from "./Layout/EnsembleSideBar/EnsembleSideBar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import VisualizationMain from "./Layout/VisualizationMain/VisualizationMain";
import { useState } from "react";
import * as ChartUtils from "./utils/ChartUtils";

import "./App.css";

import Flowchart from "./Components/Flowchart";

let plotId = 0;

function App() {
  const [visualizationTreeRootList, setVisualizationList] = useState([]);

  const closeWindow = (id) => {
    console.log(id);
    console.log(visualizationTreeRootList);
    const newVisualizationTreeRootList = visualizationTreeRootList.filter(
      (el) => el.chartId !== id,
    );
    console.log(newVisualizationTreeRootList);
    setVisualizationList(newVisualizationTreeRootList);
  };

  const createChart = (chartType = [], treeData = []) => {
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
    const newChartTreeRootList = [];
    for (const newChart of chartType) {
      let chartSettings = new ChartUtils.ChartSettings(
        newChart,
        "Header Title",
        "plot-" + plotId++,
      );

      chartSettings.ensembleList = [...selectedEnsembleList];
      chartSettings.simulationList = [...selectedSimulationList];

      newChartTreeRootList.push(chartSettings);
    }
    setVisualizationList([
      ...visualizationTreeRootList,
      ...newChartTreeRootList,
    ]);
  };

  return (
    <div className="bg-slate-400">
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

//function App() {
//  return (
//    <div className="App">
//      <Flowchart />
//    </div>
//  );
//}
//
//export default App;
