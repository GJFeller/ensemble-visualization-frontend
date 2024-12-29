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

  const onConnect = useCallback((params) => {
    // Find source and target nodes
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);

    if (!sourceNode || !targetNode) return;

    // Get chart settings from nodes
    const sourceChartSettings = sourceNode.data.chartSettings;
    const targetChartSettings = targetNode.data.chartSettings;

    // Update target chart based on source selections
    targetChartSettings.updateFromSourceSelection(sourceChartSettings);

    // Add edge with default options
    const edgeWithArrow = {
      ...params,
      ...defaultEdgeOptions,
      data: {
        sourceId: sourceNode.id,
        targetId: targetNode.id
      }
    };
    
    setEdges(eds => addEdge(edgeWithArrow, eds));
  }, [nodes, setEdges]); 

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

  // Add handler for selection changes
  const onSelectionChange = useCallback((nodeId, newSelection) => {
    // Find all edges where this node is the source
    const connectedEdges = edges.filter(edge => edge.source === nodeId);
    
    // Update all connected target nodes
    connectedEdges.forEach(edge => {
      const targetNode = nodes.find(node => node.id === edge.target);
      if (targetNode) {
        const sourceNode = nodes.find(node => node.id === edge.source);
        targetNode.data.chartSettings.updateFromSourceSelection(
          sourceNode.data.chartSettings
        );
      }
    });
  }, [edges, nodes]);

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
