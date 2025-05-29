import { Routes, Route } from 'react-router';
import { Dashboard } from './pages/Dashboard.tsx';
import { DailyPlanning } from './pages/DailyPlanning.tsx';
import { BreakScreen } from './pages/BreakScreen.tsx';
import { SessionPlanning } from './pages/SessionPlanning.tsx';

import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/daily-planning" element={ <DailyPlanning /> } />
      <Route path="/break" element={ <BreakScreen /> } />
      <Route path="/session-planning" element={ <SessionPlanning /> } />
      <Route path="/" element={ <Dashboard /> } />
    </Routes>
  )
}

export default App
