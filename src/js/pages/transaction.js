import {
    t_add_populate,
    t_ret_populate,
    mainSection,
    t_ret_clear,
    json_var,
    t_ret_new_total,
    t_history_populate, t_history_delete
} from "../variable.js";
import {startAdd} from "./action/transaction/add.js";
import {startReturn, setNewTotal, setReturnResetButton} from "./action/transaction/return.js";
import {setDelete, startHistory} from "./action/transaction/history.js";

$().ready(() => {
    $('#transaction-left').load('src/pages/transaction/left-add.html')
    $('#transaction-right').load('src/pages/transaction/right-add.html')
    clear()
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
        clear()
        startAdd()
        setTimeout(()=> mainSection.removeClass('d-none'),500)
    })

    $('#btn-transaction-return').on('click',() => {
        mainSection.addClass('d-none')
        $('#transaction-left').load('src/pages/transaction/left-return.html')
        $('#transaction-right').load('src/pages/transaction/right-return.html')
        clear()
        startReturn()
        setReturnResetButton()
        setNewTotal()
        setTimeout(()=> mainSection.removeClass('d-none'),500)
    })

    $('#btn-transaction-history').on('click',() => {
        mainSection.addClass('d-none')
        $('#transaction-left').load('src/pages/transaction/left-history.html')
        $('#transaction-right').load('src/pages/transaction/right-history.html')
        clear()
        startHistory()
        setDelete()
        setTimeout(()=> mainSection.removeClass('d-none'),500)
    })


}

export function clear() {
    clearInterval(t_add_populate.getIntervalId())
    clearInterval(t_ret_populate.getIntervalId())
    clearInterval(t_ret_clear.getIntervalId())
    clearInterval(t_ret_new_total.getIntervalId())
    clearInterval(t_history_populate.getIntervalId())
    clearInterval(t_history_delete.getIntervalId())
    json_var.t_ret_table = []
    json_var.t_ret_table_null = []
}



