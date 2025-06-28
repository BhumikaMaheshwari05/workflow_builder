import React, { useState, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
  COMPONENT: 'component',
  NODE: 'node'
};

// Available components matching the Figma design
const components = [
  { id: 1, type: 'user-query', name: 'User Query', icon: '👤', color: '#E8F4FD' },
  { id: 2, type: 'llm', name: 'LLM (OpenAI)', icon: '🧠', color: '#E8F4FD' },
  { id: 3, type: 'knowledge-base', name: 'Knowledge Base', icon: '📚', color: '#E8F4FD' },
  { id: 4, type: 'web-search', name: 'Web Search', icon: '🔍', color: '#E8F4FD' },
  { id: 5, type: 'output', name: 'Output', icon: '📤', color: '#E8F4FD' }
];

// Draggable component from sidebar (reusable)
const SidebarComponent = ({ component }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { ...component },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    end: (item, monitor) => {
      // Reset dragging state when drop is complete
    }
  }));

  return (
    <div 
      ref={drag}
      className={`sidebar-component ${isDragging ? 'dragging' : ''}`}
    >
      <span className="component-icon">{component.icon}</span>
      <span className="component-name">{component.name}</span>
    </div>
  );
};

// Connection handle component
const ConnectionHandle = ({ nodeId, type, position, onStartConnection, onEndConnection, isConnecting }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (type === 'output' && !isConnecting) {
      onStartConnection(nodeId, position);
    } else if (type === 'input' && isConnecting) {
      onEndConnection(nodeId, position);
    }
  };

  return (
    <div 
      className={`connection-handle ${type} ${isConnecting && type === 'input' ? 'active' : ''}`}
      onClick={handleClick}
      style={{
        position: 'absolute',
        [position]: -8,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '2px solid #3B82F6',
        background: type === 'output' ? '#3B82F6' : 'white',
        cursor: 'pointer',
        zIndex: 10
      }}
    />
  );
};

// Workflow node component
const WorkflowNode = ({ node, onRemove, onMove, onStartConnection, onEndConnection, isConnecting }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.NODE,
    item: { id: node.id, type: 'move', originalPosition: node.position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    end: (item, monitor) => {
      const offset = monitor.getDifferenceFromInitialOffset();
      if (offset) {
        onMove(node.id, {
          x: item.originalPosition.x + offset.x,
          y: item.originalPosition.y + offset.y
        });
      }
    }
  }));

  const getNodeContent = () => {
    switch (node.type) {
      case 'user-query':
        return (
          <div className="node-content">
            <div className="node-header">
              <span className="node-icon">👤</span>
              <span className="node-title">User Query</span>
            </div>
            <div className="node-body">
              <div className="input-field">
                <label>User Query</label>
                <textarea placeholder="Write your query here" />
              </div>
            </div>
          </div>
        );
      
      case 'llm':
        return (
          <div className="node-content">
            <div className="node-header">
              <span className="node-icon">🧠</span>
              <span className="node-title">LLM (OpenAI)</span>
            </div>
            <div className="node-body">
              <div className="input-field">
                <label>Model</label>
                <select>
                  <option>GPT-4o-Mini</option>
                  <option>GPT-4</option>
                  <option>GPT-3.5</option>
                </select>
              </div>
              <div className="input-field">
                <label>API Key</label>
                <input type="password" placeholder="••••••••••••••••" />
              </div>
              <div className="input-field">
                <label>Prompt</label>
                <textarea placeholder="You are a helpful assistant..." />
              </div>
            </div>
          </div>
        );
      
      case 'knowledge-base':
        return (
          <div className="node-content">
            <div className="node-header">
              <span className="node-icon">📚</span>
              <span className="node-title">Knowledge Base</span>
            </div>
            <div className="node-body">
              <div className="input-field">
                <label>File for Knowledge Base</label>
                <div className="file-upload">
                  <button>Upload File 📁</button>
                </div>
              </div>
              <div className="input-field">
                <label>Embedding Model</label>
                <select>
                  <option>text-embedding-3-large</option>
                </select>
              </div>
              <div className="input-field">
                <label>API Key</label>
                <input type="password" placeholder="••••••••••••••••" />
              </div>
            </div>
          </div>
        );
      
      case 'web-search':
        return (
          <div className="node-content">
            <div className="node-header">
              <span className="node-icon">🔍</span>
              <span className="node-title">Web Search</span>
            </div>
            <div className="node-body">
              <div className="input-field">
                <label>WebSearch Tool</label>
                <div className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </div>
              </div>
              <div className="input-field">
                <label>SERP API</label>
                <input type="password" placeholder="••••••••••••••••" />
              </div>
            </div>
          </div>
        );
      
      case 'output':
        return (
          <div className="node-content">
            <div className="node-header">
              <span className="node-icon">📤</span>
              <span className="node-title">Output</span>
            </div>
            <div className="node-body">
              <div className="input-field">
                <label>Output Text</label>
                <textarea placeholder="Output will be generated based on query" readOnly />
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unknown node type</div>;
    }
  };

  // Determine if node should have input/output handles
  const hasInput = node.type !== 'user-query';
  const hasOutput = node.type !== 'output';

  return (
    <div 
      ref={drag}
      className={`workflow-node ${isDragging ? 'dragging' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isDragging ? 'rotate(2deg)' : 'none'
      }}
    >
      <div className="node-actions">
        <button className="node-action" onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}>
          ❌
        </button>
      </div>
      
      {/* Connection handles */}
      {hasInput && (
        <ConnectionHandle
          nodeId={node.id}
          type="input"
          position="left"
          onEndConnection={onEndConnection}
          isConnecting={isConnecting}
        />
      )}
      
      {hasOutput && (
        <ConnectionHandle
          nodeId={node.id}
          type="output"
          position="right"
          onStartConnection={onStartConnection}
          isConnecting={isConnecting}
        />
      )}
      
      {getNodeContent()}
    </div>
  );
};

// Connection line component
const Connection = ({ from, to, nodes }) => {
  const fromNode = nodes.find(n => n.id === from.nodeId);
  const toNode = nodes.find(n => n.id === to.nodeId);
  
  if (!fromNode || !toNode) return null;

  const fromX = fromNode.position.x + 300; // node width
  const fromY = fromNode.position.y + 75;  // half node height
  const toX = toNode.position.x;
  const toY = toNode.position.y + 75;

  // Create curved path
  const midX = (fromX + toX) / 2;
  const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

  return (
    <g>
      <path
        d={path}
        stroke="#3B82F6"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      <circle cx={fromX} cy={fromY} r="4" fill="#3B82F6" />
      <circle cx={toX} cy={toY} r="4" fill="#3B82F6" />
    </g>
  );
};

// Main workflow canvas
const WorkflowCanvas = ({ nodes, connections, onDrop, onNodeMove, onNodeRemove, onStartConnection, onEndConnection, isConnecting }) => {
  const canvasRef = useRef(null);
  
  const [, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.NODE],
    drop: (item, monitor) => {
      if (item.type === 'move') return; // Handle node movement in the node component
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      const canvasOffset = {
        x: offset.x - canvasRect.left - 150,
        y: offset.y - canvasRect.top - 75
      };
      
      onDrop(item, canvasOffset);
    }
  }));

  return (
    <div 
      ref={(el) => {
        drop(el);
        canvasRef.current = el;
      }}
      className="workflow-canvas"
    >
      <svg className="connections-svg">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#3B82F6"
            />
          </marker>
        </defs>
        
        {connections.map((conn, index) => (
          <Connection
            key={index}
            from={conn.from}
            to={conn.to}
            nodes={nodes}
          />
        ))}
      </svg>
      
      {nodes.map((node) => (
        <WorkflowNode
          key={node.id}
          node={node}
          onRemove={onNodeRemove}
          onMove={onNodeMove}
          onStartConnection={onStartConnection}
          onEndConnection={onEndConnection}
          isConnecting={isConnecting}
        />
      ))}
      
      {nodes.length === 0 && (
        <div className="canvas-placeholder">
          <div className="placeholder-content">
            <h3>Start Building Your Workflow</h3>
            <p>Drag components from the sidebar to create your AI workflow</p>
            <div className="placeholder-steps">
              <div className="step">1. Drag components to canvas</div>
              <div className="step">2. Click blue dots to connect nodes</div>
              <div className="step">3. Configure each component</div>
            </div>
          </div>
        </div>
      )}
      
      {isConnecting && (
        <div className="connection-mode-overlay">
          <div className="connection-instruction">
            Click on a blue input dot to complete the connection
          </div>
        </div>
      )}
    </div>
  );
};

const WorkflowEditor = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const nodeIdCounter = useRef(1);

  const handleDrop = useCallback((component, position) => {
    const newNode = {
      id: nodeIdCounter.current++,
      type: component.type,
      name: component.name,
      position: position,
      data: {}
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleNodeMove = useCallback((nodeId, newPosition) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ));
  }, []);

  const handleNodeRemove = useCallback((nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.from.nodeId !== nodeId && conn.to.nodeId !== nodeId
    ));
  }, []);

  const handleStartConnection = useCallback((nodeId, position) => {
    setIsConnecting(true);
    setConnectionStart({ nodeId, position });
  }, []);

  const handleEndConnection = useCallback((nodeId, position) => {
    if (connectionStart && connectionStart.nodeId !== nodeId) {
      const newConnection = {
        from: connectionStart,
        to: { nodeId, position }
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setIsConnecting(false);
    setConnectionStart(null);
  }, [connectionStart]);

  const handleCancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStart(null);
  }, []);

  const handleBuildStack = () => {
    if (nodes.length === 0) {
      alert('Please add some components to your workflow first!');
      return;
    }
    
    const summary = `Building workflow with ${nodes.length} components and ${connections.length} connections:\n\n` +
      nodes.map(node => `• ${node.name}`).join('\n');
    
    alert(summary + '\n\nThis would compile and deploy your workflow!');
  };

  // Handle escape key to cancel connection
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isConnecting) {
        handleCancelConnection();
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isConnecting, handleCancelConnection]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="workflow-editor-container">
        {/* Header */}
        <div className="workflow-header">
          <div className="header-left">
            <h1>GenAI Stack</h1>
            <span className="workflow-title">Chat With AI</span>
            <div className="workflow-stats">
              <span>{nodes.length} components</span>
              <span>{connections.length} connections</span>
            </div>
          </div>
          <div className="header-right">
            <button className="save-btn">💾 Save</button>
            <button className="build-btn" onClick={handleBuildStack}>
              🚀 Build Stack
            </button>
          </div>
        </div>

        <div className="workflow-content">
          {/* Sidebar */}
          <div className="workflow-sidebar">
            <div className="sidebar-header">
              <h3>Components</h3>
              <p>Drag to add multiple instances</p>
            </div>
            <div className="sidebar-components">
              {components.map(component => (
                <SidebarComponent 
                  key={component.id} 
                  component={component}
                />
              ))}
            </div>
            
            <div className="sidebar-help">
              <h4>How to connect:</h4>
              <div className="help-item">
                <span className="help-dot output"></span>
                <span>Click output (blue dot)</span>
              </div>
              <div className="help-item">
                <span className="help-dot input"></span>
                <span>Then click input (white dot)</span>
              </div>
            </div>
          </div>

          {/* Main Canvas */}
          <div className="workflow-main">
            <WorkflowCanvas
              nodes={nodes}
              connections={connections}
              onDrop={handleDrop}
              onNodeMove={handleNodeMove}
              onNodeRemove={handleNodeRemove}
              onStartConnection={handleStartConnection}
              onEndConnection={handleEndConnection}
              isConnecting={isConnecting}
            />
          </div>
        </div>

        <style jsx>{`
          .workflow-editor-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }

          .workflow-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            background: white;
            border-bottom: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .header-left h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
          }

          .workflow-title {
            padding: 4px 12px;
            background: #e0f2fe;
            border-radius: 16px;
            font-size: 14px;
            color: #0369a1;
            font-weight: 500;
          }

          .workflow-stats {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #64748b;
          }

          .header-right {
            display: flex;
            gap: 12px;
          }

          .save-btn, .build-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .save-btn {
            background: #f1f5f9;
            color: #64748b;
          }

          .build-btn {
            background: #10b981;
            color: white;
          }

          .save-btn:hover {
            background: #e2e8f0;
          }

          .build-btn:hover {
            background: #059669;
          }

          .workflow-content {
            flex: 1;
            display: flex;
            overflow: hidden;
          }

          .workflow-sidebar {
            width: 280px;
            background: white;
            border-right: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
          }

          .sidebar-header {
            padding: 16px;
            border-bottom: 1px solid #e2e8f0;
          }

          .sidebar-header h3 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }

          .sidebar-header p {
            margin: 0;
            font-size: 12px;
            color: #64748b;
          }

          .sidebar-components {
            flex: 1;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .sidebar-component {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            cursor: grab;
            transition: all 0.2s;
          }

          .sidebar-component:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
            transform: translateY(-1px);
          }

          .sidebar-component.dragging {
            opacity: 0.5;
            cursor: grabbing;
          }

          .component-icon {
            font-size: 18px;
          }

          .component-name {
            font-size: 14px;
            font-weight: 500;
            color: #475569;
          }

          .sidebar-help {
            padding: 16px;
            border-top: 1px solid #e2e8f0;
            background: #f8fafc;
          }

          .sidebar-help h4 {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #374151;
          }

          .help-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 12px;
            color: #64748b;
          }

          .help-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid #3B82F6;
          }

          .help-dot.output {
            background: #3B82F6;
          }

          .help-dot.input {
            background: white;
          }

          .workflow-main {
            flex: 1;
            position: relative;
            overflow: hidden;
          }

          .workflow-canvas {
            width: 100%;
            height: 100%;
            position: relative;
            background: linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                        linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
            background-size: 20px 20px;
          }

          .connections-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
          }

          .workflow-node {
            position: absolute;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            cursor: grab;
            z-index: 2;
            transition: all 0.2s;
            min-width: 300px;
          }

          .workflow-node:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .workflow-node.dragging {
            cursor: grabbing;
            z-index: 3;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          }

          .node-actions {
            position: absolute;
            top: -8px;
            right: -8px;
            z-index: 4;
          }

          .node-action {
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 50%;
            background: #ef4444;
            color: white;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .connection-handle.active {
            background: #10b981 !important;
            animation: pulse 1s infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.2); }
          }

          .node-content {
            padding: 0;
          }

          .node-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 12px 12px 0 0;
          }

          .node-icon {
            font-size: 18px;
          }

          .node-title {
            font-weight: 600;
            color: #1e293b;
          }

          .node-body {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .input-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .input-field label {
            font-size: 12px;
            font-weight: 500;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .input-field input,
          .input-field select,
          .input-field textarea {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 14px;
            background: white;
          }

          .input-field textarea {
            resize: vertical;
            min-height: 60px;
          }

          .file-upload button {
            padding: 8px 12px;
            background: #f1f5f9;
            border: 1px dashed #cbd5e1;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
            font-size: 14px;
            color: #64748b;
          }

          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
          }

          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #10b981;
            transition: 0.4s;
            border-radius: 24px;
          }

          .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
          }

          .canvas-placeholder {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #64748b;
          }

          .placeholder-content h3 {
            margin: 0 0 8px 0;
            font-size: 20px;
            color: #475569;
          }

          .placeholder-content p {
            margin: 0 0 16px 0;
            font-size: 14px;
          }

          .placeholder-steps {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .step {
            padding: 8px 12px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 12px;
            color: #64748b;
          }

          .connection-mode-overlay {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
          }

          .connection-instruction {
            padding: 12px 16px;
            background: #3B82F6;
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </DndProvider>
  );
};

export default WorkflowEditor;