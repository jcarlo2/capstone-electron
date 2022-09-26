import {t_ret_populate, json_var, ipcRenderer, t_ret_clear, t_ret_pay, t_ret_new_total} from "../../../variable.js";
import {multiply,divide,subtract} from "../../../function.js";

$().ready(()=> {
    getReport()
    setReturnResetButton()
    setReturnPayNow()
    setNewTotal()
})

export function setReturnPayNow() {
    t_ret_pay.setIntervalId(setInterval(()=> {
        $('#transaction-return-pay-now').on('click',()=> {
            $('#return-pay-modal').modal('show')
        })
        if($('#transaction-return-pay-now').length === 1) clearInterval(t_ret_pay.getIntervalId())
    },1000))
}

export function setReturnResetButton() {
    t_ret_clear.setIntervalId(setInterval(()=> {
        $('#transaction-return-table-clear').on('click',()=> {
            const id = $('#right-return-id').val()
            $.ajax({
                url: 'http://localhost:8080/api/transaction/find-all-item',
                type: 'GET',
                contentType: 'application/json',
                data:{'id': id},
                success: function (response) {
                    json_var.t_ret_table = response
                    populateTable(json_var.t_ret_table,'','')
                }
            })
        })
        if($('#transaction-return-table-clear').length === 1) clearInterval(t_ret_clear.getIntervalId())
    },1000))
}

export function setNewTotal() {
    t_ret_new_total.setIntervalId(setInterval(()=> {
        const table = json_var.t_ret_table
        let newTotal = 0
        for(let i=0;i<table.length;i++) {
            newTotal += (parseFloat(table[i]['totalAmount']) ? parseFloat(table[i]['totalAmount']) : 0)
        }
        $('#right-return-credit').val('\u20B1 ' + newTotal.toLocaleString())
    },1000))
}

export function getReport() {
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
}


function getAllReportBySearch(search) {
    $.ajax({
        url: 'http://localhost:8080/api/transaction/search-transaction',
        data: {'search': search},
        contentType: 'application/json',
        dataType:'json',
        success: function (response) {
            populate(response)
        }
    })
}

function getAllReportByDate(start,end) {
    $.ajax({
        url: 'http://localhost:8080/api/transaction/search-end',
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
        url: 'http://localhost:8080/api/transaction/search-end',
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
        url: 'http://localhost:8080/api/transaction/search-start',
        data: {'start': start},
        contentType: 'application/json',
        success: function (response) {
            populate(response)
        }
    })
}

function getAllReport() {
    $.ajax({
        url: 'http://localhost:8080/api/transaction/get-all-report',
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
        const row = `<tr id="return-`+ data[i]['id'] +`">
                        <th scope="row">`+ (i+1) +`</th>
                        <td>`+ data[i]['id'] +`</td>
                        <td>`+ data[i]['timestamp'] +`</td>
                    </tr>`
        body.append(row)
        setDoubleClick(data[i]['id'],data[i]['timestamp'],data[i]['totalAmount'])
    }
}

function setDoubleClick(id,timestamp,total) {
    $('#return-'+id).on('dblclick',()=> {
        $.ajax({
            url: 'http://localhost:8080/api/transaction/new-report-id',
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
        url: 'http://localhost:8080/api/transaction/find-all-item',
        type: 'GET',
        contentType: 'application/json',
        data:{'id': id},
        success: function (response) {
            json_var.t_ret_table = response
            populateTable(json_var.t_ret_table,'','')
        }
    })
}

function populateTable(data,prodId,reason) {
    $('#transaction-return-item-body').empty()
    for(let i=0;i<data.length;i++) {
        const product = data[i]['productId'];
        reason = (product === prodId && reason !== '') ? reason : 'None'
        const row = `<tr id="return-item-row-`+ product +`" class="d-flex `+ product +`">
                        <th class="col-1" scope="col">`+ (i + 1) +`</th>
                        <td class="col-4 text-start">`+ data[i]['name'] +`</td>
                        <td class="col-2">\u20b1 `+ parseFloat(data[i]['price']).toLocaleString() +`</td>
                        <td class="col-2">`+ data[i]['sold'] +`</td>
                        <td class="col-2">\u20b1 `+ parseFloat(data[i]['totalAmount']).toLocaleString() +`</td>
                        <td id="return-reason-`+ product +`" class="col-1">`+ reason +`</td>
                    </tr>`
        $('#transaction-return-item-body').append(row)
        setReturnedItemModal(data[i], $('#return-item-row-'+product),i)
    }
}

function setReturnedItemModal(data,row,i) {
    row.on('click',()=> {
        getOriginalData(i)
        $('#transaction-return-hidden').addClass(data['productId'])
        $('#transaction-return-title').text(data['name'])
        $('#return-item-ret-2').val('\u20B1 ' + data['price'])
        $('#return-item-ret-4').val(data['discountPercentage'] + ' %')
        $('#return-item-original-1').val('')
        $('#return-item-original-2').val('\u20B1 ' + data['price'])
        $('#return-item-original-3').val('\u20B1 0.00')
        $('#return-item-original-4').val(data['discountPercentage'] + ' %')
        $('#transaction-return-modal').modal('show')
    })
}

function getOriginalData(i) {
    const id = $('#right-return-id').val()
    $.ajax({
        url: 'http://localhost:8080/api/transaction/find-all-item',
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

$('#transaction-return-modal-update').on('click',()=> {
    const reason = $('#return-item-drop').text()
    if(reason === 'None') return
    let quantity = $('#return-item-original-1').val()
    const price = $('#return-item-original-2').val().substring(2)
    const total = $('#return-item-original-3').val().substring(2)
    let ret_quantity = $('#return-item-ret-1').val()
    const ret_total = $('#return-item-ret-3').val().substring(2)
    const discount = $('#return-item-ret-4').val().split(' ')[0]
    const id = $('#transaction-return-hidden').prop('class').split(' ')[0]
    quantity = quantity === '' ? 0 : quantity
    ret_quantity = ret_quantity === '' ? 0 : ret_quantity
    const nullTable = json_var.t_ret_table_null
    const table = json_var.t_ret_table
    updateTable(table,quantity,price,total,id,discount,'')
    updateTable(nullTable,ret_quantity,price,ret_total,id,discount,$('#return-item-drop').text())
    populateTable(table,id,$('#return-item-drop').text())

})

function updateTable(table,quantity,price,total,id,discount,reason) {
    let flag = true
    total = total === '' ? '0' : total
    for(let i=0;i<table.length;i++) {
        if(table[i]['productId'] === id) {
            table[i].sold = quantity
            table[i].soldTotal = quantity * price
            table[i].totalAmount = total.replace(',','')
            flag = false
            break
        }
    }
    if(flag) {
        table[table.length] = {
            'productId': id,
            'sold': quantity,
            'soldTotal': subtract(multiply(quantity,price),multiply(multiply(quantity,price),divide(discount,100))),
            'totalAmount': total,
            'discountPercentage': discount,
            'reason': reason,
        }
    }
}

$('#return-item-ret-1').on('keyup',()=> {
    let ret_quantity = $('#return-item-ret-1').val()
    const price = $('#return-item-ret-2').val().substring(2)
    const original_quantity = $('#transaction-return-quantity').prop('class').split(' ')[0]
    console.log(original_quantity)
    ret_quantity = ret_quantity === '' ? 0 : parseFloat(ret_quantity)
    if(ret_quantity <= parseInt(original_quantity)) {
        const new_quantity = subtract(original_quantity,ret_quantity) === 0 ? '' : subtract(original_quantity,ret_quantity)
        $('#return-item-original-1').val(new_quantity)
        const orig_quantity = $('#return-item-original-1').val()
        calculateNewReturnTotal(ret_quantity,price)
        calculateNewOriginalTotal(orig_quantity,price)
    }else {
        ipcRenderer.send('showError','Return Item','Invalid count: check returned item count')
        $('#return-item-ret-1').val(original_quantity)
        calculateNewReturnTotal(original_quantity,price)
    }
})

function calculateNewOriginalTotal(orig_quantity,price) {
    orig_quantity = orig_quantity === '' ? 0 : orig_quantity
    const discount = $('#return-item-original-4').val().split(' ')[0]
    const a = multiply(orig_quantity,price)
    const b = divide(discount,100)
    const new_orig_total = orig_quantity === 0 ? '' : '\u20B1 ' + subtract(a,multiply(a,b)).toLocaleString()
    $('#return-item-original-3').val(new_orig_total)
    $('#return-item-original-4').val(discount + ' %')
}

function calculateNewReturnTotal(ret_quantity,price) {
    ret_quantity = ret_quantity === '' ? 0 : ret_quantity
    const discount = $('#return-item-ret-4').val().split(' ')[0]
    const a = multiply(ret_quantity,price)
    const b = divide(discount,100)
    const new_ret_total = ret_quantity === '' ? '' : '\u20B1 ' + subtract(a,multiply(a,b)).toLocaleString()
    $('#return-item-ret-3').val(new_ret_total)
    $('#return-item-ret-4').val(discount + ' %')
}

$('#return-item-drop-1').on('click',()=> {
    $('#return-item-drop').text('None')
    $('#return-item-main').addClass('d-none')
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
    const new_ret_total = quantity === '' ? '' : '\u20B1 ' + subtract(a,multiply(a,b)).toLocaleString()
    $('#return-item-ret-3').val(new_ret_total)
}
