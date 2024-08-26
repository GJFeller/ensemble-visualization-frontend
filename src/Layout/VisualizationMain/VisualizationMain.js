import React, { useState, useEffect } from "react";
import DraggableWindow from "../../Components/DraggableWindow";
import ReactFlow from "react-flow";

const DraggableWindowList = React.memo(({ vizTreeRootList, closeWindow }) => {
  return (
    <>
      {vizTreeRootList.map((element) => (
        <DraggableWindow
          key={"viz-" + element.chartId}
          id={"viz-" + element.chartId}
          chartSettings={element}
          closeWindow={closeWindow}
        ></DraggableWindow>
      ))}
    </>
  );
});

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
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  return (
    <div className="min-h-screen bg-white">
      <DraggableWindowList
        vizTreeRootList={vizTreeRootList}
        closeWindow={closeWindow}
      />
    </div>
  );
}
