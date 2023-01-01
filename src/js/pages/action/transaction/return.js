import {ip, ipcRenderer, json_var, t_ret_date, t_ret_new_total, t_ret_populate} from "../../../variable.js";
import {
    ajaxDefaultArray,
    ajaxPostStringify,
    ajaxUrl,
    clearIntervals,
    divide,
    multiply,
    subtract
} from "../../../function.js";
import {returnChangeItem} from "./add.js";
import {saveLog} from "../log/log.js";

export function startReturn() {
    t_ret_populate.intervalId = setInterval(()=> {
        const search = $('#transaction-return-left-search').val()
        const start = $('#transaction-return-start').val()
        const end = $('#transaction-return-end').val()
        let ajax = undefined
        if(search !== '') ajax = ajaxDefaultArray('/api/transaction/search-transaction',{'search':search})
        else if(start !== '' && end === '') ajax = ajaxDefaultArray('/api/transaction/search-start',{'start':start})
        else if(start === '' && end !== '') ajax = ajaxDefaultArray('/api/transaction/search-end',{'end': end})
        else if(start !== '' && end !== '') ajax = ajaxDefaultArray('/api/transaction/search-date',{'start':start,'end':end})
        else if(search !== undefined) ajax = ajaxUrl('/api/transaction/get-all-valid-report')
        if(ajax !== undefined) ajax.then((response)=> populate(response))
    },1000)
    setReturnResetButton()
    setNewTotal()
}

function setReturnResetButton() {
    const interval = setInterval(()=> {
        $('#transaction-return-table-reset').on('click',()=> {
            const id = $('#right-return-id').val()
            const timestamp = $('#right-return-date').val()
            $.ajax({
                url: ip.address + '/api/transaction/find-all-item',
                type: 'GET',
                contentType: 'application/json',
                data:{
                    'id': id,
                    'timestamp': timestamp
                },
                success: function (response) {
                    json_var.t_ret_table = response
                    populateTable(json_var.t_ret_table,timestamp)
                }
            })
        })
        if($('#transaction-return-table-clear').length === 1) clearInterval(interval)
    },1000)
}

function setNewTotal() {
    t_ret_new_total.intervalId = setInterval(()=> {
        const table = json_var.t_ret_table
        if(table.length === 0)  {
            $('#right-return-credit').val('')
            return
        }
        let newTotal = 0
        for(let i=0;i<table.length;i++) {
            newTotal += table[i]['totalAmount'] ? parseFloat(table[i]['totalAmount']) : 0
        }
        $('#right-return-credit').val('\u20B1 ' + newTotal.toLocaleString())
    },1000)
}

function populate(data) {
    const body = $('#transaction-return-left-body')
    if(data.length === 0) body.empty()
    body.empty()
    for(let i=0;i<data.length;i++) {
        body.addClass(data[i]['id'])
        const row = `<tr class="d-flex" id="return-`+ data[i]['id'] +`">
                        <th class="col-1 text-start" scope="row">`+ (i+1) +`</th>
                        <td class="col-7 text-start" >`+ data[i]['id'] +`</td>
                        <td class="col-4 text-start">`+ data[i]['timestamp'] +`</td>
                    </tr>`
        body.append(row)
        setClick(data[i]['id'],data[i]['timestamp'],data[i]['totalAmount'],data[i]['credit'])
    }
}

function setClick(id,timestamp,total,excess) {
    $('#return-'+id).on('click',()=> {
        $.ajax({
            url: ip.address + '/api/transaction/new-report-id',
            type: 'GET',
            contentType: 'application/json',
            data:{'id': id},
            success:function (response) {
                $('#right-return-id').val(id)
                $('#right-return-date').val(timestamp)
                $('#right-return-total').val('\u20B1 ' + parseFloat(total).toLocaleString())
                $('#right-return-new-id').val(response)
                $('#right-return-credit').val('\u20B1 ' + parseFloat(total).toLocaleString())
                $('#right-return-excess').val('\u20B1 ' + parseFloat(excess).toLocaleString())
                ajaxDefaultArray('/api/transaction/find-all-item',{'id': id,'timestamp':timestamp})
                    .then((response)=> {
                        json_var.t_ret_table = response
                        populateTable(json_var.t_ret_table,timestamp)
                    })
            }
        })
    })
}

function populateTable(data,timestamp) {
    $('#transaction-return-item-body').empty()
    for(let i=0;i<data.length;i++) {
        const product = data[i]['productId'];
        const table = json_var.t_ret_table_null
        let reason = 'None'
        for(let j=0;j<table.length;j++) {
            if(table[j].id === product) reason = table[j].reason
        }
        const row = `<tr id="return-item-row-`+ i +`" class="d-flex `+ product +`">
                        <th class="col-1" scope="col">`+ (i + 1) +`</th>
                        <td id="return-item-name-`+ product +`" class="col-4 text-start">`+ data[i]['name'] +`</td>
                        <td id="return-item-price-`+ product +`" class="col-2  text-start">\u20b1 `+ parseFloat(data[i]['price']).toLocaleString() +`</td>
                        <td id="return-item-quantity-`+ product +`" class="col-2  text-start">`+ data[i]['sold'] +`</td>
                        <td id="return-item-total-`+ product +`" class="col-2  text-start">\u20b1 `+ parseFloat(data[i]['totalAmount']).toLocaleString() +`</td>
                        <td id="return-reason-`+ product +`" class="col-1  text-start">`+ reason +`</td>
                    </tr>`
        $('#transaction-return-item-body').append(row)
        setReturnedItemModal(data[i], $('#return-item-row-'+i),i,timestamp)
    }
}

function setReturnedItemModal(data,row,i,timestamp) {
    row.on('click',()=> {
        const id = data['productId']
        getOriginalData(i,id,data['capital'],timestamp)
        $('#transaction-return-title').text(data['name'])
        $('#return-item-original-1').val('')
        $('#return-item-original-2').val('\u20B1 ' + data['price'])
        $('#return-item-original-3').val('\u20B1 0.00')
        $('#return-item-original-4').val('0.00' + ' %')
        $('#return-item-drop-1').click()
        $('#transaction-return-modal').modal('show')
    })
}

function getOriginalData(i,productId,capital,timestamp) {
    const id = $('#right-return-id').val()
    $.ajax({
        url: ip.address + '/api/transaction/find-all-item',
        type: 'GET',
        contentType: 'application/json',
        data:{
            'id': id,
            'timestamp': timestamp
        },
        success: function (response) {
            const data = response[i]
            const total = data['totalAmount'].toLocaleString()
            $('#return-item-ret-1').val(data['sold'])
            $('#transaction-return-quantity').addClass(data['sold'].toString())
            const str = parseInt(data['sold']) > 1 ? 'pieces' : 'piece'
            $('#transaction-return-pieces').text(data['sold'] + ' ' + str)
            $('#transaction-return-hidden').addClass(productId)
            $('#transaction-return-hidden').addClass(capital.toString())
            $('#transaction-return-hidden').addClass(total)
        }
    })
}

$('#return-pay-modal').on('show.bs.modal',() => {
    setHeaderOfReturnPayment()
    setTableBodyOfReturnPayment()
    $('#transaction-return-modal-confirm').prop('disabled',true)
    $('#transaction-return-modal-refund').prop('disabled',true)
    setTimeout(()=>{
        $('#transaction-return-modal-confirm').prop('disabled',false)
        $('#transaction-return-modal-refund').prop('disabled',false)
    },1000)
})

function setHeaderOfReturnPayment() {
    let payment = $('#right-return-total').val().substring(2).replace(',','')
    let total = $('#right-return-credit').val().substring(2).replace(',','')
    const change = (payment === '' && total === '') ? '' : '\u20B1 ' + subtract(payment,total).toLocaleString()
    payment = payment === '' ? '' : '\u20B1 ' + parseFloat(payment).toLocaleString()
    total = total === '' ? '' : '\u20B1 ' + parseFloat(total).toLocaleString()
    $('#return-pay-payment').val(payment)
    $('#return-pay-total').val(total)
    $('#return-pay-change').val(change)
    $('#return-pay-modal-id').text('Ref No: ' + $('#right-return-new-id').val())
    $('#return-pay-modal-user').text('Cashier: ' + $('#main-user-name').text())
    t_ret_date.intervalId = setInterval(()=> {
        ajaxUrl('/api/date/get-date')
            .then((response)=> {
                $('#return-pay-modal-date').text('Date: ' + response)
            })
    },1000)
}

function setTableBodyOfReturnPayment() {
    const table = $('#transaction-return-modal-body')
    table.empty()
    let i = 0;
    while(true) {
        const row = $('#return-item-row-'+i)
        if(row.length === 0) break
        const id = row.prop('class').split(' ')[1]
        const name = $('#return-item-name-'+id).text()
        const quantity = $('#return-item-quantity-'+id).text()
        const total = $('#return-item-total-'+id).text()
        const addRow = `<tr id="transaction-return-pay-"`+ i +`>
                          <td class="text-start">`+ name +`</td>
                          <td class="text-end">`+ quantity +`</td>
                          <td class="text-end">`+ total +`</td>
                        </tr>`
        table.append(addRow)
        i++
    }
    const total = $('#right-return-credit').val()
    $('#transaction-return-modal-total').text('Total: ' + total)
}


$('#transaction-return-modal-update').on('click',()=> {
    const reason = $('#return-item-drop').text()
    const table = json_var.t_ret_table
    const nullTable = json_var.t_ret_table_null
    const id = $('#transaction-return-hidden').prop('class').split(' ')[0]
    const name = $('#transaction-return-title').text()
    const capital = $('#transaction-return-hidden').prop('class').split(' ')[1]
    const discount = $('#return-item-original-4').val().split(' ')[0]
    const price = $('#return-item-original-2').val().substring(2)
    let originalQuantity = $('#transaction-return-quantity').prop('class').split(' ')[0]
    if(reason === 'None') noneReason(table,nullTable,id,originalQuantity,price,discount)
    else withReason(table,nullTable,price,discount,id,capital,name)
    populateTable(table,$('#right-return-date').val())
    $('#transaction-return-pay-now').prop('disabled', true)
    setTimeout(()=> $('#transaction-return-pay-now').prop('disabled', false),500)
})

function withReason(table,nullTable,price,discount,id,capital,name) {
    let quantity = $('#return-item-original-1').val()
    const total = $('#return-item-original-3').val().substring(2)
    let retQuantity = $('#return-item-ret-1').val()
    quantity = quantity === '' ? 0 : quantity
    retQuantity = retQuantity === '' ? 0 : retQuantity
    if(retQuantity <= 0) {
        ipcRenderer.send('showError','Return item','Invalid: check returned item count')
        $('#return-item-original-1').val(quantity)
    } else {
        updateTable(table,quantity,price,total,id)
        updateNullTable(nullTable,id,price,retQuantity,discount,$('#return-item-drop').text(),capital,name)
    }
}

function noneReason(table,nullTable,id,quantity,price,discount) {
    for(let i=0;i<nullTable.length;i++) {
        if(nullTable[i]['id'] === id) nullTable.splice(i,1)
    }
    for(let i=0;i<table.length;i++) {
        if(table[i].productId === id) {
            const a = multiply(quantity,price)
            const b = divide(discount,100)
            table[i].sold = quantity
            table[i].soldTotal = a
            table[i].totalAmount = subtract(a,(multiply(a,b)))
        }
    }
}

function updateNullTable(table,id,price,quantity,discount,reason,capital,name) {
    let flag = true
    for(let i=0;i<table.length;i++) {
        if(table[i]['id'] === id) {
            table[i].quantity = quantity
            table[i].totalAmount = multiply(price,quantity)
            table[i].reason = reason
            flag = false
            break
        }
    }
    if(flag) {
        table[table.length] = {
            'num': '',
            'id': id,
            'name': name,
            'price': price,
            'quantity': quantity,
            'discount': discount,
            'totalAmount': multiply(price,quantity),
            'capital': capital,
            'reportId': '',
            'reason': reason,
            'link': $('#right-return-new-id').val(),
        }
    }
}

function updateTable(table,quantity,price,total,id) {
    total = total === '' ? '0' : total
    for(let i=0;i<table.length;i++) {
        if(table[i]['productId'] === id) {
            table[i].sold = quantity
            table[i].soldTotal = multiply(quantity,price)
            table[i].totalAmount = total.replace(',','')
            break
        }
    }
}

$('#transaction-return-modal-confirm').on('click', ()=> {
    if(json_var.t_ret_table_null.length > 0) {
        makeTransactionReport(false)
        makeNullReport(false)
        makeDeliveryReport(false)
        $('#main-section').addClass('d-none')
        $('#main-spinner').removeClass('d-none')
        setTimeout(()=> {
            returnChangeItem(
                json_var.t_ret_table,
                json_var.t_add_report[0],
                json_var.t_ret_table_null,
                json_var.t_inventory_report_null,
                json_var.t_ret_table_delivery,
                json_var.t_inventory_report_delivery,
                $('#right-return-total').val().substring(2).replace(',',''),
                $('#right-return-id').val(),
            )
            clearIntervals()
        },1000)
    }else ipcRenderer.send('showError','Return item', 'Invalid: no items to return')
})

$('#transaction-return-modal-refund').on('click',()=> {
    const table = json_var.t_ret_table_null
    let nullFlag = checkReasons(table,'Expired') || checkReasons(table,'Damaged')
    let deliveryFlag = checkReasons(table,'Change')
    if(table.length > 0) {
        const id = $('#right-return-new-id').val()
        makeTransactionReport(true)
        if(nullFlag) makeNullReport(true)
        if(deliveryFlag) makeDeliveryReport(true)
        invalidateReport($('#right-return-id').val())
        const report = $('#right-return-new-id').val()
        const change = $('#return-pay-change').val()
        ipcRenderer.send('showMessage','Return success', report + ' successfully saved.\nRefund: ' + change)
        clearField()
        saveLog('Transaction Return','Refund item - Return Transaction: ' + id)
    } else ipcRenderer.send('showError','Return item', 'Invalid: no items to return')
})

function checkReasons(table,reason) {
    for(let i in table) {
        if(table[i]['reason'] === reason) return true
    }
    return false
}

export function invalidateReport(id) {
    $.ajax({
        url: ip.address + '/api/transaction/invalidate-report',
        contentType: 'application/json',
        dataType: 'json',
        data: {'id': id},
    })
}

function makeTransactionReport(isRefund) {
    const id = $('#right-return-id').val()
    const newId = $('#right-return-new-id').val()
    const user = $('#main-user-name').text()
    const total = $('#right-return-credit').val().substring(2).replace(',','')
    const credit = $('#return-pay-change').val().substring(2).replace(',','')
    const excess = $('#right-return-excess').val().substring(2).replace(',','')
    json_var.t_add_report[0] = {
        'id': newId,
        'user': user,
        'date': '',
        'timestamp': '',
        'isValid': '1',
        'totalAmount': total,
        'oldId': id,
        'credit': parseFloat(credit) + parseFloat(excess),
    }
    setTransactionItems()

    if(isRefund) {
        $.when(
            ajaxPostStringify('/api/transaction/save-report',json_var.t_add_report[0]),
            ajaxPostStringify('/api/transaction/save-report-item',json_var.t_ret_table),
        )
    }
}

function setTransactionItems() {
    const table = json_var.t_ret_table
    for(let i=0;i<table.length;i++) {
        table[i]['num'] = ''
        table[i]['uniqueId'] = $('#right-return-new-id').val()
    }
}

function setNullItems(id) {
    const table = json_var.t_ret_table_null
    for(let i=0;i<table.length;i++) {
        table[i]['reportId'] = id
    }
}

function saveNullItems() {
    $.ajax({
        url: ip.address + '/api/inventory/save-null-item',
        contentType: 'application/json',
        type: 'POST',
        dataTYpe: 'json',
        data: JSON.stringify(json_var.t_ret_table_null),
        success: ()=> {
            saveNullReport()
        }
    })
}

function makeDeliveryReport(isRefund) {
    $.ajax({
        url: ip.address + '/api/inventory/generate-id-delivery',
        success: (response)=> {
            const total = filterNullItemsToDeliveryItems(response)
            const user = $('#main-user-name').text()
            const newId = $('#right-return-new-id').val()
            json_var.t_inventory_report_delivery = {
                'id' : response,
                'user' : user,
                'total' : total,
                'date' : '',
                'timestamp' : '',
                'link' : newId,
                'isValid' : '1',
                'reason' : 'Transaction Return',
            }
            if(isRefund) {
                saveDeliveryReport()
                saveDeliveryItems()
            }
        }
    })
}

function saveDeliveryReport() {
    $.ajax({
        url: ip.address + '/api/inventory/save-delivery-report',
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(json_var.t_inventory_report_delivery),
    })
}

function saveDeliveryItems() {
    $.ajax({
        url: ip.address + '/api/inventory/save-delivery-report-item',
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(json_var.t_ret_table_delivery),
    })
}

function filterNullItemsToDeliveryItems(id) {
    const nullItemList = json_var.t_ret_table_null
    const deliveryItemList = json_var.t_ret_table_delivery
    let num = 0
    let total = 0
    for(let i in nullItemList) {
        if(nullItemList[i]['reason'] === 'Change') {
            const price = nullItemList[i]['price']
            const quantity = nullItemList[i]['quantity']
            const discount = nullItemList[i]['discount']
            deliveryItemList[num++] = {
                'num': '',
                'productId':  nullItemList[i]['id'],
                'name': nullItemList[i]['name'],
                'quantity':  nullItemList[i]['quantity'],
                'totalPrice':  multiply(price,quantity),
                'discountPercentage':  discount,
                'totalAmount':  nullItemList[i]['totalAmount'],
                'uniqueId': id,
                'capital': nullItemList[i]['capital'],
            }
            total += parseFloat(nullItemList[i]['totalAmount'])
        }
    }
    return total;
}

function clearField() {
    // json_var.t_ret_table_null = []
    // json_var.t_ret_table = []
    setTimeout(()=> {
        json_var.t_ret_table_null = []
        json_var.t_ret_table = []
    },1000)
    $('#transaction-return-item-body').empty()
    $('#right-return-new-id').val('')
    $('#right-return-id').val('')
    $('#right-return-date').val('')
    $('#right-return-credit').val('')
    $('#right-return-total').val('')
}

function saveNullReport() {
    $.ajax({
        url: ip.address + '/api/inventory/save-report-null',
        contentType: 'application/json',
        type: 'POST',
        dataTYpe: 'json',
        data: JSON.stringify(json_var.t_inventory_report_null),
    })
}

function makeNullReport(isRefund) {
    const newId = $('#right-return-new-id').val()
    $.ajax({
        url: ip.address + '/api/inventory/generate-id-null-return',
        data: {
          'link': newId
        },
        type: 'GET',
        success: (response)=> {
            const user = $('#main-user-name').text()
            const table = json_var.t_ret_table_null
            let total = parseFloat('0')
            for(let i=0;i<table.length;i++) {
                const reason = table[i]['reason']
                if(reason === 'Expired' || reason === 'Damaged' ) total += table[i]['totalAmount']
            }
            json_var.t_inventory_report_null = {
                'id': response,
                'user': user,
                'date': '',
                'total': total,
                'timestamp': '',
                'link': newId,
                'isValid': '1',
                'reason': 'Transaction Return'
            }

            setNullItems(response)
            if(isRefund) {
                saveNullItems()
            }
        }
    })
}

$('#return-item-ret-1').on('keyup',()=> {
    let returnQuantity = $('#return-item-ret-1').val()
    returnQuantity = returnQuantity === '' ? 0 : parseFloat(returnQuantity)
    const id = $('#transaction-return-hidden').prop('class').split(' ')[0]
    const dbQuantity = $('#transaction-return-quantity').prop('class').split(' ')[0]
    const a = subtract(dbQuantity,returnQuantity)
    ajaxDefaultArray('/api/product/quantity-discount',{'id': id,'quantity':a})
        .then((response)=> {
            let discount = response['discount'] ? response['discount'] : '0.00'
            const price = $('#return-item-original-2').val().substring(2)
            if(returnQuantity <= parseInt(dbQuantity)) {
                $('#return-item-original-4').val(discount + ' %')
                $('#return-item-original-1').val(a === 0 ? '' : a)
                const originalQuantity = $('#return-item-original-1').val()
                calculateNewOriginalTotal(originalQuantity,price,discount)
            }else {
                ipcRenderer.send('showError','Return Item','Invalid: check returned item count')
                $('#return-item-original-4').val('0.00 %')
            }
        })
})

function calculateNewOriginalTotal(dbQuantity,price,discount) {
    dbQuantity = dbQuantity === '' ? 0 : dbQuantity
    const a = multiply(dbQuantity,price)
    const b = divide(discount,100)
    const originalTotal = dbQuantity === 0 ? '' : '\u20B1 ' + subtract(a,multiply(a,b)).toLocaleString()
    $('#return-item-original-3').val(originalTotal)
}

$('#return-item-drop-1').on('click',()=> {
    $('#return-item-drop').text('None')
    $('#return-item-main').addClass('d-none')
    resetReturnModal()
})

$('#return-item-drop-2').on('click',()=> {
    $('#return-item-drop').text('Expired')
    $('#return-item-main').removeClass('d-none')
    $('#return-item-ret-1').focus()
    resetReturnModal()
})

$('#return-item-drop-4').on('click',()=> {
    $('#return-item-drop').text('Damaged')
    $('#return-item-main').removeClass('d-none')
    $('#return-item-ret-1').focus()
    resetReturnModal()
})

$('#return-item-drop-3').on('click',()=> {
    $('#return-item-drop').text('Change')
    $('#return-item-main').removeClass('d-none')
    $('#return-item-ret-1').focus()
    resetReturnModal()
})

$('#transaction-return-modal').on('hidden.bs.modal',()=> {
    $('#transaction-return-hidden').removeClass()
    $('#transaction-return-quantity').removeClass()
    clearInterval(t_ret_date.intervalId)
})

function resetReturnModal() {
    const quantity = $('#transaction-return-quantity').prop('class').split(' ')[0]
    $('#return-item-original-1').val('')
    $('#return-item-original-3').val('')
    $('#return-item-ret-1').val(quantity)
}
