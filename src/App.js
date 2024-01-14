import './App.css';
import DraggableWindow from './Components/DraggableWindow/DraggableWindow'
import EnsembleSideBar from './Layout/EnsembleSideBar/EnsembleSideBar';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useEffect } from 'react';
import EventEmitter from './utils/EventEmitter';

function App() {
  useEffect(() => {
    const oncreateChart = (eventData)=>{
      alert(eventData.chartType);
    }

    const listener = EventEmitter.addListener('createChart', oncreateChart);

    return ()=>{
      listener.remove();
    }
  },[])
  return (
    <div className="App" class="bg-slate-400">
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel minSize={20} maxSize={20}>
          <div class="min-h-screen bg-slate-400">
            <EnsembleSideBar></EnsembleSideBar>
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel>
          <div class="min-h-screen bg-white">
            <DraggableWindow
              windowTitle='Titulo 1'>
              <div>I can now be moved around!</div>
            </DraggableWindow>
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel minSize={20} maxSize={20}>
          <div class="min-h-screen bg-slate-400">
            right
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App;
