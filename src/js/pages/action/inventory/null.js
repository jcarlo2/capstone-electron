import {
    i_add_dropdown,
    i_null_clear, i_null_dropdown,
    i_null_generate_id, i_null_pay,
    i_null_populate,
    ip,
    ipcRenderer,
    json_var,
} from "../../../variable.js";
import {clearTable, multiply, setBorderColorNonDecimal, setRowColor} from "../../../function.js";

export function startInventoryNull(){
    const interval = setInterval(()=> {
        const search = $('#inventory-null-search').val()
        if (search === '') findAllProduct()
        else findProductBySearch(search)
    },1000)
    i_null_populate.setIntervalId(interval)
    autogenerateId()
    setClearButton()
    setSave()
    setDropDown()
}

function setDropDown() {
    i_null_dropdown.setIntervalId(setInterval(()=> {
        const button = $('#inventory-null-filter')

        $('#inventory-null-filter-1').on('click',()=> {
            button.text('Filter By Id')
        })

        $('#inventory-null-filter-2').on('click',()=> {
            button.text('Filter By Name')
        })

        $('#inventory-null-filter-3').on('click',()=> {
            button.text('Filter By Stock L-H')
        })

        $('#inventory-null-filter-4').on('click',()=> {
            button.text('Filter By Stock H-L')
        })

        $('#inventory-null-filter-5').on('click',()=> {
            button.text('Filter By Price L-H')
        })
        $('#inventory-null-filter-6').on('click',()=> {
            button.text('Filter By Price H-L')
        })
        if($('#inventory-null-filter').length === 1) clearInterval(i_add_dropdown.getIntervalId())
    }))
}

function setSave() {
    i_null_pay.setIntervalId(setInterval(()=> {
        $('#inventory-null-pay').off('click')
        $('#inventory-null-pay').on('click',()=> {
            ipcRenderer.send('nullReport',$('#inventory-null-report').text().substring(4))
            ipcRenderer.removeAllListeners('nullResponse')
            ipcRenderer.on('nullResponse',(e,num)=> {
                if(num === 0) {
                    makeReport()
                    saveReport()
                }
            })
        })
        if($('#inventory-null-pay').length === 1) clearInterval(i_null_pay.getIntervalId())
    },1000))
}

function autogenerateId() {
    i_null_generate_id.setIntervalId(setInterval(()=> {
        $.ajax({
            url: ip.url + '/api/inventory/is-exist-null-id',
            dataType: 'json',
            contentType: 'application/json',
            data: {
                'id': $('#inventory-null-report').text().substring(4)
            },
            success: (response)=> {
                if(response) generateId()
            }
        })
    },500))
}

function generateId() {
    $.ajax({
        url: ip.url + '/api/inventory/generate-id-null',
        success: (response)=> {
            $('#inventory-null-report').text('ID: ' + response)
        }
    })
}

export function setClearButton() {
    i_null_clear.setIntervalId(setInterval(()=> {
        $('#inventory-null-clear').on('click',()=> {
            $('#inventory-null-left-table').empty()
            json_var.i_null_report_item = []
            checkDisabledSaveButton()
        })
        if($('#inventory-null-clear').length === 1) clearInterval(i_null_clear.getIntervalId())
    },1000))
}

function findAllProduct() {
    $.ajax({
        url: ip.url + '/api/product/all-merchandise',
        type: 'GET',
        data: {
            'filter': $('#inventory-null-filter').text()
        },
        success: function (response) {
            $('#inventory-add-product').empty()
            populateProductList(response)
        },
    })
}

function findProductBySearch(search) {
    $.ajax({
        url: ip.url + '/api/product/search-merchandise',
        type: 'GET',
        data: {'search': search},
        success:function (response) {
            $('#inventory-add-product').empty()
            populateProductList(response)
        },
    })
}

function populateProductList(data) {
    $('#inventory-null-product').empty()
    for(let i=0;i<data.length;i++) {
        const id = data[i]['id']
        const name = data[i]['name']
        const stock = data[i]['quantityPerPieces']

        const row = `<tr id="null-product-`+ id +`" class="d-flex">
                        <th class="col-1" scope="row">`+ (i+1) +`</th>
                        <td class="col-3">`+ id +`</td>
                        <td class="col-5">`+ name +`</td>
                        <td class="col-3">`+ stock +`</td>
                    </tr>`
        $('#inventory-null-product').append(row)
        setClick($('#null-product-'+id),data[i])
        setRowColor($('#null-product-'+id),stock)
    }
}

function setClick(row,data) {
    row.on('click',()=> {
        $('#inventory-null-title').text(data['name'])
        $('#inventory-null-id').val(data['id'])
        $('#inventory-null-capital').text('Capital: \u20B1'  + data['capital'])
        $('#inventory-null-price').val('\u20B1 ' + data['price'])
        $('#inventory-null-modal').modal('show')
        setQuantityListener(data)
    })
}

function setQuantityListener(data) {
    $('#inventory-null-quantity').off('click')
    $('#inventory-null-quantity').on('keyup',()=> {
        let quantity = $('#inventory-null-quantity').val()
        const price = data['price']
        quantity = quantity === '' ? 0 : quantity
        $('#inventory-null-total').val('\u20B1 ' + multiply(quantity,price).toLocaleString())
        const flag = setBorderColorNonDecimal(quantity,$('#inventory-null-quantity'))
        if(flag) $('#inventory-null-btn-modal').prop('disabled',false)
        else $('#inventory-null-btn-modal').prop('disabled',true)
        setAddNullProduct(quantity,data)
    })
}

function setAddNullProduct(quantity,data) {
    $('#inventory-null-btn-modal').off('click')
    $('#inventory-null-btn-modal').on('click',()=> {
        $.ajax({
            url: ip.url + '/api/product/verify-stock',
            type: 'GET',
            data: {
              'id': data['id'],
              'quantity': quantity
            },
            success: (response)=> {
                if(response) addToLeftList(quantity,data)
                else ipcRenderer.send('showError','Null', 'Invalid: stock count')
            }
        })
    })
}

function addToLeftList(quantity,data) {
    const table = json_var.i_null_report_item
    let flag = true
    for(let i=0;i<table.length;i++) {
        if(table[i]['id'] === data['id']) {
            flag = false
            break
        }
    }
    if(flag) addToTable(quantity,data,table)
    else ipcRenderer.send('showError','Add Null Product','Invalid: duplicate product')
    populateLeftTable()
    checkDisabledSaveButton()
}

function addToTable(quantity,data,table) {
    table[table.length] = {
        'num': '',
        'id': data['id'],
        'name': data['name'],
        'price': data['price'],
        'quantity': quantity,
        'discount': '0',
        'totalAmount': multiply(quantity,data['price']),
        'capital': data['capital'],
        'reportId': '',
        'reason': 'Exp/Dmg',
        'link': '',
    }
    setTotal()
}

function setTotal() {
    const table = json_var.i_null_report_item
    let total = 0.00
    for(let i=0;i<table.length;i++) {
        total += table[i]['totalAmount']
    }
    $('#inventory-null-left-total').text('Total: \u20B1 ' + total.toLocaleString())
}

function populateLeftTable() {
    const table = json_var.i_null_report_item
    $('#inventory-null-left-table').empty()
    for(let i=0;i<table.length;i++) {
        const row = `<tr class="d-flex">
                        <td class="col-1">`+ (i+1) +`</td>
                        <td class="col-5">`+ table[i]['name'] +`</td>
                        <td class="col-2">`+ table[i]['quantity'] +`</td>
                        <td class="col-3">&#8369; `+ parseFloat(table[i]['totalAmount']).toLocaleString() +`</td>
                        <td class="col-1" id="inventory-left-`+ table[i]['id'] +`"><i class="custom-pointer fa-solid fa-rectangle-xmark text-danger"></td>
                    </tr>`
        $('#inventory-null-left-table').append(row)
        setRemoveButton($('#inventory-left-'+ table[i]['id']),table[i]['id'])
    }
}

function setRemoveButton(button,id) {
    button.on('click',()=> {
        const table = json_var.i_null_report_item
        for(let i=0;i<table.length;i++) {
            if(table[i]['id'] === id) {
                table.splice(i,1)
                break
            }
        }
        checkDisabledSaveButton()
        setTotal()
        populateLeftTable()
    })
}

$('#inventory-null-modal').on('hidden.bs.modal',()=> {
    $('#inventory-null-quantity').val('')
    $('#inventory-null-total').val('')
    setBorderColorNonDecimal(-1,$('#inventory-null-quantity'))
})

$('#inventory-null-modal').on('shown.bs.modal',()=> {
    $('#inventory-null-quantity').focus()
})

function checkDisabledSaveButton() {
    const table = json_var.i_null_report_item
    if(table.length === 0) $('#inventory-null-pay').prop('disabled',true)
    else $('#inventory-null-pay').prop('disabled',false)
}

function makeReport() {
    const id = $('#inventory-null-report').text().substring(4)
    const user = $('#main-user-name').text()
    const total = $('#inventory-null-left-total').text().substring(9)
    console.log(total)
    json_var.i_null_report[0] = {
        'id': id,
        'user': user,
        'total': total.replace(',',''),
        'date': '',
        'timestamp': '',
        'link': '',
        'isValid': '1',
    }
}

function saveReport() {
    $.ajax({
        url: ip.url + '/api/inventory/save-report-null',
        contentType: 'application/json',
        data: JSON.stringify(json_var.i_null_report[0]),
        type: 'POST',
        success: ()=> {
            saveReportItem()
        }
    })
}

function saveReportItem() {
    setItem()
    $.ajax({
        url: ip.url + '/api/inventory/save-null-item',
        contentType: 'application/json',
        data: JSON.stringify(json_var.i_null_report_item),
        type: 'POST',
        success: ()=> {
            clearTable()
            $('#inventory-null-left-table').empty()
            $('#inventory-null-left-total').text('Total: \u20B1 0.00')
        }
    })
}

function setItem() {
    const table = json_var.i_null_report_item
    const id = $('#inventory-null-report').text().substring(4)
    for(let i=0;i<table.length;i++) {
        table[i]['reportId'] = id
    }
}
