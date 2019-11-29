const Parking = require('./core/Parking-2')
const [, , ...args] = [...process.argv]
const w = 500, h = 650
Parking.init(100)
if (args.includes('remove')) {
	Parking.remove(parseInt(args[1]))
	process.exit(0)
} else if (args.includes('add')) {
	Parking.add()
	process.exit(0)
} else if (args.includes('clear')) {
	Parking.clear()
	process.exit(0)
} else if (args.includes('list')) {
	console.log(Parking.list())
	process.exit(0)
} else {
	const url = require('url')
	const path = require('path')
	const electron = require('electron')
	require('ejs-electron')
	const { app, ipcMain : ipcm, BrowserWindow, Menu } = electron
	const mainMenuTemplate = [
			{
				label: 'Mon parking',
				submenu: [
					{
						label: 'Quitter',
						accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
						click() {
							app.quit()
						}
					}
				]
			}
		]
	//Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate))
	app.on('ready', () => {
		const mainWindow = new BrowserWindow({ minWidth: w, minHeight: h, maxWidth: w, maxHeight: h })
		mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'views', 'parking.ejs'),
			protocol: 'file',
			slashes: true
		}))
		mainWindow.on('closed', () => {
			app.quit()
		})
		ipcm.on('add', e => {
			const res = Parking.add()
			mainWindow.webContents.send('added', res)
		})
		ipcm.on('remove', (e, ticket) => {
			const res = Parking.remove(ticket)
			mainWindow.webContents.send('removed', res)
		})
		ipcm.on('change-theme', (e, theme) => {
			Parking.changeTheme(theme)
		})
		ipcm.on('clear',() => {
			const res = Parking.clear()
			mainWindow.webContents.send('cleared', res)
		})
	})
}
