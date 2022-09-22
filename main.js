const electron = require('electron')
const path = require('path')
const express = require("express");
const kill = require("tree-kill");
const exec = require('child_process').exec;
const port = express()
port.listen(3000)
const {app, BrowserWindow, Menu, ipcMain, dialog} = electron

let mainWindow;
let addWindow;
let serverProcess;

const mainMenuTemplate = [
]

app.on('ready',()=> {
    startServer();

    mainWindow = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)

    mainWindow.loadFile('index.html')
    mainWindow.maximize()
    mainWindow.on('closed', ()=> {
        kill(serverProcess.pid);
        mainWindow = null
    })
})

app.on('window-all-closed', () => {
    kill(serverProcess.pid);
    app.quit()
})

function startServer(){
    let server = `${path.join(app.getAppPath(), 'src/content/java/capstone-backend.jar')}`;
     serverProcess = exec('java -jar '+ server, ()=> {

     })
}

function createWindow(filePath,is_maximized) {
     addWindow = new BrowserWindow({
        minWidth: 1024,
        minHeight: 768,
        height: 1024,
        width: 768,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    addWindow.loadFile(filePath)

    addWindow.on('closed',()=> {
        kill(serverProcess.pid);
        app.quit()
        addWindow = null
    })

    if(is_maximized) addWindow.maximize()
    return addWindow
}

ipcMain.on('login:verify',(e,is_verified,id)=> {
    if(is_verified) {
        const window = createWindow('main.html',true)
        window.webContents.openDevTools()
        window.webContents.once('did-finish-load',()=> {
            window.webContents.send('login:verify',id)
        })
        mainWindow.hide()
    }
})

ipcMain.on('showError',(e,title,message)=> {
    dialog.showErrorBox(title,message)
})
