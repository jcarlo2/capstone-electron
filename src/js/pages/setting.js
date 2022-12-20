import {startConnection} from "./action/setting/connection.js";
import {autoSetIp} from "../function.js";
import {setSettingUserLevel} from "./user-level/setting/user.js";
import {ipcRenderer, savePath} from "../variable.js";
import {startUser} from "./action/setting/user.js";
import {startOther} from "./action/setting/other.js";

$().ready(()=> {
    setInterval(()=> autoSetIp(),1000)
    $('#setting-section').load('src/pages/setting/connection.html')
    setConnection()
    setSettingUser()
    setOther()
    setLogout()
    startConnection()
})

function setConnection() {
    const interval = setInterval(()=> {
        $('#setting-connection').off('click')
        $('#setting-connection').on('click',()=> {
            $('#setting-connection').prop('disabled',true)
            $('#setting-user').prop('disabled',false)
            $('#setting-other').prop('disabled',false)
            $('#setting-section').load('src/pages/setting/connection.html')
            startConnection()
        })
        if($('#setting-connection').length === 1) clearInterval(interval)
    },1000)
}

function setSettingUser() {
    const interval = setInterval(()=> {
        $('#setting-user').off('click')
        $('#setting-user').on('click',()=> {
            $('#setting-connection').prop('disabled',false)
            $('#setting-user').prop('disabled',true)
            $('#setting-other').prop('disabled',false)
            $('#setting-section').load('src/pages/setting/user.html')
            setSettingUserLevel()
            startUser()
        })
        if($('#setting-user').length === 1) clearInterval(interval)
    },1000)
}

function setOther() {
    const interval = setInterval(()=> {
        $('#setting-other').off('click')
        $('#setting-other').on('click',()=> {
            $('#setting-connection').prop('disabled',false)
            $('#setting-user').prop('disabled',false)
            $('#setting-other').prop('disabled',true)
            $('#setting-section').load('src/pages/setting/other.html')
            startOther()
        })
        if($('#setting-other').length === 1) clearInterval(interval)
    },1000)
}

function setLogout() {
    const interval = setInterval(()=> {
        $('#setting-logout').off('click')
        $('#setting-logout').on('click',()=> {
            ipcRenderer.send('logout','Logout','Are you sure?',['Logout','No'])
            ipcRenderer.removeAllListeners('logout')
            ipcRenderer.on('logout',(e,num)=> {
                ipcRenderer.send('logoutAction',num)
            })
        })
        if($('#setting-logout').length === 1) clearInterval(interval)
    },1000)
}