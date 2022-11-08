import {
    ipcRenderer,
} from "./variable.js";
import {setTransactionButtons} from "./pages/transaction.js";
import {startTransactionAdd} from "./pages/action/transaction/add.js";
import {startInventoryAdd} from "./pages/action/inventory/add.js";
import {setInventoryButtons} from "./pages/inventory.js";
import {clearIntervals} from "./function.js";


$().ready(() => {
    const main = $('#main-section')
    const spinner = $('#main-spinner')
    ipcRenderer.on('login:verify',(e, id)=> {
        $('#main-user-name').text(id)
    })

    setTimeout(()=> {
        $('#main-transaction').click()
    },500)

    $('#main-transaction').on('click',()=> {
        $('#main-transaction').prop('disabled',true)
        $('#main-inventory').prop('disabled',false)
        $('#main-generate').prop('disabled',false)
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

    $('#main-inventory').on('click',()=> {
        $('#main-transaction').prop('disabled',false)
        $('#main-inventory').prop('disabled',true)
        $('#main-generate').prop('disabled',false)
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

    $('#main-generate').on('click',()=> {
        $('#main-transaction').prop('disabled',false)
        $('#main-inventory').prop('disabled',false)
        $('#main-generate').prop('disabled',true)
        $('#main-log').prop('disabled',false)
        main.addClass('d-none')
        spinner.removeClass('d-none')
        $('#main-section').load('src/pages/generate.html')
        clearIntervals()
        setTimeout(()=> {
            // $('#generate-left').load('src/pages/generate/generate-left.html')
            // $('#generate-right').load('src/pages/generate/generate-right.html')
            spinner.addClass('d-none')
            main.removeClass('d-none')
        },1000)
    })

    $('#main-log').on('click',()=> {
        $('#main-transaction').prop('disabled',false)
        $('#main-inventory').prop('disabled',false)
        $('#main-generate').prop('disabled',false)
        $('#main-log').prop('disabled',true)
        $('#main-section').load('src/pages/log.html')
        clearIntervals()
    })
})


