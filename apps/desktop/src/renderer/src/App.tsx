import { Routes, Route } from 'react-router';
import { useEffect } from 'react';

import { Dashboard } from './pages/Dashboard.tsx';
import { DailyPlanning } from './pages/DailyPlanning.tsx';
import { BreakScreen } from './pages/BreakScreen.tsx';
import { SessionPlanning } from './pages/SessionPlanning.tsx';
import { PlanningScreen } from './pages/PlanningScreen.tsx';

import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/daily-planning" element={ <DailyPlanning /> } />
      <Route path="/break" element={ <BreakScreen /> } />
      <Route path="/session-planning" element={ <SessionPlanning /> } />
      <Route path="/planning" element={ <PlanningScreen /> } />
      <Route path="/" element={ <Dashboard /> } />
    </Routes>
  )
}

export default App
