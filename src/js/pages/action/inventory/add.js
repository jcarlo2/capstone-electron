import {i_add_generate_id, i_add_input, i_add_populate, ip, ipcRenderer, json_var,} from "../../../variable.js";
import {ajaxDefaultArray, divide, multiply, setProductNotification, setRowColor, subtract} from "../../../function.js";
import {saveLog} from "../log/log.js";

export function startInventoryAdd() {
    setSearch()
    autogenerateId()
    setAddModalInput()
    setInventoryAddSave()
    setAddClearButton()
    setDropDown()
}

function setAddClearButton() {
    const interval = setInterval(()=> {
        $('#inventory-add-clear').on('click',()=> {
            $('#inventory-add-left-table').empty()
            $('#inventory-add-left-total').text('Total: \u20B1 0.00')
            json_var.i_add_table = []
        })
        if($('#inventory-add-clear').length === 1) clearInterval(interval)
    },1000)
}

function setDropDown() {
    const interval = setInterval(()=> {
        const button = $('#inventory-add-filter')

        $('#inventory-add-filter-1').on('click',()=> {
            button.text('Filter By Id')
        })

        $('#inventory-add-filter-2').on('click',()=> {
            button.text('Filter By Name')
        })

        $('#inventory-add-filter-3').on('click',()=> {
            button.text('Filter By Stock L-H')
        })

        $('#inventory-add-filter-4').on('click',()=> {
            button.text('Filter By Stock H-L')
        })

        $('#inventory-add-filter-5').on('click',()=> {
            button.text('Filter By Price L-H')
        })
        $('#inventory-add-filter-6').on('click',()=> {
            button.text('Filter By Price H-L')
        })
        if($('#inventory-add-filter').length === 1) clearInterval(interval)
    })
}

function autogenerateId() {
    i_add_generate_id.intervalId = setInterval(()=> {
        $.ajax({
            url: ip.address + '/api/inventory/is-exist-delivery-id',
            dataType: 'json',
            contentType: 'application/json',
            data: {
                'id': $('#inventory-add-report').text().substring(4)
            },
            success: (response)=> {
                if(response) generateId()
            }
        })
    },500)
}

function setInventoryAddSave() {
    const interval = setInterval(()=> {
        $('#inventory-add-pay').off('click')
        $('#inventory-add-pay').on('click',()=> {
            ipcRenderer.send('delivery',$('#inventory-add-report').text().substring(4))
            ipcRenderer.removeAllListeners('deliveryResponse')
            ipcRenderer.on('deliveryResponse',(e,num)=> {
                if(num === 0) {
                    const id = $('#inventory-add-report').text().substring(4)
                    saveLog('Inventory Delivery', 'Adding Delivery Report: ' + id)
                    makeReport()
                }
            })
        })
        if($('#inventory-add-pay').length === 1) clearInterval(interval)
    },1000)
}

function checkDisabledSaveButton() {
    const table = json_var.i_add_table
    if(table.length > 0) $('#inventory-add-pay').prop('disabled',false)
    else $('#inventory-add-pay').prop('disabled',true)
}

function setSearch() {
    i_add_populate.intervalId = setInterval(() => {
        const search = $('#inventory-add-search').val()
        const filter = $('#inventory-add-filter').text()
        let ajax = undefined
        if (search === '') ajax = ajaxDefaultArray('/api/product/all-merchandise',{'filter': filter})
        else if (search !== undefined) ajax = ajaxDefaultArray('/api/product/search-merchandise',{'search': search,'filter':filter})
        if(ajax !== undefined) ajax.then((response)=> populateProductList(response))
    }, 1000)
}

function setAddModalInput() {
    i_add_input.intervalId = setInterval(()=> {
        let quantity = $('#inventory-add-quantity').val()
        let cost = $('#inventory-add-cost').val()
        quantity = parseFloat(quantity)
        cost = parseFloat(cost)
        checkInventoryModalButton(quantity,cost)
        checkInventoryModalInputBorder(quantity,cost)
    },500)
}

function checkInventoryModalInputBorder(quantity,cost) {
    if(Math.sign(quantity) === 1 && Number.isInteger(quantity)) {
        $('#inventory-add-quantity').removeClass('border-danger')
        $('#inventory-add-quantity').addClass('border-success')
    }else {
        $('#inventory-add-quantity').addClass('border-danger')
        $('#inventory-add-quantity').removeClass('border-success')
    }
    if(Math.sign(cost) === 1) {
        $('#inventory-add-cost').removeClass('border-danger')
        $('#inventory-add-cost').addClass('border-success')
    }else {
        $('#inventory-add-cost').addClass('border-danger')
        $('#inventory-add-cost').removeClass('border-success')
    }

}

function checkInventoryModalButton(quantity,cost) {
    if(Math.sign(quantity) === 1
        && Math.sign(cost) === 1
        && Number.isInteger(quantity)) {
        $('#inventory-add-btn-modal').prop('disabled', false)
    }else $('#inventory-add-btn-modal').prop('disabled', true)
}

function populateProductList(data) {
    setProductNotification($('#notification'),data)
    $('#inventory-add-product').empty()
    for(let i=0;i<data.length;i++) {
        const id = data[i]['id']
        const name = data[i]['name']
        const stock = data[i]['quantityPerPieces']

        const row = `<tr id="inventory-product-`+ id +`" class="d-flex">
                        <th class="col-1" scope="row">`+ (i+1) +`</th>
                        <td class="col-3 text-start">`+ id +`</td>
                        <td class="col-5 text-start">`+ name +`</td>
                        <td class="col-3 text-start">`+ stock +`</td>
                    </tr>`
        $('#inventory-add-product').append(row)
        setRowColor($('#inventory-product-'+id),stock)
        setClick(data[i],$('#inventory-product-'+id))
    }
}

function setClick(data,row) {
    row.on('click',()=> {
        $('#inventory-add-title').text(data['name'])
        $('#inventory-add-id').val(data['id'])
        $('#inventory-add-hidden').text(data['capital'])
        $('#inventory-add-modal').modal('show')
    })
}

$('#inventory-add-cost').on('keyup',()=> {
    inputListener()
})

$('#inventory-add-discount').on('keyup',()=> {
    inputListener()
})

function inputListener() {
    const cost = $('#inventory-add-cost').val() === '' ? 0 : $('#inventory-add-cost').val()
    const discount = $('#inventory-add-discount').val() === '' ? 0 : $('#inventory-add-discount').val()
    const total = subtract(cost,multiply(cost,divide(discount,100))).toLocaleString()

    if(cost < 0 || discount < 0) $('#inventory-add-total').val('\u20B1 ' + total)
    else $('#inventory-add-total').val('\u20B1 ' + total)
}

$('#inventory-add-btn-modal').on('click',()=> {
    const table = json_var.i_add_table
    const id = $('#inventory-add-id').val()
    let flag = true
    for(let i in table) {
        if(table[i]['productId'] === id) {
            flag = false
            break
        }
    }
    //FIx
    if(flag) addToInventoryTable(table,id)
    else ipcRenderer.send('showError','Add stock', 'Error: duplicate product')
    populateLeftList()
    setTotal()
    checkDisabledSaveButton()
})

function addToInventoryTable(table,id) {
    const quantity = $('#inventory-add-quantity').val()
    const cost = $('#inventory-add-cost').val()
    const discount = $('#inventory-add-discount').val()
    const total = $('#inventory-add-total').val()
    table[table.length] = {
        'num' : '',
        'productId' : id,
        'name' : $('#inventory-add-title').text(),
        'quantity' : quantity,
        'totalPrice' : cost,
        'discountPercentage' : discount === '' ? 0 : discount,
        'totalAmount' : total.substring(2).replace(',',''),
        'uniqueId' : $('#inventory-add-report').text().substring(4),
        'capital' : $('#inventory-add-hidden').text()
    }
}

function setTotal() {
    const table = json_var.i_add_table
    let total = 0
    for(let i=0;i<table.length;i++) {
        total += parseFloat(table[i]['totalAmount'])
    }
    $('#inventory-add-left-total').text('Total: \u20B1 ' + total.toLocaleString())
}

function populateLeftList() {
    const table = json_var.i_add_table
    $('#inventory-add-left-table').empty()
    for(let i=0;i<table.length;i++) {
        const row = `<tr class="d-flex">
                        <td class="col-1">`+ (i+1) +`</td>
                        <td class="col-5 text-start">`+ table[i]['productId'] +`</td>
                        <td class="col-2 text-start">`+ table[i]['quantity'] +`</td>
                        <td class="col-3 text-start">&#8369; `+ parseFloat(table[i]['totalAmount']).toLocaleString() +`</td>
                        <td class="col-1 text-start" id="inventory-add-list-`+i+`"><i class="custom-pointer fa-solid fa-rectangle-xmark text-danger"></i></td>
                    </tr>`
        $('#inventory-add-left-table').append(row)
        setRemoveButton($('#inventory-add-list-'+i),table,i)
    }
}

function setRemoveButton(button,table,i) {
    button.on('click',()=> {
        table.splice(i,1)
        setTotal()
        checkDisabledSaveButton()
        populateLeftList(table)
    })
}

$('#inventory-add-modal').on('hidden.bs.modal',()=> {
    $('#inventory-add-title').text('')
    $('#inventory-add-id').val('')
    $('#inventory-add-quantity').val('')
    $('#inventory-add-cost').val('')
    $('#inventory-add-total').val('')
    $('#inventory-add-hidden').text('')
})

function generateId() {
    $.ajax({
        url: ip.address + '/api/inventory/generate-id-delivery',
        success: (response)=> {
            $('#inventory-add-report').text('ID: ' + response)
        }
    })
}

function makeReport() {
    const id = $('#inventory-add-report').text().substring(4)
    const user = $('#main-user-name').text()
    const total = $('#inventory-add-left-total').text().substring(9)
    json_var.i_add_report = {
        'id' : id,
        'user' : user,
        'total' : total,
        'date' : '',
        'timestamp' : '',
        'isValid' : '1',
        'reason' : 'Default',
        'link' : '',
    }
    saveReport(id)
}

function saveReport(id) {
    $.ajax({
        url: ip.address + '/api/inventory/save-delivery-report',
        contentType: 'application/json',
        data: JSON.stringify(json_var.i_add_report),
        type: 'POST',
        success: ()=> {
            saveReportItem(id)
        }
    })
}

function saveReportItem(id) {
    $.ajax({
        url: ip.address + '/api/inventory/save-delivery-report-item',
        contentType: 'application/json',
        data: JSON.stringify(json_var.i_add_table),
        type: 'POST',
        success: ()=> {
            ipcRenderer.send('showMessage','Delivery Report', id + ' is saved successfully')
            json_var.i_add_table = []
            $('#inventory-add-left-total').text('\u20B1 0.00')
            $('#inventory-add-left-table').empty()
        }
    })
}

