const electron = require('electron')
const path = require('path')
const express = require("express");
const kill = require("tree-kill");
const exec = require('child_process').exec;
const port = express()
port.listen(3000)
const {app, BrowserWindow, Menu, ipcMain, dialog} = electron

let logInWindow;
let mainWindow;
let serverProcess;

const mainMenuTemplate = [
]

app.on('ready',()=> {
    startServer();

    logInWindow = new BrowserWindow({
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)

    logInWindow.loadFile('index.html')
    logInWindow.maximize()
    logInWindow.on('closed', ()=> {
        kill(serverProcess.pid);
        logInWindow = null
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
     mainWindow = new BrowserWindow({
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    mainWindow.loadFile(filePath)

    mainWindow.on('closed',()=> {
        kill(serverProcess.pid);
        app.quit()
        mainWindow = null
    })

    if(is_maximized) mainWindow.maximize()
    return mainWindow
}

ipcMain.on('login:verify',(e,is_verified,id)=> {
    if(is_verified) {
        const window = createWindow('main.html',true)
        window.webContents.openDevTools()
        window.webContents.once('did-finish-load',()=> {
            window.webContents.send('login:verify',id)
        })
        logInWindow.hide()
    }
})

ipcMain.on('showError',(e,title,message)=> {
    dialog.showErrorBox(title,message)
})

ipcMain.on('showMessage',(e,title,message)=> {
    dialog.showMessageBoxSync(mainWindow,{title: title, message: message, type: 'none'})
})
