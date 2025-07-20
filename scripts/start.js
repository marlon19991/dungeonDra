#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🐉 D&D Game Startup Script');
console.log('===========================\n');

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = 16;
const currentVersion = parseInt(nodeVersion.slice(1));

if (currentVersion < requiredVersion) {
  console.error(`❌ Node.js ${requiredVersion}+ required, found ${nodeVersion}`);
  process.exit(1);
}
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  console.log('📝 Creating .env template...');
  
  const envTemplate = `# D&D Game Configuration
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
PORT=3000
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env template created');
  console.log('⚠️  Please add your GEMINI_API_KEY to .env file');
  process.exit(1);
}

// Check if API key is configured
const envContent = fs.readFileSync(envPath, 'utf8');
if (envContent.includes('your_gemini_api_key_here')) {
  console.error('❌ GEMINI_API_KEY not configured in .env');
  console.log('⚠️  Please add your actual API key to .env file');
  process.exit(1);
}
console.log('✅ Environment configuration found');

// Check if frontend dependencies are installed
const frontendNodeModules = path.join(__dirname, '..', 'frontend', 'node_modules');
if (!fs.existsSync(frontendNodeModules)) {
  console.log('📦 Installing frontend dependencies...');
  try {
    execSync('cd frontend && npm install', { stdio: 'inherit' });
    console.log('✅ Frontend dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install frontend dependencies');
    process.exit(1);
  }
}

// Check if dist exists for production
const distPath = path.join(__dirname, '..', 'dist');
const isProduction = process.argv.includes('--production');

if (isProduction && !fs.existsSync(distPath)) {
  console.log('🔨 Building application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Application built successfully');
  } catch (error) {
    console.error('❌ Build failed');
    process.exit(1);
  }
}

console.log('\n🚀 Starting D&D Game...\n');

// Start the application
try {
  if (isProduction) {
    execSync('npm start', { stdio: 'inherit' });
  } else {
    execSync('npm run dev', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Failed to start application');
  process.exit(1);
}