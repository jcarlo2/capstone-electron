import {t_ret_populate, json_var, ipcRenderer, t_ret_clear, t_ret_new_total, ip} from "../../../variable.js";
import {multiply, divide, subtract, getDate} from "../../../function.js";

export function startReturn() {
    t_ret_populate.setIntervalId(setInterval(()=> {
        const search = $('#transaction-return-left-search').val()
        const start = $('#transaction-return-start').val()
        const end = $('#transaction-return-end').val()
        if(search !== '') getAllReportBySearch(search)
        else if(start !== '' && end === '') getAllReportByStart(start)
        else if(start === '' && end !== '') getAllReportByEnd(end)
        else if(start !== '' && end !== '') getAllReportByDate(start,end)
        else getAllReport()
    },1000))
    setReturnResetButton()
    setNewTotal()
}

function setReturnResetButton() {
    t_ret_clear.setIntervalId(setInterval(()=> {
        $('#transaction-return-table-reset').on('click',()=> {
            const id = $('#right-return-id').val()
            $.ajax({
                url: ip.url + '/api/transaction/find-all-item',
                type: 'GET',
                contentType: 'application/json',
                data:{'id': id},
                success: function (response) {
                    json_var.t_ret_table = response
                    populateTable(json_var.t_ret_table)
                }
            })
        })
        if($('#transaction-return-table-clear').length === 1) clearInterval(t_ret_clear.getIntervalId())
    },1000))
}

function setNewTotal() {
    t_ret_new_total.setIntervalId(setInterval(()=> {
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
    },1000))
}

function getAllReportBySearch(search) {
    $.ajax({
        url: ip.url + '/api/transaction/search-transaction',
        data: {'search': search},
        success: function (response) {
            populate(response)
        }
    })
}

function getAllReportByDate(start,end) {
    $.ajax({
        url: ip.url + '/api/transaction/search-end',
        data: {
            'start':start,
            'end': end
        },
        contentType: 'application/json',
        dataType:'json',
        success: function (response) {
            populate(response)
        }
    })
}

function getAllReportByEnd(end) {
    $.ajax({
        url: ip.url + '/api/transaction/search-end',
        data: {'end': end},
        contentType: 'application/json',
        dataType:'json',
        success: function (response) {
            populate(response)
        }
    })
}

function getAllReportByStart(start) {
    $.ajax({
        url: ip.url + '/api/transaction/search-start',
        data: {'start': start},
        contentType: 'application/json',
        success: function (response) {
            populate(response)
        }
    })
}

function getAllReport() {
    $.ajax({
        url: ip.url + '/api/transaction/get-all-report',
        success: function (response) {
            populate(response)
        }
    })
}

function populate(data) {
    const body = $('#transaction-return-left-body')
    if(data.length === 0) body.empty()
    body.empty()
    for(let i=0;i<data.length;i++) {
        body.addClass(data[i]['id'])
        const row = `<tr class="d-flex" id="return-`+ data[i]['id'] +`">
                        <th class="col-1" scope="row">`+ (i+1) +`</th>
                        <td class="col-7 text-start" >`+ data[i]['id'] +`</td>
                        <td class="col-4">`+ data[i]['timestamp'] +`</td>
                    </tr>`
        body.append(row)
        setDoubleClick(data[i]['id'],data[i]['timestamp'],data[i]['totalAmount'])
    }
}

function setDoubleClick(id,timestamp,total) {
    $('#return-'+id).on('dblclick',()=> {
        $.ajax({
            url: ip.url + '/api/transaction/new-report-id',
            type: 'GET',
            contentType: 'application/json',
            data:{'id': id},
            success:function (response) {
                $('#right-return-id').val(id)
                $('#right-return-date').val(timestamp)
                $('#right-return-total').val('\u20B1 ' + parseFloat(total).toLocaleString())
                $('#right-return-new-id').val(response)
                $('#right-return-credit').val('\u20B1 ' + parseFloat(total).toLocaleString())
                setTable(id)
            }
        })
    })
}

function setTable(id) {
    $.ajax({
        url: ip.url + '/api/transaction/find-all-item',
        type: 'GET',
        contentType: 'application/json',
        data:{'id': id},
        success: function (response) {
            json_var.t_ret_table = response
            populateTable(json_var.t_ret_table)
        }
    })
}

function populateTable(data) {
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
                        <td id="return-item-price-`+ product +`" class="col-2">\u20b1 `+ parseFloat(data[i]['price']).toLocaleString() +`</td>
                        <td id="return-item-quantity-`+ product +`" class="col-2">`+ data[i]['sold'] +`</td>
                        <td id="return-item-total-`+ product +`" class="col-2">\u20b1 `+ data[i]['totalAmount'].toLocaleString() +`</td>
                        <td id="return-reason-`+ product +`" class="col-1">`+ reason +`</td>
                    </tr>`
        $('#transaction-return-item-body').append(row)
        setReturnedItemModal(data[i], $('#return-item-row-'+i),i)
    }
}

function setReturnedItemModal(data,row,i) {
    row.on('click',()=> {
        getOriginalData(i)
        $('#transaction-return-hidden').addClass(data['productId'])
        $('#transaction-return-hidden').addClass(data['capital'])
        $('#transaction-return-title').text(data['name'])
        $('#return-item-ret-2').val('\u20B1 ' + data['price'])
        $('#return-item-ret-4').val(data['discountPercentage'] + ' %')
        $('#return-item-original-1').val('')
        $('#return-item-original-2').val('\u20B1 ' + data['price'])
        $('#return-item-original-3').val('\u20B1 0.00')
        $('#return-item-original-4').val(data['discountPercentage'] + ' %')
        $('#return-item-drop-1').click()
        $('#transaction-return-modal').modal('show')
    })
}

function getOriginalData(i) {
    const id = $('#right-return-id').val()
    $.ajax({
        url: ip.url + '/api/transaction/find-all-item',
        type: 'GET',
        contentType: 'application/json',
        data:{'id': id},
        success: function (response) {
            const data = response[i]
            $('#return-item-ret-1').val(data['sold'])
            $('#transaction-return-quantity').addClass(data['sold'].toString())
            const str = parseInt(data['sold']) > 1 ? 'pieces' : 'piece'
            $('#transaction-return-pieces').text(data['sold'] + ' ' + str)
            $('#return-item-ret-3').val('\u20B1 ' + data['totalAmount'].toLocaleString())
        }
    })
}

$('#return-pay-modal').on('show.bs.modal',() => {
    setHeaderOfReturnPayment()
    setTableBodyOfReturnPayment()
    $('#transaction-return-modal-confirm').prop('disabled',true)
    setTimeout(()=>$('#transaction-return-modal-confirm').prop('disabled',false),1000)
})

function setHeaderOfReturnPayment() {
    const payment = $('#right-return-total').val().substring(2).replace(',','')
    const total = $('#right-return-credit').val().substring(2).replace(',','')
    const newId = $('#right-return-new-id').val()
    const user = $('#main-user-name').text()
    $('#return-pay-payment').val('\u20B1 ' + payment)
    $('#return-pay-total').val('\u20B1 ' + total)
    $('#return-pay-change').val('\u20B1 ' + subtract(payment,total).toLocaleString())
    $('#return-pay-modal-id').text('Ref No: ' + newId)
    $('#return-pay-modal-user').text('Cashier: ' + user)
    $('#return-pay-modal-date').text('Date: ' + getDate())
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
    const discount = $('#return-item-ret-4').val().split(' ')[0]
    const price = $('#return-item-original-2').val().substring(2)
    let originalQuantity = $('#transaction-return-quantity').prop('class').split(' ')[0]
    if(reason === 'None') noneReason(table,nullTable,id,originalQuantity,price,discount)
    else withReason(table,nullTable,price,discount,id,capital,name)
    populateTable(table)
    $('#transaction-return-pay-now').prop('disabled', true)
    setTimeout(()=> $('#transaction-return-pay-now').prop('disabled', false),500)
})

function withReason(table,nullTable,price,discount,id,capital,name) {
    let quantity = $('#return-item-original-1').val()
    const total = $('#return-item-original-3').val().substring(2)
    let retQuantity = $('#return-item-ret-1').val()
    const retTotal = $('#return-item-ret-3').val().substring(2)
    quantity = quantity === '' ? 0 : quantity
    retQuantity = retQuantity === '' ? 0 : retQuantity
    if(retQuantity <= 0) ipcRenderer.send('showError','Return item','Error: check returned item count')
    else {
        updateTable(table,quantity,price,total,id)
        updateNullTable(nullTable,id,price,retQuantity,discount,$('#return-item-drop').text(),retTotal,capital,name)
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

function updateNullTable(table,id,price,quantity,discount,reason,total,capital,name) {
    let flag = true
    for(let i=0;i<table.length;i++) {
        if(table[i]['id'] === id) {
            table[i].quantity = quantity
            table[i].total = total
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
            'total': parseFloat(total.replace(',','')),
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
        }
    }
}

$('#transaction-return-modal-confirm').on('click',()=> {
    if(json_var.t_ret_table_null.length > 0) {
        makeTransactionReport()
        makeNullReport()
        invalidateReport()
    }else ipcRenderer.send('showError','Return item', 'Invalid: no items to return')
})

function invalidateReport() {
    $.ajax({
        url: ip.url + '/api/transaction/invalidate-report',
        contentType: 'application/json',
        dataType: 'json',
        data: {'id': $('#right-return-id').val()},
    })
}

function makeTransactionReport() {
    const id = $('#right-return-id').val()
    const newId = $('#right-return-new-id').val()
    const user = $('#main-user-name').text()
    const total = $('#right-return-credit').val().substring(2)
    const credit = $('#return-pay-change').val().substring(2)
    json_var.t_add_report[0] = {
        'id': newId,
        'user': user,
        'date': '',
        'timestamp': '',
        'isValid': '1',
        'totalAmount': total.replace(',',''),
        'oldId': id,
        'credit': credit.replace(',',''),
    }
    setItems()
    saveTransactionReport()
}

function saveTransactionReport() {
    $.ajax({
        url: ip.url + '/api/transaction/save-report',
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(json_var.t_add_report[0]),
        success: () => {
            saveTransactionReportItem()
        }
    })
}

function saveTransactionReportItem() {
    $.ajax({
        url: ip.url + '/api/transaction/save-return-report-item',
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(json_var.t_ret_table)
    })
}

function setItems() {
    const table = json_var.t_ret_table
    for(let i=0;i<table.length;i++) {
        table[i]['num'] = ''
        table[i]['uniqueId'] = $('#right-return-new-id').val()
    }
}

function saveNullItem(id) {
    const table = json_var.t_ret_table_null
    for(let i=0;i<table.length;i++) {
        table[i]['reportId'] = id
    }
    $.ajax({
        url: ip.url + '/api/inventory/save-return-report-item',
        contentType: 'application/json',
        type: 'POST',
        dataTYpe: 'json',
        data: JSON.stringify(table),
        success: ()=> {
            saveNullReport(id)
        }
    })
}

function clearField() {
    json_var.t_ret_table_null = []
    json_var.t_ret_table = []
    $('#transaction-return-item-body').empty()
    $('#right-return-new-id').val('')
    $('#right-return-id').val('')
    $('#right-return-date').val('')
    $('#right-return-credit').val('')
    $('#right-return-total').val('')
}

function saveNullReport() {
    $.ajax({
        url: ip.url + '/api/inventory/save-report-null',
        contentType: 'application/json',
        type: 'POST',
        dataTYpe: 'json',
        data: JSON.stringify(json_var.t_inventory_report_null),
        success: (response)=> {
            const report = $('#right-return-new-id').val()
            if(response) {
                ipcRenderer.send('showMessage','Return success', report + ' successfully saved.')
                clearField()
            }
        }
    })
}

function makeNullReport() {
    $.ajax({
        url: ip.url + '/api/inventory/generate-id-null',
        type: 'GET',
        success: (response)=> {
            const user = $('#main-user-name').text()
            const newId = $('#right-return-new-id').val()
            const table = json_var.t_ret_table_null
            let total = parseFloat('0')
            for(let i=0;i<table.length;i++) {
                if(table[i]['reason'] === 'Exp/Dmg') total += table[i]['total']
            }
            json_var.t_inventory_report_null = {
                'id': response,
                'user': user,
                'total': total,
                'date': '',
                'timestamp': '',
                'link': newId,
                'isValid': '1'
            }
            saveNullItem(response)
        }
    })
}

$('#return-item-ret-1').on('keyup',()=> {
    let returnQuantity = $('#return-item-ret-1').val()
    const price = $('#return-item-ret-2').val().substring(2)
    const dbQuantity = $('#transaction-return-quantity').prop('class').split(' ')[0]
    returnQuantity = returnQuantity === '' ? 0 : parseFloat(returnQuantity)
    if(returnQuantity <= parseInt(dbQuantity)) {
        const a = subtract(dbQuantity,returnQuantity)
        $('#return-item-original-1').val(a === 0 ? '' : a)
        const originalQuantity = $('#return-item-original-1').val()
        calculateNewReturnTotal(returnQuantity,price)
        calculateNewOriginalTotal(originalQuantity,price)
    }else {
        ipcRenderer.send('showError','Return Item','Invalid: check returned item count')
        $('#return-item-ret-1').val(dbQuantity)
        calculateNewReturnTotal(dbQuantity,price)
    }
})

function calculateNewOriginalTotal(dbQuantity,price) {
    dbQuantity = dbQuantity === '' ? 0 : dbQuantity
    const discount = $('#return-item-original-4').val().split(' ')[0]
    const a = multiply(dbQuantity,price)
    const b = divide(discount,100)
    const originalTotal = dbQuantity === 0 ? '' : '\u20B1 ' + subtract(a,multiply(a,b)).toLocaleString()
    $('#return-item-original-3').val(originalTotal)
    $('#return-item-original-4').val(discount + ' %')
}

function calculateNewReturnTotal(returnQuantity,price) {
    returnQuantity = returnQuantity === '' ? 0 : returnQuantity
    const discount = $('#return-item-ret-4').val().split(' ')[0]
    const a = multiply(returnQuantity,price)
    const b = divide(discount,100)
    const returnTotal = returnQuantity === '' ? '' : '\u20B1 ' + subtract(a,multiply(a,b)).toLocaleString()
    $('#return-item-ret-3').val(returnTotal)
    $('#return-item-ret-4').val(discount + ' %')
}

$('#return-item-drop-1').on('click',()=> {
    $('#return-item-drop').text('None')
    $('#return-item-main').addClass('d-none')
    resetReturnModal()
})

$('#return-item-drop-2').on('click',()=> {
    $('#return-item-drop').text('Exp/Dmg')
    $('#return-item-main').removeClass('d-none')
    resetReturnModal()
})

$('#return-item-drop-3').on('click',()=> {
    $('#return-item-drop').text('Return')
    $('#return-item-main').removeClass('d-none')
    resetReturnModal()
})

$('#transaction-return-modal').on('hidden.bs.modal',()=> {
    $('#transaction-return-hidden').removeClass()
    $('#transaction-return-quantity').removeClass()
})

function resetReturnModal() {
    const quantity = $('#transaction-return-quantity').prop('class').split(' ')[0]
    const price = $('#return-item-original-2').val().substring(2)
    $('#return-item-original-1').val('')
    $('#return-item-original-3').val('')
    $('#return-item-ret-1').val(quantity)
    const discount = $('#return-item-ret-4').val().split(' ')[0]
    const a = multiply(quantity,price)
    const b = divide(discount,100)
    const returnTotal = quantity === '' ? '' : '\u20B1 ' + subtract(a,multiply(a,b)).toLocaleString()
    $('#return-item-ret-3').val(returnTotal)
}
