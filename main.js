const {app, BrowserWindow} = require('electron')

function quit () {
  if (process.platform !== 'darwin') { // darwin 是 mac 的代號
    app.quit()
  }
}

app.on('window-all-closed', quit) // Quit when all windows are closed.

app.on('ready', function () {
  if (process.argv.length >= 3) {
    let runFile = process.argv[2]
    if (runFile.indexOf('.html') >= 0) {
      let bw = new BrowserWindow({width: 600, height: 600})
      bw.loadURL('file://' + __dirname + '/' + runFile)
      bw.on('closed', function () { bw = null })
    } else {
      require(__dirname + '/' + runFile.replace('.js$', ''))
      quit()
    }
  }
})
