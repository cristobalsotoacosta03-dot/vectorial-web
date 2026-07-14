const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { startStaticServer } = require('./server')

let mainWindow = null
let localServer = null

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })

  // Los enlaces externos (p.ej. "olvidé mi contraseña") se abren en el
  // navegador del sistema, no dentro de la ventana de la app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged) {
    // Desarrollo: usa el servidor de Vite ya corriendo (npm run dev --workspace=apps/vectorial-app)
    mainWindow.loadURL('http://localhost:5173')
  } else {
    const rendererDir = path.join(process.resourcesPath, 'renderer')
    const { server, port } = await startStaticServer(rendererDir)
    localServer = server
    mainWindow.loadURL(`http://localhost:${port}`)
  }
}

app.whenReady().then(() => {
  createMainWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  localServer?.close()
  localServer = null
})
