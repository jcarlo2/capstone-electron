import {ip, ipcRenderer, json_var, t_add_dropdown, t_add_populate, t_add_report_id,} from "../../../variable.js";
import {
    add,
    ajaxDefaultArray,
    ajaxPostStringify,
    divide,
    getDate,
    multiply,
    setRowColor,
    subtract
} from "../../../function.js";
import {invalidateReport} from "./return.js";

export function startTransactionAdd(){
    startSearch()
    setTransactionAddClear()
    reportIdListener()
    setEditProductQuantityBorder(-1)
    setAddProductQuantityBorder(-1)
    setDropDown()
    setPaymentConfirm()
    $('#add-pay-admin').addClass('d-none')
    $('#add-pay-credit').addClass('d-none')
    $('#add-pay-credit-plus').addClass('d-none')
    $('#add-pay-modal').removeClass('modal-lg')
}

function setTransactionAddClear() {
    const interval = setInterval(()=> {
        $('#transaction-add-left-clear').text('CLEAR')
        $('#transaction-add-left-clear').off('click')
        $('#transaction-add-left-clear').on('click',()=> {
            clear()
        })
        if($('#transaction-add-left-clear').length === 1) clearInterval(interval)
    },500)
}

function setDropDown() {
    t_add_dropdown.intervalId = setInterval(()=> {
        const button = $('#transaction-add-filter')

        $('#transaction-add-filter-1').on('click',()=> {
            button.text('Filter By Id')
        })

        $('#transaction-add-filter-2').on('click',()=> {
            button.text('Filter By Name')
        })

        $('#transaction-add-filter-3').on('click',()=> {
            button.text('Filter By Stock L-H')
        })

        $('#transaction-add-filter-4').on('click',()=> {
            button.text('Filter By Stock H-L')
        })

        $('#transaction-add-filter-5').on('click',()=> {
            button.text('Filter By Price L-H')
        })
        $('#transaction-add-filter-6').on('click',()=> {
            button.text('Filter By Price H-L')
        })
        if($('#transaction-add-filter').length === 1) clearInterval(t_add_dropdown.intervalId)
    })
}

function reportIdListener() {
    t_add_report_id.intervalId = setInterval(()=> {
        const id = $('#transaction-left-add-report').text().substring(4)
        $.ajax({
            url: ip.url + '/api/transaction/is-exist-report-id',
            type: 'GET',
            data: {'id': id},
            success: function (response) {
                if(response) generateId()
            }
        })
    },500)
}

function startSearch() {
    t_add_populate.intervalId = setInterval(() => {
        const search = $('#transaction-add-search').val()
        const filter = $('#transaction-add-filter').text()
        let ajax = undefined
        if (search === '') ajax = ajaxDefaultArray('/api/product/all-merchandise',{'filter':filter})
        else if (search !== undefined) ajax = ajaxDefaultArray('/api/product/search-merchandise',{'search':search})
        if(ajax !== undefined) ajax.then((response)=> populateProductList(response))
    }, 1000)
}

function populateProductList(data) {
    const list = $('#transaction-add-product')
    list.empty()
    for(let i=0;i<data.length;i++) {
        const id = data[i]['id']
        const price = data[i]['price']
        const name = data[i]['name']
        const quantity = parseInt(data[i]['quantityPerPieces'])
        const row = `<tr id="transaction-add-table-`+ id +`" class="transaction-add-item d-flex">
                        <th class="col-1" scope="row">`+ (i+1) +`</th>
                        <td class="col-2 text-start">`+ id +`</td>
                        <td class="col-5 text-start">`+ name +`</td>
                        <td class="col-2 text-start">&#8369; `+ price +`</td>
                        <td class="col-2 text-start">`+ quantity +`</td>
                    </tr>`
        list.append(row)
        setClick(data[i],$('#transaction-add-table-'+id))
        setRowColor($('#transaction-add-table-'+id),quantity)
    }
}

function setClick(data,row) {
    row.on('click', ()=> {

        $('#transaction-add-title').text(data['name'])
        $('#transaction-add-hidden').addClass(data['id'])
        $('#transaction-add-hidden').addClass(data['capital'].toString())
        $('#transaction-add-quantity').val('')
        $('#transaction-add-sum').val('')
        $('#transaction-add-discount').val('')
        $('#transaction-add-total').val('')
        $('#transaction-add-price').val('\u20B1 ' + data['price'])
        $('#transaction-add-modal').modal('show')
    })
}

$('#transaction-add-quantity').on('keyup',()=> {
    const price = $('#transaction-add-price').val().substring(2)
    let id = $('#transaction-add-hidden').prop('class').split(' ')[0]
    let quantity = $('#transaction-add-quantity').val()
    quantity = quantity === '' ? 0 : quantity
    $.ajax({
        url: ip.url + '/api/product/quantity-discount',
        contentType: 'application/json',
        data: {
            'id': id,
            'quantity': quantity
        },
        success: (response)=> {
            setAddProductQuantityBorder(quantity)
            const discount = response === '' ? 0 : response['discount']
            const a = multiply(price,quantity)
            const b = divide(discount,100)
            const total = subtract(a,multiply(a,b))
            $('#transaction-add-sum').val('\u20B1 ' + a.toLocaleString())
            $('#transaction-add-discount').val(discount + ' %')
            $('#transaction-add-total').val('\u20B1 ' + total.toLocaleString())
        }
    })
})

export function setAddProductQuantityBorder(quantity) {
    quantity = parseFloat(quantity)
    if(Number.isInteger(quantity) && Math.sign(quantity) === 1) {
        $('#transaction-add-quantity').addClass('border-success')
        $('#transaction-add-quantity').removeClass('border-danger')
        $('#transaction-add-btn').prop('disabled', false)
    }else {
        $('#transaction-add-quantity').addClass('border-danger')
        $('#transaction-add-quantity').removeClass('border-success')
        $('#transaction-add-btn').prop('disabled', true)
    }
}

$('#transaction-add-btn').on('click',()=> {
    const id = $('#transaction-add-hidden').prop('class').split(' ')[0]
    const quantity = $('#transaction-add-quantity').val()
    $.ajax({
        url: ip.url + '/api/product/verify-stock',
        contentType: 'application/json',
        data: {
            'id': id,
            'quantity': quantity
        },
        success: (response)=> {
            if(response) addProductToLeftList()
            else ipcRenderer.send('showError','Transaction Add Product', 'Error: invalid stock')
        }
    })
})

function addProductToLeftList() {
    const table = json_var.t_add_report_item
    const hidden = $('#transaction-add-hidden').prop('class').split(' ')
    if(!checkDuplicateProduct(table,hidden[0])) ipcRenderer.send('showError','Add product', 'Invalid: duplicate product')
    else {
        addDataToTable(table,hidden)
        populateLeftList(table)
        calculateTotalAmount()
    }
    setAddProductQuantityBorder(-1)
    $('#transaction-add-left-pay').prop('disabled',false)
}

function checkDuplicateProduct(table,product) {
    for(let i=0;i<table.length;i++) {
        if(table[i]['productId'] === product) return false
    }
    return true
}

function addDataToTable(table,hidden) {
    table[table.length] = {
        'num': '',
        'productId': hidden[0],
        'name': $('#transaction-add-title').text(),
        'price': $('#transaction-add-price').val().substring(2),
        'sold': $('#transaction-add-quantity').val(),
        'soldTotal': $('#transaction-add-sum').val().substring(2).replace(',',''),
        'discountPercentage': $('#transaction-add-discount').val().split(' ')[0],
        'totalAmount': $('#transaction-add-total').val().substring(2).replace(',',''),
        'capital': hidden[1],
        'uniqueId': $('#transaction-left-add-report').text().substring(4)
    }
}

function populateLeftList(table) {
    $('#transaction-add-left-table').empty()
    for(let i=0;i<table.length;i++) {
        const row = `<tr class="d-flex" id="transaction-left-row-`+ i +`"> 
                        <td class="col-1">`+ (i+1) +`</td>
                        <td class="col-5 text-start">`+ table[i]['name'] +`</td>
                        <td class="col-2 text-start">`+ table[i]['sold'] +`</td>
                        <td class="col-3 text-start">&#8369; `+ parseFloat(table[i]['totalAmount']).toLocaleString() +`</td>
                        <td class="col-1 text-start" id="transaction-left-remove-`+ i +`"><i class="fa-solid fa-rectangle-xmark text-danger"></i></td>
                    </tr>`
        $('#transaction-add-left-table').append(row)
        setRemoveButton($('#transaction-left-remove-'+i),i)
        setDoubleClick($('#transaction-left-row-'+i),table[i])
    }
    changeReturnItemRowBackground(json_var.t_ret_table)
}

function changeReturnItemRowBackground(table) {
    for(let i=0;i<table.length;i++) {
        $('#transaction-left-row-'+i).addClass('bg-info')
        $('#transaction-left-row-'+i).addClass('bg-opacity-25')
        $('#transaction-left-row-'+i).off('dblclick')
        $('#transaction-left-remove-'+i).text('')
        $('#transaction-left-remove-'+i).off('click')
    }
}

function setRemoveButton(button,i) {
    button.on('click',()=> {
        const table = json_var.t_add_report_item
        const returnTable = json_var.t_add_return_item
        table.splice(i,1)
        if(table.length <= returnTable.length) $('#transaction-add-left-pay').prop('disabled',true)
        populateLeftList(table)
        calculateTotalAmount()
    })
}

function setDoubleClick(row,data) {
    row.on('dblclick',()=> {
        $('#transaction-left-edit-hidden').addClass(data['productId'])
        $('#transaction-left-edit-title').text(data['name'])
        $('#transaction-left-edit-quantity').val(data['sold'])
        $('#transaction-left-edit-price').val('\u20B1 ' + data['price'])
        $('#transaction-left-edit-sum').val('\u20B1 ' + data['soldTotal'])
        $('#transaction-left-edit-discount').val(data['discountPercentage'] + ' %')
        $('#transaction-left-edit-total').val('\u20B1 ' + data['totalAmount'])
        $('#transaction-left-list-edit').modal('show')
    })
}

$('#transaction-left-edit-quantity').on('keyup',()=> {
    const price = $('#transaction-left-edit-price').val().substring(2)
    const id = $('#transaction-left-edit-hidden').prop('class').split(' ')[0]
    let quantity = $('#transaction-left-edit-quantity').val()
    quantity = quantity === '' ? 0 : quantity
    $.ajax({
        url: ip.url + '/api/product/quantity-discount',
        contentType: 'application/json',
        data: {
            'id': id,
            'quantity': quantity
        },
        success: (response)=> {
            setEditProductQuantityBorder(quantity)
            const discount = response === '' ? 0 : response['discount']
            const a = multiply(price,quantity)
            const b = divide(discount,100)
            const total = subtract(a,multiply(a,b))
            $('#transaction-left-edit-sum').val('\u20B1 ' + a.toLocaleString())
            $('#transaction-left-edit-discount').val(discount + ' %')
            $('#transaction-left-edit-total').val('\u20B1 ' + total.toLocaleString())
        }
    })
})

function setEditProductQuantityBorder(quantity) {
    quantity = parseFloat(quantity)
    if(Number.isInteger(quantity) && Math.sign(quantity) === 1) {
        $('#transaction-left-edit-quantity').addClass('border-success')
        $('#transaction-left-edit-quantity').removeClass('border-danger')
        $('#transaction-left-edit-button').prop('disabled', false)
    }else {
        $('#transaction-left-edit-quantity').addClass('border-danger')
        $('#transaction-left-edit-quantity').removeClass('border-success')
        $('#transaction-left-edit-button').prop('disabled', true)
    }
}

$('#transaction-left-edit-button').on('click',()=> {
    const id = $('#transaction-left-edit-hidden').prop('class').split(' ')[0]
    const quantity = $('#transaction-left-edit-quantity').val()
    $.ajax({
        url: ip.url + '/api/product/verify-stock',
        contentType: 'application/json',
        data: {
            'id': id,
            'quantity': quantity
        },
        success: (response)=> {
            if(response) {
                addEditProductToLeftList()
                calculateTotalAmount()
            } else ipcRenderer.send('showError','Transaction Add Product', 'Error: invalid stock')
        }
    })
})

function addEditProductToLeftList() {
    const id = $('#transaction-left-edit-hidden').prop('class').split(' ')[0]
    const quantity = $('#transaction-left-edit-quantity').val()
    const sum = $('#transaction-left-edit-sum').val()
    const discount = $('#transaction-left-edit-discount').val()
    const total = $('#transaction-left-edit-total').val()
    const table = json_var.t_add_report_item
    for(let i=0;i<table.length;i++) {
        if(id === table[i]['productId']) {
            table[i]['sold'] = quantity
            table[i]['soldTotal'] = sum
            table[i]['discountPercentage'] = discount
            table[i]['totalAmount'] = total.substring(2).replace(',','')
            break
        }
    }
    populateLeftList(table)
}

function calculateTotalAmount() {
    const table = json_var.t_add_report_item
    let total = 0
    for(let i=0;i<table.length;i++) {
        total += parseFloat(table[i]['totalAmount'])
    }
    $('#transaction-add-left-total').text('Total: \u20B1 ' + total.toLocaleString())
}

$('#transaction-add-modal').on('hidden.bs.modal',()=> {
    $('#transaction-add-hidden').removeClass()
    setAddProductQuantityBorder(-1)
})

$('#transaction-left-list-edit').on('hidden.bs.modal',()=> {
    $('#transaction-left-edit-hidden').removeClass()
    setEditProductQuantityBorder(-1)
})

$('#add-pay-modal').on('hidden.bs.modal',()=> {
    $('#add-pay-payment').val('')
    $('#add-pay-change').val('')
    paymentChangeBolder(-1)
})

$('#add-pay-modal').on('shown.bs.modal',()=> {
    $('#add-pay-payment').focus()
})

$('#transaction-add-modal').on('shown.bs.modal',()=> {
    $('#transaction-add-quantity').focus()
})

$('#transaction-left-list-edit').on('shown.bs.modal',()=> {
    $('#transaction-left-edit-quantity').focus()
})

$('#add-pay-modal').on('show.bs.modal',()=> {
    let total = $('#transaction-add-left-total').text().substring(9)
    const id = $('#transaction-left-add-report').text().substring(4)
    const user = $('#main-user-name').text()
    $('#add-pay-total').val('\u20B1 ' + total)
    $('#add-pay-modal-total').text('Total: \u20B1 ' + total)
    $('#add-pay-modal-id').text('Ref No: ' + id)
    $('#add-pay-modal-user').text('Cashier: ' + user)
    $('#add-pay-modal-date').text('Date: ' + getDate())
    paymentListener()
    populateAddPayList()
})

function populateAddPayList() {
    $('#add-pay-modal-body').empty()
    const table = json_var.t_add_report_item
    for(let i=0;i<table.length;i++) {
        const row = `<tr>
                        <td class="text-start">`+ table[i]['name'] +`</td>        
                        <td class="text-end">`+ table[i]['sold'] +`</td>        
                        <td class="text-end">&#8369; `+ parseFloat(table[i]['totalAmount']).toLocaleString() +`</td>        
                    </tr>`
        $('#add-pay-modal-body').append(row)
    }
}

$('#add-pay-payment').on('keyup',()=> {
    paymentListener()
})

function paymentListener() {
    let payment = $('#add-pay-payment').val()
    let credit = $('#add-pay-credit').val().substring(2)
    const total = $('#add-pay-total').val().substring(2).replace(',','')
    if(payment === '' && credit === '') {
        $('#add-pay-change').val('')
        return
    }
    payment = payment === '' ? 0 : payment
    credit = credit === '' ? 0 : credit
    payment = add(payment,credit)
    const change = subtract(payment,total).toLocaleString()
    paymentChangeBolder(change)
    $('#add-pay-change').val('\u20B1 ' + change)
}

function paymentChangeBolder(change) {
    if(parseFloat(change) >= 0) {
        $('#add-pay-payment').addClass('border-success')
        $('#add-pay-payment').removeClass('border-danger')
        $('#transaction-add-modal-confirm').prop('disabled',false)
    }else {
        $('#add-pay-payment').removeClass('border-success')
        $('#add-pay-payment').addClass('border-danger')
        $('#transaction-add-modal-confirm').prop('disabled',true)
    }
}

function setPaymentConfirm() {
    $('#transaction-add-modal-confirm').off('click')
    $('#transaction-add-modal-confirm').on('click',()=> {
        makeReport(0)
        saveReportItem(false,undefined,undefined,undefined,undefined)
    })
}

function makeReport(credit) {
    json_var.t_add_report[0] = {
        'id': $('#transaction-left-add-report').text().substring(4),
        'user': $('#main-user-name').text(),
        'date': '',
        'timestamp': '',
        'isValid': '1',
        'totalAmount': $('#transaction-add-left-total').text().substring(9).replace(',',''),
        'oldId': '',
        'credit': credit,
    }
}

function saveReportItem(isReturn,n_item,n_report,d_item,d_report) {
    $.when(
        ajaxPostStringify('/api/transaction/save-report-item', json_var.t_add_report_item),
        ajaxPostStringify('/api/transaction/save-report',json_var.t_add_report[0])
    ).then((r1)=> {
        if(r1[0]) {
            const id = $('#transaction-left-add-report').text().substring(4)
            if(isReturn) saveReturnTransaction(n_item,n_report,d_item,d_report)
            ipcRenderer.send('showMessage', 'Transaction saved', id + ' is saved successfully')
            clear()
        }
    })
}

function saveReturnTransaction(n_item,n_report,d_item,d_report) {
    if(n_item.length > 0) {
        $.when(
            ajaxPostStringify('/api/inventory/save-report-null',n_report),
            ajaxPostStringify('/api/inventory/save-return-report-item',n_item)
        )
    }
    if(d_item.length > 0) {
        $.when(
            ajaxPostStringify('/api/inventory/save-delivery-report',d_report),
            ajaxPostStringify('/api/inventory/save-delivery-report-item',d_item)
        )
    }
    $('#btn-transaction-return').click()
}

function generateId() {
    $.ajax({
        url: ip.url + '/api/transaction/generate-report-id',
        success: (response)=> {
            $('#transaction-left-add-report').text('ID: ' + response)
        }
    })
}

function clear() {
    $('#transaction-add-left-table').empty()
    $('#transaction-add-left-total').text('Total: \u20B1 0.00')
    $('#transaction-add-left-pay').prop('disabled',true)
    json_var.t_add_report_item = []
    json_var.t_add_report = []
}

/** Transaction return : payment continue */
export function returnChangeItem(t_item,t_report,n_item,n_report,d_item,d_report,credit,oldId) {
    $('#main-transaction').click()
    const interval = setInterval(()=> {
        if($('#transaction-left-add-report').length === 1) {
            assignTableValue(t_item,n_item)
            populateLeftList(json_var.t_add_report_item)
            clearInterval(t_add_report_id.intervalId)
            setFieldFromReturn(t_report['id'],t_report['totalAmount'],credit)
            setTabButtons(true)
            setClearButton()
            clearInterval(interval)
            setSaveReportButton(n_item,n_report,d_item,d_report,oldId,credit)
        }
    },1000)
}

function assignTableValue(t_item,n_item) {
    const table = json_var.t_add_return_item = Object.assign([], t_item)
    json_var.t_add_report_item = Object.assign([], t_item)
    json_var.t_ret_table_null = Object.assign([], n_item)
    table.sort((a,b)=> {
        return parseFloat(a.price) - parseFloat(b.price)
    })
}

function setSaveReportButton(n_item,n_report,d_item,d_report,oldId,credit) {
    $('#transaction-add-modal-confirm').off('click')
    $('#transaction-add-modal-confirm').on('click',()=> {
        let total = subtract(credit,$('#add-pay-total').val().substring(2))
        total = total > 0 ? total : 0
        makeReport(total)
        filterNullItems(n_item)
        saveReportItem(true,n_item,n_report,d_item,d_report)
        invalidateReport(oldId)
        setTabButtons(false)
    })
}

function filterNullItems(itemList) {
    for(let i in itemList) {
        if(itemList[i]['reason'] !== 'Exp/Dmg' ) itemList.splice(i,1)
    }
}

function setFieldFromReturn(id,total,credit) {
    $('#transaction-add-left-total').text('Total: \u20B1 ' + parseFloat(total).toLocaleString())
    $('#transaction-left-add-report').text('ID: ' + id)
    $('#add-pay-credit').val('\u20B1 ' + credit)
    $('#add-pay-credit').removeClass('d-none')
    $('#add-pay-credit-plus').removeClass('d-none')
    $('#add-pay-admin').removeClass('d-none')
    $('#add-pay-modal').addClass('modal-lg')
}

function setTabButtons(flag) {
    $('#main-transaction').prop('disabled',true)
    $('#main-inventory').prop('disabled',flag)
    $('#main-generate').prop('disabled',flag)
    $('#main-log').prop('disabled',flag)
    $('#btn-transaction-return').prop('disabled',true)
    $('#btn-transaction-history').prop('disabled',flag)
    $('#index-setting').prop('disabled',flag)
}

function setClearButton() {
    $('#transaction-add-left-clear').text('CANCEL')
    $('#transaction-add-left-clear').off('click')
    $('#transaction-add-left-clear').on('click',()=> {
        ipcRenderer.send('backToTransactionReturn')
        ipcRenderer.removeAllListeners('backToTransactionReturn')
        ipcRenderer.on('backToTransactionReturn',(e,num)=> {
            if(num === 0) {
                $('#btn-transaction-return').click()
                setTabButtons(false)
            }
        })
    })
}
