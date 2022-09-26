import {t_add_populate,t_ret_populate, mainSection} from "../variable.js";
import {populateProductList} from "./action/transaction/add.js";
import {getReport} from "./action/transaction/return.js";

$().ready(() => {
    $('#transaction-left').load('src/pages/transaction/left-add.html')
    $('#transaction-right').load('src/pages/transaction/right-add.html')
    clearInterval(t_ret_populate.getIntervalId())
    setTransactionButton()
})

export function setTransactionButton() {
    $(window).on('resize',() => {
        const media = window.matchMedia("(max-width: 1024px)")
        if(media.matches) {
            $('#btn-transaction-add').text('Add')
            $('#btn-transaction-return').text('Return')
        }else {
            $('#btn-transaction-add').text('Add Transaction')
            $('#btn-transaction-return').text('Return Transaction')
        }
    })

    $('#btn-transaction-add').on('click',() => {
        mainSection.addClass('d-none')
        $('#transaction-left').load('src/pages/transaction/left-add.html')
        $('#transaction-right').load('src/pages/transaction/right-add.html')
        clearInterval(t_add_populate.getIntervalId())
        clearInterval(t_ret_populate.getIntervalId())
        populateProductList()
        setTimeout(()=> mainSection.removeClass('d-none'),500)
    })

    $('#btn-transaction-return').on('click',() => {
        mainSection.addClass('d-none')
        $('#transaction-left').load('src/pages/transaction/left-return.html')
        $('#transaction-right').load('src/pages/transaction/right-return.html')
        clearInterval(t_add_populate.getIntervalId())
        clearInterval(t_ret_populate.getIntervalId())
        getReport()
        setTimeout(()=> mainSection.removeClass('d-none'),500)
    })

    $('#btn-transaction-history').on('click',() => {
        mainSection.addClass('d-none')
        $('#transaction-left').load('src/pages/transaction/left-history.html')
        $('#transaction-right').load('src/pages/transaction/right-history.html')
        clearInterval(t_add_populate.getIntervalId())
        clearInterval(t_ret_populate.getIntervalId())
        setTimeout(()=> mainSection.removeClass('d-none'),500)
    })
}



