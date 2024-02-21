import { useEffect } from 'react';
import EventEmitter from '../../utils/EventEmitter';
import DraggableWindow from '../../Components/DraggableWindow'
import React from 'react';

export default function VisualizationMain() {
    const visualizationList = [];
    visualizationList.push(<DraggableWindow />);
    useEffect(() => {
      const oncreateChart = (eventData)=>{
        alert(eventData.chartType);
        console.log(visualizationList);
        visualizationList.push(<DraggableWindow />);
      }
  
      const listener = EventEmitter.addListener('createChart', oncreateChart);
  
      return ()=>{
        listener.remove();
      }
    },[]);
    
//    return(
//      <div id="vis-main" className="min-h-screen bg-white">
//        <DraggableWindow
//          windowTitle='Titulo 1'>
//          <div>I can now be moved around!</div>
//        </DraggableWindow>
//      </div>
//    )
    return(
      React.createElement("div", {className: "min-h-screen bg-white"},
        visualizationList
      )
    )
}