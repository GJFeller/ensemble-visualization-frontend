import { useEffect } from 'react';
import EventEmitter from '../../utils/EventEmitter';
import DraggableWindow from '../../Components/DraggableWindow/DraggableWindow'

export default function VisualizationMain() {
    
    useEffect(() => {
      const oncreateChart = (eventData)=>{
        alert(eventData.chartType);
      }
  
      const listener = EventEmitter.addListener('createChart', oncreateChart);
  
      return ()=>{
        listener.remove();
      }
    },[]);
    
    return(
      <div class="min-h-screen bg-white">
        <DraggableWindow
          windowTitle='Titulo 1'>
          <div>I can now be moved around!</div>
        </DraggableWindow>
      </div>
    )
}