import './App.css';
import DraggableWindow from './Components/DraggableWindow/DraggableWindow'
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

function App() {
  return (
    <div className="App" class="bg-slate-400">
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel minSize={20}>
          <div class="min-h-screen bg-slate-400">
            left
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel>
          <div class="min-h-screen bg-white">
            <DraggableWindow>
              <div>I can now be moved around!</div>
            </DraggableWindow>
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-black" />
        <Panel minSize={20}>
          <div class="min-h-screen bg-slate-400">
            right
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App;
