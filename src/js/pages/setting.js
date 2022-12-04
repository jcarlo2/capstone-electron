import {startConnection} from "./action/setting/connection.js";
import {autoIpSetter} from "../function.js";
import {setSettingUserLevel} from "./user-level/setting/user.js";
import {ipcRenderer} from "../variable.js";
import {startUser} from "./action/setting/user.js";

$().ready(()=> {
    $('#setting-section').load('src/pages/setting/connection.html')
    setConnection()
    setSettingUser()
    setOther()
    setLogout()
    autoIpSetter()
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
        })
        if($('#setting-other').length === 1) clearInterval(interval)
    },1000)
}

function setLogout() {
    const interval = setInterval(()=> {
        $('#setting-logout').off('click')
        $('#setting-logout').on('click',()=> {
            ipcRenderer.send('default','Logout','Are you sure?',['Logout','No'])
            ipcRenderer.removeAllListeners('default')
            ipcRenderer.on('default',(e,num)=> {
                if(num === 1) {
                    // LOGOUT
                }
            })
        })
        if($('#setting-logout').length === 1) clearInterval(interval)
    },1000)
}