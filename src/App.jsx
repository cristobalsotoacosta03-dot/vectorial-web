import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import SandboxPage from './pages/SandboxPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <Hero />
            <Features />
            <HowItWorks />
            <Pricing />
            <Testimonials />
            <CTA />
          </AppLayout>
        } />
        <Route path="/sandbox" element={<SandboxPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
