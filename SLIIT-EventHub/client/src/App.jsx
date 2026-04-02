import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking backend...')

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch('http://localhost:4000/')
        if (!res.ok) {
          throw new Error('Backend is reachable but returned an error.')
        }
        const data = await res.json()
        setApiStatus(data.message || 'Backend is running.')
      } catch {
        setApiStatus('Backend is not reachable. Start server on port 4000.')
      }
    }

    checkApi()
  }, [])

  return (
    <main className="app">
      <section className="card">
        <p className="kicker">SLIIT EventHub</p>
        <h1>Frontend Is Running</h1>
        <p className="subtitle">
          Your React app is live on port 3000 and ready for development.
        </p>

        <div className="status">
          <span className="label">Backend status</span>
          <span className="value">{apiStatus}</span>
        </div>

        <div className="ports">
          <div>
            <span>Frontend</span>
            <strong>http://127.0.0.1:3000</strong>
          </div>
          <div>
            <span>Backend</span>
            <strong>http://localhost:4000</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
