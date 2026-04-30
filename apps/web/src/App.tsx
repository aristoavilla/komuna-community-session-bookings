import { Routes, Route } from 'react-router-dom'
import { DiscoveryPage } from './pages/DiscoveryPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { WalletPage } from './pages/WalletPage'
import { SessionsPage } from './pages/SessionsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoveryPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
      <Route path="/programs/:id/products/:productId" element={<ProductDetailPage />} />
      <Route path="/programs/:id/packages/:packageId/checkout" element={<CheckoutPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/programs/:id/products/:productId/sessions" element={<SessionsPage />} />
    </Routes>
  )
}
