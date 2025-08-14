import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Helper function to mimic webpack's vpath functionality
function vpath(...args: string[]): string {
  const filename = args.join(path.sep)
  const builddir = __dirname
  const srcdir = path.join(__dirname, 'src')
  
  const expanded = path.join(builddir, filename)
  if (fs.existsSync(expanded)) {
    return expanded
  }
  return path.join(srcdir, filename)
}

// Define all entry points (matching webpack config)
const entries = {
  'index': './src/index.tsx',
  'computer/index': './src/computer/index.tsx',
  'domain/index': './src/domain/index.tsx',
  'contact/index': './src/contact/index.tsx',
  'time/index': './src/time/index.tsx',
  'sites/index': './src/sites/index.tsx',
  'user/index': './src/user/index.tsx',
  'organization_unit/index': './src/organization_unit/index.tsx',
  'forest/index': './src/forest/index.tsx',
  'group/index': './src/group/index.tsx',
  'dns/index': './src/dns/index.tsx',
  'delegation/index': './src/delegation/index.tsx',
  'spn/index': './src/spn/index.tsx',
  'fsmo/index': './src/fsmo/index.tsx',
  'gpo/index': './src/gpo/index.tsx',
  'dsacl/index': './src/dsacl/index.tsx',
  'ntacl/index': './src/ntacl/index.tsx'
}

// Define files to copy (matching webpack config)
const filesToCopy = [
  'index.html',
  'computer/computer.html',
  'domain/domain.html', 
  'contact/contact.html',
  'time/time.html',
  'sites/sites.html',
  'user/user.html',
  'organization_unit/orgunit.html',
  'forest/forest.html',
  'group/group.html',
  'dns/dns.html',
  'delegation/delegation.html',
  'spn/spn.html',
  'fsmo/fsmo.html',
  'gpo/gpo.html',
  'dsacl/dsacl.html',
  'ntacl/ntacl.html',
  'manifest.json'
]

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle file copying and multiple entries
    {
      name: 'cockpit-multientry',
      generateBundle() {
        // Copy static files
        filesToCopy.forEach(file => {
          const srcPath = vpath(file)
          if (fs.existsSync(srcPath)) {
            const content = fs.readFileSync(srcPath)
            this.emitFile({
              type: 'asset',
              fileName: file,
              source: content
            })
          }
        })
      }
    }
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: entries,
      external: ['cockpit'], // Handle cockpit as external dependency
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        globals: {
          cockpit: 'cockpit'
        }
      }
    },
    sourcemap: true,
    target: [
      'chrome80',
      'firefox70', 
      'safari12',
      'edge80'
    ]
  },
  
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  
  server: {
    port: 9000,
    host: true,
    open: false,
    // Proxy API calls to Cockpit when developing standalone
    proxy: {
      '/cockpit': {
        target: 'https://172.18.146.9:9090',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  define: {
    // Ensure NODE_ENV is available
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})