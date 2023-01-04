const electron = require('electron')
const path = require('path')
const {app, BrowserWindow, Menu, ipcMain, dialog} = electron
const lock = app.requestSingleInstanceLock()
const role = {'role': -1}

let logInWindow = null
let mainWindow = null
let settingWindow = null

let defaultResponse
let logoutResponse
let returnResponse
let deliveryResponse
let nullResponse
let inventoryDelete
let backToTransactionReturn
let buttonArray

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
        app.on('window-all-closed',()=> {
            console.log('ALL CLOSE')
            app.quit()
        })

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
                if(settingWindow !== null) settingWindow.close()
                if(mainWindow !== null) mainWindow.close()
                mainWindow = null
                logInWindow = null
                settingWindow = null
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
        // mainWindow.hide()
        mainWindow.on('closed',()=> {
            if(settingWindow !== null) settingWindow.close()
            mainWindow = null
            settingWindow = null
            setTimeout(()=> {
                if(logInWindow !== null) logInWindow.show()
            },500)
        })
    })
}

function createSettingWindow(filePath) {
    settingWindow = new BrowserWindow({
        resizable: false,
        // closable: false,
        frame: false,
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
        settingWindow.hide()
        // settingWindow.webContents.openDevTools()
        settingWindow.on('minimize',()=> settingWindow.hide())
        settingWindow.on('closed',()=> {
            settingWindow = null
        })
    })
}

ipcMain.on('logoutAction',(e,num)=> {
    if(num === 0) {
        if(settingWindow) settingWindow.close()
        if(mainWindow) mainWindow.close()
        setTimeout(()=> {
            logInWindow.show()
        },1000)
    } else settingWindow.focus()
})

ipcMain.on('setting',()=> {
    if(settingWindow === null) createSettingWindow('setting.html')
    else if(settingWindow.isVisible()) settingWindow.hide()
    else settingWindow.show()
})

ipcMain.on('getRoleMainTransaction',()=> {
    if(mainWindow) mainWindow.webContents.send('getRoleMainTransaction',role.role)
})

ipcMain.on('getRoleSettingUser',()=> {
    if(settingWindow) settingWindow.webContents.send('getRoleSettingUser',role.role)
    if(mainWindow) mainWindow.webContents.send('getRoleSettingUser',role.role)
})

ipcMain.on('setRole',(e, roleTemp)=> {
    role.role = roleTemp
})

ipcMain.on('login:verify',(e,is_verified,id,ip,password)=> {
    if(is_verified && !mainWindow) {
        createMainWindow('main.html')
        createSettingWindow('setting.html')
        // mainWindow.webContents.openDevTools()
        mainWindow.webContents.once('did-finish-load',()=> mainWindow.webContents.send('login:verify',id,ip,password))
        logInWindow.hide()
    }else if(is_verified && mainWindow) {
        logInWindow.hide()
        mainWindow.show()
        settingWindow.hide()
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

ipcMain.on('logout',(e,title,message,button)=> {
    logoutResponse = dialog.showMessageBoxSync(mainWindow,{
        title: title,
        message: message,
        type: 'none',
        noLink: true,
        defaultId: button.length - 1,
        buttons:button
    })
    settingWindow.webContents.send('logout', logoutResponse)
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


