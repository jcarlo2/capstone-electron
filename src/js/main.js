import {clear, setTransactionButton} from "./pages/transaction.js";
import {ipcRenderer} from "./variable.js";
import {startAdd, setAddClearButton} from "./pages/action/transaction/add.js";
import {setReturnResetButton} from "./pages/action/transaction/return.js";


$().ready(() => {
    ipcRenderer.on('login:verify',(e, id)=> {
        $('#main-user-name').text(id)
    })

    setTimeout(()=> {
        $('#main-transaction').click()
    },500)

    $('#main-transaction').on('click',()=> {
        const main = $('#main-section')
        const spinner = $('#main-spinner')
        main.addClass('d-none')
        spinner.removeClass('d-none')
        main.load('src/pages/transaction.html')
        clear()
        setTimeout(()=> {
            $('#transaction-left').load('src/pages/transaction/left-add.html')
            $('#transaction-right').load('src/pages/transaction/right-add.html')
            spinner.addClass('d-none')
            main.removeClass('d-none')
            startAdd()
            setTransactionButton()
            setReturnResetButton()
            setAddClearButton()
        },1000)
    })

    $('#main-inventory').on('click',()=> {
        $('#main-section').load('src/pages/inventory.html')
        clear()
    })

    $('#main-generate').on('click',()=> {
        $('#main-section').load('src/pages/generate.html')
        clear()
    })

    $('#main-log').on('click',()=> {
        $('#main-section').load('src/pages/log.html')
        clear()
    })
})


