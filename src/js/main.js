import {ip, ipcRenderer,} from "./variable.js";
import {setTransactionButtons} from "./pages/transaction.js";
import {startTransactionAdd} from "./pages/action/transaction/add.js";
import {startInventoryAdd} from "./pages/action/inventory/add.js";
import {setInventoryButtons} from "./pages/inventory.js";
import {ajaxDefaultArray, ajaxUrl, autoSetIp, clearIntervals} from "./function.js";
import {startGenerate} from "./pages/action/report/generate.js";
import {startLog} from "./pages/action/log/log.js";


$().ready(() => {
    const main = $('#main-section')
    const spinner = $('#main-spinner')
    setClock()

    ipcRenderer.on('login:verify',(e, id,password)=> {
        const interval = setInterval(()=> {
            if(ip.address !==  'http://000.000.000A:8091') {
                $('#main-user-name').text(id)
                checkRole(id,password)
                clearInterval(interval)
            }
        },1000)
    })

    function checkRole(id,password) {
        ajaxDefaultArray('/api/user/get-role',{'username': id,'password': password})
            .then((response)=> {
                ipcRenderer.removeAllListeners('getRoleMainTransaction')
                ipcRenderer.send('setRole',response)
                ipcRenderer.send('getRoleMainTransaction')
                ipcRenderer.on('getRoleMainTransaction',(e,role)=> {
                    if(role === -1) checkRole(id,password)
                    else {
                        setTimeout(()=> {
                            $('#main-transaction').click()
                        },500)
                    }
                })
            })
    }

    $('#main-transaction').off('click')
    $('#main-transaction').on('click',()=> {
        $('#main-transaction').prop('disabled',true)
        $('#main-inventory').prop('disabled',false)
        $('#main-report').prop('disabled',false)
        $('#main-log').prop('disabled',false)
        main.addClass('d-none')
        spinner.removeClass('d-none')
        main.load('src/pages/transaction.html')
        clearIntervals()
        setTimeout(()=> {
            $('#transaction-left').load('src/pages/transaction/left-add.html')
            $('#transaction-right').load('src/pages/transaction/right-add.html')
            startTransactionAdd()
            setTransactionButtons()
            spinner.addClass('d-none')
            main.removeClass('d-none')
        },1000)
    })

    $('#main-inventory').off('click')
    $('#main-inventory').on('click',()=> {
        $('#main-transaction').prop('disabled',false)
        $('#main-inventory').prop('disabled',true)
        $('#main-report').prop('disabled',false)
        $('#main-log').prop('disabled',false)
        main.addClass('d-none')
        spinner.removeClass('d-none')
        main.load('src/pages/inventory.html')
        clearIntervals()
        setTimeout(()=> {
            $('#inventory-left').load('src/pages/inventory/add-left.html')
            $('#inventory-right').load('src/pages/inventory/add-right.html')
            startInventoryAdd()
            setInventoryButtons()
            spinner.addClass('d-none')
            main.removeClass('d-none')
        },1000)
        clearIntervals()
    })

    $('#main-report').off('click')
    $('#main-report').on('click',()=> {
        $('#main-transaction').prop('disabled',false)
        $('#main-inventory').prop('disabled',false)
        $('#main-report').prop('disabled',true)
        $('#main-log').prop('disabled',false)
        main.addClass('d-none')
        spinner.removeClass('d-none')
        $('#main-section').load('src/pages/report.html')
        clearIntervals()
        setTimeout(()=> {
            $('#report-main-left').load('src/pages/report/generate-left.html')
            $('#report-main-right').load('src/pages/report/generate-right.html')
            startGenerate()
            spinner.addClass('d-none')
            main.removeClass('d-none')
        },1000)
    })
    $('#main-log').off('click')
    $('#main-log').on('click',()=> {
        $('#main-transaction').prop('disabled',false)
        $('#main-inventory').prop('disabled',false)
        $('#main-report').prop('disabled',false)
        $('#main-log').prop('disabled',true)
        main.addClass('d-none')
        spinner.removeClass('d-none')
        $('#main-section').load('src/pages/log.html')
        clearIntervals()
        setTimeout(()=> {
            spinner.addClass('d-none')
            main.removeClass('d-none')
            startLog()
            main.removeClass('d-none')
            spinner.addClass('d-none')
        },1000)
    })

    $('#main-setting').off('click')
    $('#main-setting').on('click',()=> {
        ipcRenderer.send('setting')
    })

    setInterval(()=> {
        autoSetIp()
    },1000)

    function setClock() {
        setInterval(()=> {
            ajaxUrl('/api/date/get-time').then((response)=> {
                $('#clock').text(response)
            })
        },500)
    }
})


