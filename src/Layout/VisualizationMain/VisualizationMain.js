import React, { useEffect, useCallback, useRef, memo } from "react";
import DraggableWindow from "../../Components/DraggableWindow";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  reconnectEdge,
  Background,
} from "@xyflow/react";

import "@xyflow/react/dist/base.css";

const nodeTypes = { draggableWindow: memo(DraggableWindow) };

const VisualizationMain = ({ vizTreeRootList, closeWindow }) => {
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
 
  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);
 
  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
 
    edgeReconnectSuccessful.current = true;
  }, []);

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
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
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
