import {ip, ipcRenderer} from "./variable.js";
import {ajaxDefaultArray, autoSetIp} from "./function.js";

$().ready(()=> {
    const interval = setInterval(()=> {
        if(ip.address !==  'http://000.000.000A:8091') {
            $('#index-login').prop('disabled',false)
            clearInterval(interval)
        }
    },1000)

    setInterval(()=> autoSetIp(),1000)

    setLogInButton()

    $(document).on('keyup',(e)=> {
        if(e.code === 'Enter') $('#index-login').click()
    })

    $('#index-ip-change').on('shown.bs.modal',()=> {
        $('#ip-address').focus()
    })
})

function setLogInButton() {
    $('#index-login').off('click')
    $('#index-login').on('click',()=> {
        $('#index-login').prop('disabled',true)
        $('#index-ip').prop('disabled',true)
        $('#index-login').text('Logging in')
        $('#spinner-login').removeClass('d-none')
        const username = $('#index-username').val()
        const password = $('#index-password').val()
        if(username.trim() === '' || password.trim() === '') {
            ipcRenderer.send('showError','Input','Check input!')
            reset()
        }else {
            ajaxDefaultArray('/api/user/verify',{'username': username,'password': password}).then((response)=> {
                if(response) ipcRenderer.send('login:verify', response,username,password)
                else ipcRenderer.send('showError','Login','Invalid: username or password')
                reset()
            }).catch(()=> {
                ipcRenderer.send('showError','Server','Check server connection!')
                reset()
            })
        }
    })
}

function reset() {
    $('#index-login').prop('disabled',false)
    $('#index-login').text('Login')
    $('#spinner-login').addClass('d-none')
}
