import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import GazeTask from './pages/GazeTask'
import StrokeTask from './pages/StrokeTask'
import PhonicsTask from './pages/PhonicsTask'
import SparkyTask from './pages/SparkyTask'
import ConversationalTask from './pages/ConversationalTask'
import SensoryTask from './pages/SensoryTask'
import Scores from './pages/Scores'
import Report from './pages/Report'
import Tracker from './pages/Tracker'
import Specialists from './pages/Specialists'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/tasks/gaze" element={<GazeTask />} />
      <Route path="/tasks/stroke" element={<StrokeTask />} />
      <Route path="/tasks/phonics" element={<PhonicsTask />} />
      <Route path="/tasks/sparky" element={<SparkyTask />} />
      <Route path="/tasks/conversation" element={<ConversationalTask />} />
      <Route path="/tasks/sensory" element={<SensoryTask />} />
      <Route path="/scores" element={<Scores />} />
      <Route path="/report" element={<Report />} />
      <Route path="/tracker" element={<Tracker />} />
      <Route path="/specialists" element={<Specialists />} />
    </Routes>
  )
}

export default App