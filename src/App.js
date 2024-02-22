import './App.css';
import EnsembleSideBar from './Layout/EnsembleSideBar/EnsembleSideBar';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import VisualizationMain from './Layout/VisualizationMain/VisualizationMain';

function App() {
  return (
    <div className="bg-slate-400">
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel minSize={20} maxSize={20}>
          <div className="min-h-screen bg-slate-400">
            <EnsembleSideBar></EnsembleSideBar>
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel>
          <VisualizationMain></VisualizationMain>
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
