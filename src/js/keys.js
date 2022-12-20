import {globalButtons, savePath} from "./variable.js";

$().ready(()=> {
    const button = globalButtons
    $(document).on('keyup',(e)=> {
        console.log(savePath.folderPath)
        if(e.code === 'Backquote') backquote()
        else if(e.code === 'Enter') enter()
        else if(e.altKey && e.ctrlKey && e.key === '1' && button.transaction.prop('disabled') === false) button.transaction.click()
        else if(e.altKey && e.ctrlKey && e.key === '2' && button.inventory.prop('disabled') === false) button.inventory.click()
        else if(e.altKey && e.ctrlKey && e.key === '3' && button.report.prop('disabled') === false) button.report.click()
        else if(e.altKey && e.ctrlKey && e.key === '4' && button.log.prop('disabled') === false) button.log.click()
        else if(e.altKey && e.ctrlKey && e.key === '5') button.setting.click()
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
        if(button.tAdd.length === 1 && button.tAdd.prop('disabled') === false) button.tAdd.click()
        else if(button.iAdd.length === 1 && button.iAdd.prop('disabled') === false) button.iAdd.click()
    }

    function altKeyAndTwo() {
        if(button.tReturn.length === 1 && button.tReturn.prop('disabled') === false) button.tReturn.click()
        else if(button.iNull.length === 1 && button.iNull.prop('disabled') === false) button.iNull.click()
    }

    function altKeyAndThree() {
        if(button.tHistory.length === 1 && button.tHistory.prop('disabled') === false) button.tHistory.click()
        else if(button.iHistory.length === 1 && button.iHistory.prop('disabled') === false) button.iHistory.click()
    }

    function altKeyAndFour() {
        if(button.iProduct.length === 1 && button.iProduct.prop('disabled') === false) button.iProduct.click()
    }
})

