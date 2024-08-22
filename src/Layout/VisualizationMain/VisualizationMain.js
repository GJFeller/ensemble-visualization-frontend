import React, { useState } from "react";
import DraggableWindow from "../../Components/DraggableWindow";

var vizId = 0;

export default function VisualizationMain({ vizTreeRootList, closeWindow }) {
  console.log(vizTreeRootList);

  return (
    <div className="min-h-screen bg-white">
      {vizTreeRootList.map((element) => (
        <DraggableWindow
          key={"viz-" + vizId}
          id={"viz-" + vizId++}
          chartSettings={element}
          closeWindow={closeWindow}
        ></DraggableWindow>
      ))}
    </div>
  );
}
