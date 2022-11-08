import {startTransactionAdd} from "./action/transaction/add.js";
import {startReturn} from "./action/transaction/return.js";
import {setDelete, startHistory} from "./action/transaction/history.js";
import {clearTable,clearIntervals} from "../function.js";

$().ready(() => {
    $('#transaction-left').load('src/pages/transaction/left-add.html')
    $('#transaction-right').load('src/pages/transaction/right-add.html')
    clearIntervals()
    clearTable()
    setTransactionButtons()
})

export function setTransactionButtons() {
    $('#btn-transaction-add').off('click')
    $('#btn-transaction-add').on('click',() => {
        setAdd()
        clearIntervals()
        clearTable()
        startTransactionAdd()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    $('#btn-transaction-return').off('click')
    $('#btn-transaction-return').on('click',() => {
        setReturn()
        clearIntervals()
        clearTable()
        startReturn()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    $('#btn-transaction-history').off('click')
    $('#btn-transaction-history').on('click',() => {
        setHistory()
        clearIntervals()
        clearTable()
        startHistory()
        setDelete()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })
}

export function setAdd() {
    $('#btn-transaction-add').prop('disabled',true)
    $('#btn-transaction-return').prop('disabled',false)
    $('#btn-transaction-history').prop('disabled',false)
    $('#main-section').addClass('d-none')
    $('#transaction-left').load('src/pages/transaction/left-add.html')
    $('#transaction-right').load('src/pages/transaction/right-add.html')
}

function setReturn() {
    $('#btn-transaction-add').prop('disabled',false)
    $('#btn-transaction-return').prop('disabled',true)
    $('#btn-transaction-history').prop('disabled',false)
    $('#main-section').addClass('d-none')
    $('#transaction-left').load('src/pages/transaction/left-return.html')
    $('#transaction-right').load('src/pages/transaction/right-return.html')
}

function setHistory() {
    $('#btn-transaction-add').prop('disabled',false)
    $('#btn-transaction-return').prop('disabled',false)
    $('#btn-transaction-history').prop('disabled',true)
    $('#main-section').addClass('d-none')
    $('#transaction-left').load('src/pages/transaction/left-history.html')
    $('#transaction-right').load('src/pages/transaction/right-history.html')
}





