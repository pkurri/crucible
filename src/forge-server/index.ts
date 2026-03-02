import express from 'express'
import {createServer} from 'http'
import {Server} from 'socket.io'
import path from 'path'
import {TelemetryHub} from './telemetry'
import {SkillRegistry} from './registry'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const PORT = process.env.PORT || 3003

// Initialize components
const telemetry = new TelemetryHub(io)
const registry = new SkillRegistry()

app.use(express.json())

// Serve static UI assets (styles, etc.)
app.use('/src', express.static(path.join(process.cwd(), 'src')))

// Explicitly serve index.html for root
app.get('/', (req, res) => {
  const indexPath = path.join(process.cwd(), 'index.html')
  console.log(`Serving index.html from: ${indexPath}`)
  res.sendFile(indexPath)
})

// API Endpoints
app.get('/health', (req, res) => {
  res.json({status: 'CORE ONLINE', timestamp: new Date().toISOString()})
})

app.get('/api/skills', (req, res) => {
  res.json(registry.getSkills())
})

// Start Server
httpServer.listen(PORT, () => {
  console.log(`🔥 Forge Server ignited on port ${PORT}`)
  console.log(`📍 Execution Directory: ${process.cwd()}`)

  // Start simulated activity for the Flux UI
  telemetry.startSimulatedActivity()
})
