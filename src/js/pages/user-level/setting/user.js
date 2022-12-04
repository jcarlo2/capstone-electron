import {ipcRenderer} from "../../../variable.js";

export function setSettingUserLevel() {
    ipcRenderer.removeAllListeners('getRoleSettingUser')
    ipcRenderer.send('getRoleSettingUser')
    ipcRenderer.on('getRoleSettingUser',(e,role)=> {
       hideElements(role)
    })
}

function hideElements(role) {
    if(role === 1) {
        const interval = setInterval(()=> {
            const button = $('#user-button-section')
            const table = $('#user-table-section')
            const section = $('#setting-section')
            const change = $('#user-change-section')
            section.addClass('d-none')
            button.addClass('d-none')
            table.addClass('d-none')
            change.removeClass('d-none')
            if(button.length === 1 && table.length === 1) {
                section.removeClass('d-none')
                clearInterval(interval)
            }
        })
    }
}