import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Formulaire from './Formulaire';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/creer" element={<Formulaire />} />
      </Routes>
    </Router>
  );
}

export default App;
