
const electron = require('electron')
const path = require('path')
const {app, BrowserWindow, Menu, ipcMain, dialog} = electron
const lock = app.requestSingleInstanceLock()
const ipMain = {
    'http': 'http://',
    'address': '000.000.000.000',
    'port': ':8091',
    'url': 'http://000.000.000:8091',
}

const role = {'role': -1}

let logInWindow
let mainWindow
let settingWindow

let defaultResponse
let returnResponse
let deliveryResponse
let nullResponse
let inventoryDelete
let backToTransactionReturn
let buttonArray

app.on('window-all-closed', () => {
    app.quit()
})

if(!lock) app.quit()
else {
    app.on('second-instance', () => {
        if (logInWindow && logInWindow.isVisible()) {
            if (logInWindow.isMinimized()) logInWindow.restore()
            logInWindow.focus()
        }else if(mainWindow && mainWindow.isVisible()) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    app.on('ready',()=> {
        logInWindow = new BrowserWindow({
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            icon: 'src/image/smile.ico'
        })

        const mainMenu = Menu.buildFromTemplate([])
        Menu.setApplicationMenu(mainMenu)
        logInWindow.loadFile('index.html').then(()=>{
            logInWindow.maximize()
            // logInWindow.webContents.openDevTools()
            logInWindow.on('closed', ()=> {
                logInWindow = null
            })
        })
    })
}

function createMainWindow(filePath) {
     mainWindow = new BrowserWindow({
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
         icon: 'src/image/smile.ico'
    })

    mainWindow.loadFile(filePath).then(()=> {
        mainWindow.maximize()
        mainWindow.hide()
        mainWindow.on('closed',()=> {
            app.quit()
            mainWindow = null
            settingWindow = null
        })
    })
}

function createSettingWindow(filePath) {
    settingWindow = new BrowserWindow({
        resizable: false,
        width: 500,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: 'src/image/smile.ico'
    })

    settingWindow.loadFile(filePath).then(()=> {
        // settingWindow.hide()
        settingWindow.on('close',(event)=> {
            event.preventDefault()
            settingWindow.hide()
        })
    })
}


ipcMain.on('setting',()=> {
    if(settingWindow.isVisible()) settingWindow.hide()
    else settingWindow.show()
})

ipcMain.on('getRole',()=> {
    if(settingWindow) settingWindow.webContents.send('getRole',role.role)
    if(mainWindow) mainWindow.webContents.send('getRole',role.role)
})

ipcMain.on('setRole',(e, roleTemp)=> {
    role.role = roleTemp
})

ipcMain.on('setIp',(e,address)=> {
    ipMain.address = address
    ipMain.url = ipMain.http + address + ipMain.port
})

ipcMain.on('getIp',()=> {
    if(settingWindow) settingWindow.webContents.send('getIp',ipMain)
    if(logInWindow) logInWindow.webContents.send('getIp',ipMain)
    if(mainWindow) mainWindow.webContents.send('getIp',ipMain)
})


ipcMain.on('login:verify',(e,is_verified,id,ip,password)=> {
    if(is_verified && mainWindow === undefined) {
        createMainWindow('main.html')
        createSettingWindow('setting.html')
        // mainWindow.webContents.openDevTools()
        settingWindow.webContents.openDevTools()
        mainWindow.webContents.once('did-finish-load',()=> mainWindow.webContents.send('login:verify',id,ip,password))
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
        message: 'Archive ' + id,
        type: 'none',
        noLink: true,
        defaultId: 1,
        buttons:['Archive','Cancel']
    })
    mainWindow.webContents.send('returnResponse', returnResponse)
})

ipcMain.on('default',(e,title,message,button)=> {
    defaultResponse = dialog.showMessageBoxSync(mainWindow,{
        title: title,
        message: message,
        type: 'none',
        noLink: true,
        defaultId: button.length - 1,
        buttons:button
    })
    mainWindow.webContents.send('default', defaultResponse)
})

ipcMain.on('buttonArray',(e,title,message,button,def)=> {
    buttonArray = dialog.showMessageBoxSync(mainWindow,{
        title: title,
        message: message,
        type: 'none',
        noLink: true,
        defaultId: def,
        buttons:button
    })
    mainWindow.webContents.send('buttonArray', buttonArray)
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

ipcMain.on('backToTransactionReturn',()=> {
    backToTransactionReturn = dialog.showMessageBoxSync(mainWindow,{
        title: 'Back',
        message: 'Route to Transaction Return Tab',
        type: 'none',
        noLink: true,
        defaultId: 1,
        buttons:['Yes','No']
    })
    mainWindow.webContents.send('backToTransactionReturn', backToTransactionReturn)
})


