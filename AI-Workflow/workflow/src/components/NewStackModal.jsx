import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewStackModal.css';

const NewStackModal = ({ onClose, onSave }) => {
  const [stackName, setStackName] = useState('');
  const [stackDesc, setStackDesc] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stackName.trim()) return;
    
    const newStack = {
      id: Date.now(),
      name: stackName,
      description: stackDesc,
      createdAt: new Date().toISOString(),
    };
    
    onSave(newStack);
    navigate(`/workflow/${newStack.id}`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Create New Stack</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Stack Name</label>
            <input
              type="text"
              value={stackName}
              onChange={(e) => setStackName(e.target.value)}
              placeholder="e.g., Customer Support Bot"
              required
            />
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={stackDesc}
              onChange={(e) => setStackDesc(e.target.value)}
              placeholder="What does this stack do?"
              rows="3"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="create-btn">
              Create Stack
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewStackModal;