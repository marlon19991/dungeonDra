#!/usr/bin/env node

console.log(`
🐉 D&D Game - Command Reference
===============================

📖 DEVELOPMENT COMMANDS:
  npm run dev              🚀 Start both server & client with hot reload
  npm run dev:server       🖥️  Start only backend server  
  npm run dev:client       ⚡ Start only frontend client
  
🏗️  BUILD COMMANDS:
  npm run build            📦 Build complete application
  npm run build:server     🔧 Build backend only
  npm run build:client     ⚛️  Build frontend only
  npm run preview          👀 Build and preview production

🎮 PRODUCTION COMMANDS:
  npm start                🌟 Start production server
  node scripts/start.js    🚀 Smart startup with validation
  
🔧 SETUP & MAINTENANCE:
  npm run setup            📋 Complete project setup
  npm run clean            🧹 Clean build artifacts  
  npm run reset            🔄 Reset project (clean + reinstall)
  
🧪 TESTING & QUALITY:
  npm test                 🧪 Run tests
  npm run test:watch       👁️  Watch and run tests
  npm run lint             ✨ Lint and fix code
  npm run typecheck        🔍 Check TypeScript types
  
📊 MONITORING:
  npm run health           💚 Check if server is running
  npm run logs             📄 View application logs
  npm run kill             ⛔ Stop all running processes

🌐 URLS:
  Frontend (dev):  http://localhost:5173
  Frontend (prod): http://localhost:3000  
  Backend API:     http://localhost:3000/api
  
⚙️  REQUIREMENTS:
  • Node.js 16+
  • .env file with GEMINI_API_KEY
  • Frontend dependencies installed

📝 QUICK START:
  1. npm run setup         # Complete setup
  2. Add API key to .env   # Configure Gemini API
  3. npm run dev           # Start development
  
🆘 TROUBLESHOOTING:
  • npm run reset          # If dependencies are broken
  • npm run kill           # If ports are stuck
  • npm run health         # Check server status
  • Check .env file exists and has valid API key

💡 TIPS:
  • Use 'npm run dev' for development with hot reload
  • Use 'npm run preview' to test production build
  • Use 'npm run health' to verify everything works
  • Logs are automatically colored by service
`);