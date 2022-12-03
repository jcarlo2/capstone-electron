import {connection_checker, ip, ipcRenderer} from "../../../variable.js";
import {ajaxUrl} from "../../../function.js";

export function startConnection() {
    setAddress()
    setChangeButton()
    checkConnection()
}

function setChangeButton() {
    const interval = setInterval(()=> {
        $('#connection-change').off('click')
        $('#connection-change').on('click',()=> {
            ip.address = $('#connection-address').val()
            ipcRenderer.send('setIp',ip.address)
            $('#connection-change').prop('disabled',true)
            setTimeout(()=> $('#connection-change').prop('disabled',false),15000)
        })
        if($('#connection-change').length === 1) clearInterval(interval)
    })
}

function setAddress() {
    const interval = setInterval(()=> {
        $('#connection-address').val(ip.address)
        if($('#connection-address').length === 1 && $('#connection-address').val() !== '000.000.000.000') {
            clearInterval(interval)
        }
    })
}

function checkConnection() {
    connection_checker.intervalId = setInterval(()=> {
        const message = $('#connection-message')
        const circle = $('#connection-circle')
        ajaxUrl('/api/log/get-all-log').then(()=> {
            message.val('Connected')
            message.addClass('text-success')
            message.addClass('border-success')
            message.removeClass('text-danger')
            message.removeClass('border-danger')
            circle.addClass('text-success')
            circle.removeClass('text-danger')
        }).catch(()=> {
            message.val('Not Connected')
            message.removeClass('text-success')
            message.removeClass('border-success')
            message.addClass('text-danger')
            message.addClass('border-danger')
            circle.removeClass('text-success')
            circle.addClass('text-danger')
        })
    },3000)
}