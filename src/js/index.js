import {ipcRenderer} from "./variable.js";

$().ready(()=> {
    $('#index-login').off('click')
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
                if(response) {
                    ipcRenderer.send('login:verify', response,username)
                    ipcRenderer.on('login:verify',(e,id)=> {
                        console.log(id)
                    })
                }else ipcRenderer.send('showError','Login','Invalid: username or password')
            }
        })
    })

    $(document).on('keyup',(e)=> {
        if(e.code === 'Enter') $('#index-login').click()
    })
})