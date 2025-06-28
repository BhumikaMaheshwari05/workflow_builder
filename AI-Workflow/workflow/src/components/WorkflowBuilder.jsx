import React, { useState } from 'react';
import Navbar from './Navbar';
import NewStackModal from './NewStackModal';
import './WorkflowBuilder.css';

const WorkflowBuilder = () => {
  const [showModal, setShowModal] = useState(false);
  const [stacks, setStacks] = useState([
    { id: 1, name: "Marketing Automation", description: "Automated marketing campaigns", createdAt: "2023-05-15" },
    { id: 2, name: "Customer Support", description: "24/7 customer support bot", createdAt: "2023-05-10" }
  ]);

  const handleSaveStack = (newStack) => {
    setStacks([...stacks, newStack]);
  };

  return (
    <div className="workflow-builder">
      <Navbar />
      <main className="builder-content">
        <h1>Your AI Workflow Builder</h1>
        <div className="stacks-container">
          {stacks.map(stack => (
            <div key={stack.id} className="stack-card">
              <h3>{stack.name}</h3>
              <p>{stack.description}</p>
              <small>Created: {new Date(stack.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
        
        <button 
          className="new-stack-btn"
          onClick={() => setShowModal(true)}
        >
          + Create New Stack
        </button>
        
        {showModal && (
          <NewStackModal 
            onClose={() => setShowModal(false)}
            onSave={handleSaveStack}
          />
        )}
      </main>
    </div>
  );
};

export default WorkflowBuilder;