import React, { useState } from "react";
import DraggableWindow from "../../Components/DraggableWindow";

var vizId = 0;

export default function VisualizationMain({ vizTreeRootList }) {
  console.log(vizTreeRootList);

  //    return(
  //      <div id="vis-main" className="min-h-screen bg-white">
  //        <DraggableWindow
  //          windowTitle='Titulo 1'>
  //          <div>I can now be moved around!</div>
  //        </DraggableWindow>
  //      </div>
  //    )
  return (
    <div className="min-h-screen bg-white">
      {vizTreeRootList.map((element) => (
        <DraggableWindow
          key={"viz-" + vizId}
          id={"viz-" + vizId++}
          chartSettings={element}
        ></DraggableWindow>
      ))}
    </div>
  );
}
