$().ready(()=> {
    $(document).on('keyup',(e)=> {
        if(e.code === 'Backquote') {
            $('#transaction-add-search').focus()
            $('#transaction-return-left-search').focus()
        }else if(e.code === 'Enter') {
            if($('#transaction-add-btn-modal').is(':visible')) $('#transaction-add-btn-modal').click()
            else if($('#transaction-add-modal-confirm').is(':visible') && $('#transaction-add-modal-confirm').prop('disabled') === false) $('#transaction-add-modal-confirm').click()
            else if($('#transaction-return-pay-btn').is(':visible')) $('#transaction-return-pay-btn').click()
            else if($('#transaction-left-edit-button').is(':visible')) $('#transaction-left-edit-button').click()
            else if($('#transaction-return-modal-update').is(':visible')) $('#transaction-return-modal-update').click()
        }
    })
})