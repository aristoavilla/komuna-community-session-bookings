import { Routes, Route } from 'react-router-dom'
import { DiscoveryPage } from './pages/DiscoveryPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoveryPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
    </Routes>
  )
}
