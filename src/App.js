import './App.css';
import EnsembleSideBar from './Layout/EnsembleSideBar/EnsembleSideBar';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import VisualizationMain from './Layout/VisualizationMain/VisualizationMain';
import DraggableWindow from './Components/DraggableWindow'
import { useState } from 'react';


let vizId = 0;

function App() {
  const [visualizationList, setVisualizationList] = useState([]);

  const createChart = () => {
    console.log("App.createChart()");
    setVisualizationList(
      [
        ...visualizationList,
        <DraggableWindow key={"viz-"+vizId++} />
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
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel minSize={20} maxSize={20}>
          <div className="min-h-screen bg-slate-400">
            right
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App;
