import React from 'react';

export default function VisualizationMain({ children }) {
    
//    return(
//      <div id="vis-main" className="min-h-screen bg-white">
//        <DraggableWindow
//          windowTitle='Titulo 1'>
//          <div>I can now be moved around!</div>
//        </DraggableWindow>
//      </div>
//    )
    return (
      <div className='min-h-screen bg-white'>
        {children}
      </div>
    )
}