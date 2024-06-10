import './App.css';
import ChartSideBar from './Layout/ChartSideBar';
import EnsembleSideBar from './Layout/EnsembleSideBar/EnsembleSideBar';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import VisualizationMain from './Layout/VisualizationMain/VisualizationMain';
import DraggableWindow from './Components/DraggableWindow';
import { useState } from 'react';
import * as ChartUtils from './utils/ChartUtils';


let vizId = 0;

let chartOptions = new ChartUtils.ChartOptions();

function App() {
  const [visualizationList, setVisualizationList] = useState([]);

  const createChart = () => {
    console.log("App.createChart()");
    console.log(chartOptions);
    setVisualizationList(
      [
        ...visualizationList,
        <DraggableWindow 
          key={"viz-"+vizId++} 
          restRoute={"/dimensional-reduction?method=PCA"}
          chartType={ChartUtils.ChartType.DR}
          showChartOptions={showChartOptions}
        />, 
        <DraggableWindow 
          key={"viz-"+vizId++} 
          restRoute={"/temporal-evolution"} 
          chartType={ChartUtils.ChartType.TEMPORAL}
          showChartOptions={showChartOptions}
        />
      ]
    )
  };

  const showChartOptions = (windowId) => {
    console.log("Show chart options for window:", windowId);
  }

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
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel minSize={20} maxSize={20}>
          <div className="min-h-screen bg-slate-400">
            <ChartSideBar>
            </ChartSideBar>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App;
