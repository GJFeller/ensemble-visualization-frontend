import React, { useState, useEffect } from "react";
import DraggableWindow from "../../Components/DraggableWindow";

var vizId = 0;

export default function VisualizationMain({ vizTreeRootList, closeWindow }) {
  console.log(vizTreeRootList);

  const [arrows, setArrows] = useState([]);
  const [drawArrowFlag, setDrawArrowFlag] = useState(false);
  const [pointerEvent, setPointerEvent] = useState("auto");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentArrow, setCurrentArrow] = useState(null);

  const setDrawingArrowMoment = () => {
    setDrawArrowFlag(!drawArrowFlag);
  };

  const handleMouseMove = (event) => {
    //console.log(event);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    /*window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      };*/
  });

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
