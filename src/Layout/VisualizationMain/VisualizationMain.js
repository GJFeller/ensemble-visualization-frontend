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
  MarkerType,
} from "@xyflow/react";

import "@xyflow/react/dist/base.css";

const nodeTypes = { draggableWindow: memo(DraggableWindow) };

// Default edge settings with arrow
const defaultEdgeOptions = {
  type: "smoothstep", // You can also use 'step' or 'straight'
  markerEnd: {
    type: MarkerType.Arrow,
    width: 20,
    height: 20,
    color: "#888",
  },
  style: {
    strokeWidth: 2,
    stroke: "#888",
  },
};

const VisualizationMain = ({ vizTreeRootList, closeWindow }) => {
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => {
      // Add default edge options to new connections
      const edgeWithArrow = {
        ...params,
        ...defaultEdgeOptions,
      };
      setEdges((eds) => addEdge(edgeWithArrow, eds));
    },
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
