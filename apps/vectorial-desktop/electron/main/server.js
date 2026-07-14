// Servidor estático local minimalista (sin dependencias) para servir el build
// de vectorial-app dentro de Electron. No usamos file:// directamente porque
// react-router-dom (BrowserRouter) necesita un servidor real que redirija
// cualquier ruta desconocida a index.html (fallback de SPA); file:// no
// soporta eso. Sirve con "SPA fallback" igual que el rewrite de vercel.json.
const http = require('http')
const fs = require('fs')
const path = require('path')

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

function startStaticServer(rootDir) {
  return new Promise((resolvePromise, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0])
      let filePath = path.join(rootDir, urlPath)

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          // Fallback de SPA: cualquier ruta desconocida sirve index.html
          filePath = path.join(rootDir, 'index.html')
        }
        const ext = path.extname(filePath)
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
        fs.createReadStream(filePath).pipe(res)
      })
    })

    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolvePromise({ server, port })
    })
  })
}

module.exports = { startStaticServer }
