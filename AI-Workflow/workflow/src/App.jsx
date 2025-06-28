import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FirstPage from './components/FirstPage';
import WorkflowBuilder from './components/WorkflowBuilder';
import WorkflowEditor from './components/WorkflowEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/workflow" element={<WorkflowBuilder />} />
        <Route path="/workflow/:id" element={<WorkflowEditor />} />
      </Routes>
    </Router>
  );
}

export default App;