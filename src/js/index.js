import {ipcRenderer} from "./variable.js";

$('#index-login').on('click',()=> {
    const username = $('#index-username').val()
    const password = $('#index-password').val()
    $.ajax({
        url: 'http://localhost:8080/api/login/verify',
        type: 'GET',
        data:{
            'username': username,
            'password': password,
        },
        success: function (response) {
            if(response) ipcRenderer.send('login:verify', response,username)
            ipcRenderer.on('login:verify',(e,id)=> {
                console.log(id)
            })
        },
        error: function (response) {
            // handle error - no connection
        }
    })
})