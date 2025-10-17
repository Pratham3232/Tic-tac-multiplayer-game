#!/bin/bash

# Lila Game Frontend - Quick Setup Script
# This script creates a complete React + Vite frontend for the Lila Game Backend

echo "🎨 Creating Lila Game Frontend..."

# Navigate to parent directory
cd "$(dirname "$0")/.."

# Create the frontend project
echo "📦 Creating Vite React TypeScript project..."
npm create vite@latest lila-game-frontend -- --template react-ts

cd lila-game-frontend

echo "📥 Installing dependencies..."
npm install

echo "🔧 Installing additional packages..."
npm install axios socket.io-client react-router-dom zustand
npm install react-chessboard chess.js
npm install @types/node -D

echo "🎨 Setting up Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

echo "📝 Creating project structure..."

# Create directories
mkdir -p src/components/Auth
mkdir -p src/components/Game
mkdir -p src/components/Layout
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/store
mkdir -p src/types
mkdir -p src/hooks

echo "⚙️ Creating configuration files..."

# Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
EOF

# Create tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Update vite config
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
EOF

# Update index.css to include Tailwind
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

echo "✅ Frontend setup complete!"
echo ""
echo "📍 Next steps:"
echo "   cd lila-game-frontend"
echo "   npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔗 Make sure your backend is running at: http://localhost:3000"
echo ""
echo "📚 Check FRONTEND.md for detailed implementation guide"