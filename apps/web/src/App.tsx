import { Routes, Route } from 'react-router-dom'
import { DiscoveryPage } from './pages/DiscoveryPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoveryPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
      <Route path="/programs/:id/products/:productId" element={<ProductDetailPage />} />
    </Routes>
  )
}
