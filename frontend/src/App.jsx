import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<div className="p-4 text-center">Welcome to Smart Restaurant 🍽️</div>} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  )
}

export default App
