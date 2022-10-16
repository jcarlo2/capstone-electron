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
let returnResponse
let deliveryResponse
let nullResponse
let inventoryDelete

const mainMenuTemplate = [
]

app.on('ready',()=> {
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
        // kill(serverProcess.pid);
        logInWindow = null
    })
})

app.on('window-all-closed', () => {
    // kill(serverProcess.pid);
    app.quit()
})

function startServer(){
    let server = `${path.join(app.getAppPath(), 'src/content/java/capstone-backend.jar')}`;
     serverProcess = exec('java -jar '+ server, ()=> {

     })
}

function createMainWindow(filePath) {
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
        // kill(serverProcess.pid);
        app.quit()
        mainWindow = null
    })

    mainWindow.maximize()
}

ipcMain.on('login:verify',(e,is_verified,id)=> {
    if(is_verified && mainWindow === undefined) {
        createMainWindow('main.html')
        mainWindow.webContents.openDevTools()
        mainWindow.webContents.once('did-finish-load',()=> {
            mainWindow.webContents.send('login:verify',id)
        })
        logInWindow.hide()
    }
})

ipcMain.on('showError',(e,title,message)=> {
    dialog.showErrorBox(title,message)
})

ipcMain.on('showMessage',(e,title,message)=> {
    dialog.showMessageBoxSync(mainWindow,{
        title: title,
        message: message,
        type: 'none'})
})

ipcMain.on('return',(e,id)=> {
    returnResponse = dialog.showMessageBoxSync(mainWindow,{
        title: 'Transaction History',
        message: 'Delete ' + id,
        type: 'none',
        noLink: true,
        defaultId: 2,
        buttons:['Delete','Delete All','Cancel']
    })
    mainWindow.webContents.send('returnResponse', returnResponse)
})

ipcMain.on('delivery',(e,id)=> {
    deliveryResponse = dialog.showMessageBoxSync(mainWindow,{
        title: 'Delivery Report',
        message: 'Save report: ' + id,
        type: 'none',
        noLink: true,
        defaultId: 1,
        buttons:['Save','Cancel']
    })
    mainWindow.webContents.send('deliveryResponse', deliveryResponse)
})

ipcMain.on('nullReport',(e,id)=> {
    nullResponse = dialog.showMessageBoxSync(mainWindow,{
        title: 'Null Report',
        message: 'Save report: ' + id,
        type: 'none',
        noLink: true,
        defaultId: 1,
        buttons:['Save','Cancel']
    })
    mainWindow.webContents.send('nullResponse', nullResponse)
})

ipcMain.on('inventoryDelete',(e,id,link,flag)=> {
    let str = 'Archive report: '
    if(flag) str = 'Warning: report is link to ' + link + '\nArchive report : '
    inventoryDelete = dialog.showMessageBoxSync(mainWindow,{
        title: 'Archive',
        message: str + id,
        type: 'none',
        noLink: true,
        defaultId: 1,
        buttons:['Archive','Cancel']
    })
    mainWindow.webContents.send('inventoryDeleteResponse', inventoryDelete)
})


