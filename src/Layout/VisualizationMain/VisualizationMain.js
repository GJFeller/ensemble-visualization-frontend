import React, { useEffect, useCallback } from "react";
import DraggableWindow from "../../Components/DraggableWindow";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
} from "@xyflow/react";

import "@xyflow/react/dist/base.css";

const nodeTypes = { draggableWindow: DraggableWindow };

const VisualizationMain = ({ vizTreeRootList, closeWindow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  useEffect(() => {
    let nodeList = [];
    for (const chartSettings of vizTreeRootList) {
      nodeList.push({
        id: "node-" + chartSettings.chartId,
        type: "draggableWindow",
        dragHandle: ".handle",
        position: { x: 0, y: 0 },
        data: {
          chartSettings: chartSettings,
          closeWindow: closeWindow,
        },
      });
    }
    setNodes(nodeList);
  }, [vizTreeRootList]);

  return (
    <div className="bg-white" style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default VisualizationMain;
