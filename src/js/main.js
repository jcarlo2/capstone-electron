import {ipcRenderer} from "./variable.js";

$().ready(() => {
    $('#main-section').load('src/pages/transaction.html')
    ipcRenderer.on('login:verify',(e, id)=> {
        $('#main-user-name').text(id)
    })
})

