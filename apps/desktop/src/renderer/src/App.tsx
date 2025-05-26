import { Routes, Route } from 'react-router';
import { Dashboard } from './pages/Dashboard.tsx';
import { DailyPlanning } from './pages/DailyPlanning.tsx';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={ <Dashboard /> } />
      <Route path="/daily-planning" element={ <DailyPlanning /> } />
    </Routes>
  )
}

export default App
