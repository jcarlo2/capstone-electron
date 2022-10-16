import {globalButtons} from "./variable.js";

$().ready(()=> {
    const button = globalButtons
    $(document).on('keyup',(e)=> {
        if(e.code === 'Backquote') backquote()
        else if(e.code === 'Enter') enter()
        else if(e.altKey && e.ctrlKey && e.key === '1' && $('#main-transaction').prop('disabled') === false) $('#main-transaction').click()
        else if(e.altKey && e.ctrlKey && e.key === '2' && $('#main-inventory').prop('disabled') === false) $('#main-inventory').click()
        else if(e.altKey && e.ctrlKey && e.key === '3' && $('#main-generate').prop('disabled') === false) $('#main-generate').click()
        else if(e.altKey && e.ctrlKey && e.key === '4' && $('#main-log').prop('disabled') === false) $('#main-log').click()
        else if(e.altKey && e.ctrlKey && e.key === '5') console.log('This is for settings')
        else if(e.altKey && e.key === '1') altKeyAndOne()
        else if(e.altKey && e.key === '2') altKeyAndTwo()
        else if(e.altKey && e.key === '3') altKeyAndThree()
        else if(e.altKey && e.key === '4') altKeyAndFour()
    })

    function backquote() {
        $('#transaction-add-search').focus()
        $('#transaction-return-left-search').focus()
        $('#inventory-add-search').focus()
        $('#inventory-null-search').focus()
    }

    function enter() {
        if($('#transaction-add-btn').is(':visible')) $('#transaction-add-btn').click()
        else if($('#transaction-add-modal-confirm').is(':visible') && $('#transaction-add-modal-confirm').prop('disabled') === false) $('#transaction-add-modal-confirm').click()
        else if($('#transaction-return-pay-btn').is(':visible')) $('#transaction-return-pay-btn').click()
        else if($('#transaction-left-edit-button').is(':visible')) $('#transaction-left-edit-button').click()
        else if($('#transaction-return-modal-update').is(':visible')) $('#transaction-return-modal-update').click()
    }

    function altKeyAndOne() {
        if(button.transactionAdd.length === 1 && button.transactionAdd.prop('disabled') === false) button.transactionAdd.click()
        else if(button.inventoryAdd.length === 1 && button.inventoryAdd.prop('disabled') === false) button.inventoryAdd.click()
    }

    function altKeyAndTwo() {
        if(button.transactionReturn.length === 1 && button.transactionReturn.prop('disabled') === false) button.transactionReturn.click()
        else if(button.inventoryNull.length === 1 && button.inventoryNull.prop('disabled') === false) button.inventoryNull.click()
    }

    function altKeyAndThree() {
        if(button.transactionHistory.length === 1 && button.transactionHistory.prop('disabled') === false) button.transactionHistory.click()
        else if(button.inventoryHistory.length === 1 && button.inventoryHistory.prop('disabled') === false) button.inventoryHistory.click()
    }

    function altKeyAndFour() {
        if(button.inventoryProduct.length === 1 && button.inventoryProduct.prop('disabled') === false) button.inventoryProduct.click()
    }
})

