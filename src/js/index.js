import {ip, ipcRenderer} from "./variable.js";
import {ajaxDefaultArray, autoIpSetter} from "./function.js";

$().ready(()=> {
    $('#index-login').off('click')
    $('#index-login').on('click',()=> {
        ipcRenderer.send('getIp')
        ipcRenderer.removeAllListeners('getIp')
        ipcRenderer.on('getIp',(e,ipMain)=> {
            $('#index-login').prop('disabled',true)
            $('#index-ip').prop('disabled',true)
            $('#index-login').text('Logging in')
            $('#spinner-login').removeClass('d-none')
            const username = $('#index-username').val()
            const password = $('#index-password').val()
            if(username.trim() === '' || password.trim() === '') {
                ipcRenderer.send('showError','Input','Check input!')
                $('#spinner-login').addClass('d-none')
                $('#index-login').prop('disabled',false)
                $('#index-ip').prop('disabled',false)
                $('#index-login').text('Login')
            }else {
                ajaxDefaultArray('/api/user/verify',{'username': username,'password': password}).then((response)=> {
                    if(response) ipcRenderer.send('login:verify', response,username,ipMain,password)
                    else ipcRenderer.send('showError','Login','Invalid: username or password')
                    $('#index-login').prop('disabled',false)
                    $('#index-ip').prop('disabled',false)
                    $('#index-login').text('Login')
                    $('#spinner-login').addClass('d-none')
                }).catch(()=> {
                    ipcRenderer.send('showError','Server','Check server connection!')
                    $('#index-login').prop('disabled',false)
                    $('#index-ip').prop('disabled',false)
                    $('#index-login').text('Login')
                    $('#spinner-login').addClass('d-none')
                })
            }
        })

    })

    $(document).on('keyup',(e)=> {
        if(e.code === 'Enter') $('#index-login').click()
    })

    $('#index-ip').on('click',()=> {
        ipcRenderer.send('getIp')
        ipcRenderer.removeAllListeners('getIp')
        ipcRenderer.on('getIp',(e,ipMain)=> {
            $('#ip-address').val(ipMain.address)
            console.log(ipMain.address)
            $('#index-ip-change').modal('show')
        })
    })

    $('#index-ip-change').on('shown.bs.modal',()=> {
        $('#ip-address').focus()
    })

    $('#ip-change-button').on('click',()=> {
        ipcRenderer.send('setIp',$('#ip-address').val())
        ip.address = $('#ip-address').val()
        ip.url = ip.http + ip.address + ip.port
        $('#index-ip-change').modal('hide')
    })

    autoIpSetter()
})