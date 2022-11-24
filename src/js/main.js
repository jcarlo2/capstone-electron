import {
    ipcRenderer,
} from "./variable.js";
import {setTransactionButtons} from "./pages/transaction.js";
import {startTransactionAdd} from "./pages/action/transaction/add.js";
import {startInventoryAdd} from "./pages/action/inventory/add.js";
import {setInventoryButtons} from "./pages/inventory.js";
import {clearIntervals} from "./function.js";
import {startGenerate} from "./pages/action/report/generate.js";
import {startLog} from "./pages/action/log/log.js";


$().ready(() => {
    const main = $('#main-section')
    const spinner = $('#main-spinner')
    ipcRenderer.on('login:verify',(e, id)=> {
        $('#main-user-name').text(id)
    })

    setTimeout(()=> {
        $('#main-transaction').click()
    },500)

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
            spinner.addClass('d-none')
            main.removeClass('d-none')
            startTransactionAdd()
            setTransactionButtons()
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
            spinner.addClass('d-none')
            main.removeClass('d-none')
            startInventoryAdd()
            setInventoryButtons()
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
            spinner.addClass('d-none')
            main.removeClass('d-none')
            startGenerate()
        },1000)
    })
    $('#main-log').off('click')
    $('#main-log').on('click',()=> {
        $('#main-transaction').prop('disabled',false)
        $('#main-inventory').prop('disabled',false)
        $('#main-report').prop('disabled',false)
        $('#main-log').prop('disabled',true)
        $('#main-section').load('src/pages/log.html')
        clearIntervals()
        startLog()
    })

    $('#main-setting').off('click')
    $('#main-setting').on('click',()=> {
        ipcRenderer.send('setting')
        $('#setting-section').load('src/pages/setting/connection.html')
    })
})


