import {ipcRenderer,ins} from "../../../variable.js";

$().ready(() => {
    populateProductList()
    isReportIdExisting()

})

export function populateProductList(){
    const interval = setInterval(()=> {
        const search = $('#transaction-add-search').val()
        if (search === '') findAllProduct()
        else findProductBySearch(search)
    },1000)
    ins.setTransactionFindAllProduct(interval)
}

function findAllProduct() {
    $.ajax({
        url: 'http://localhost:8080/api/product/all-merchandise',
        type: 'GET',
        success: function (response) {
            $('.transaction-add-item').remove()
            populate(response)
        },
        error:function (jqXHR, status, error) {
            console.log(status + ' ' + error)
        }
    })
}

function findProductBySearch(search) {
    $.ajax({
        url: 'http://localhost:8080/api/product/search-merchandise',
        type: 'GET',
        data: {'search': search},
        success:function (response) {
            $('.transaction-add-item').remove()
            populate(response)
        },
        error:function (jqXHR, status, error) {

        }
    })
}

function populate(data) {
    const list = $('#transaction-add-product')
    for(let i=0;i<data.length;i++) {
        const id = data[i]['id']
        const price = data[i]['price']
        const name = data[i]['name']
        let quantity = parseInt(data[i]['quantityPerPieces'])
        const row = `<tr id="transaction-add-table-`+ id +`" class="transaction-add-item" data-bs-toggle="modal" data-bs-target="#view-modal">
                        <th scope="row">`+ (i+1) +`</th>
                        <td>`+ id +`</td>
                        <td>`+ name +`</td>
                        <td>&#8369; `+ price +`</td>
                        <td>`+ quantity +`</td>
                    </tr>`
        list.append(row)
        tableRowColor(quantity,id)
        setInitModal($('#transaction-add-table-'+id),name,price,id)
        setInputChangeListener(id,name,price)
    }
}

function tableRowColor(quantity,id) {
    // FIX IF LOGIC
    const tableRow = $('#transaction-add-table-'+id)
    tableRow.addClass('bg-opacity-25')
    if(quantity === 0) tableRow.addClass('bg-danger')
    else if(quantity <= 100) tableRow.addClass('bg-warning')
    else tableRow.removeClass('bg-opacity-25')
}

function setInputChangeListener(id,name, price) {
    const quantity = $('#transaction-add-modal-quantity');
    quantity.on('keyup',()=> {
        if($('#transaction-product-add-modal').text() === name) {
            $.ajax({
                url: 'http://localhost:8080/api/product/quantity-discount',
                data: {
                    'id': id,
                    'quantity': quantity.val() > 0 ? quantity.val() : 0,
                },
                success:function (response) {
                    const discount = response['discount'] ? response['discount'] : 0;
                    $('#transaction-add-modal-discount').val(discount + ' %')
                    countTotal(discount,price,quantity.val())
                },
                error:function (jqXHR, status, error) {

                }
            })
        }
    })
}

function countTotal(discount,price,quantity) {
    quantity = quantity === '' ? 0 : quantity
    const totalPrice = parseInt(quantity) * parseFloat(price)
    const discountTotal = totalPrice * (discount / 100)
    $('#transaction-add-modal-sum').val('\u20B1 ' + totalPrice.toLocaleString())
    $('#transaction-add-modal-total').val('\u20B1 ' + (totalPrice - discountTotal).toLocaleString())
    return totalPrice - discountTotal
}

function setInitModal(button,name,price,id) {
    button.on('click',()=> {
        const hidden = $('#transaction-add-hidden');
        $('#transaction-product-add-modal').text(name)
        $('#transaction-add-modal-price').val('\u20B1 ' + price)
        hidden.removeClass()
        hidden.addClass(id)
    })
}

$('#view-modal').on('show.bs.modal',()=> {
    $('#transaction-add-modal-price').val('\u20B1 ' + 0)
    $('#transaction-add-modal-quantity').val(0)
    $('#transaction-add-modal-sum').val('\u20B1 ' + 0)
    $('#transaction-add-modal-discount').val(0 + ' %')
    $('#transaction-add-modal-total').val('\u20B1 ' + 0)
})

$('#transaction-add-btn-modal').on('click',()=> {
    const id = $('#transaction-add-hidden').attr('class').split(' ')[0]
    const quantity = $('#transaction-add-modal-quantity').val().trim();
    const discount = $('#transaction-add-modal-discount').val().split(' ')[0];
    $.ajax({
        url: 'http://localhost:8080/api/product/verify-stock',
        data: {
            'id': id,
            'quantity': quantity !== '' ? quantity : 0,
        },
        success: function (response) {
            if(response && !$('#transaction-add-left-table').hasClass('transaction-item-list-'+id)) addProductToLeftList(quantity,id,discount,false)
            else ipcRenderer.send('showError','Product Add',"Error: duplicate or invalid stock count")
        },
    })
})

function addProductToLeftList(quantity,id,discount,isEdit) {
    const name = isEdit ? $('#transaction-left-edit-title').text() : $('#transaction-product-add-modal').text()
    const price = isEdit ? $('#transaction-left-edit-price').val() : $('#transaction-add-modal-price').val()
    const table = $('#transaction-add-left-table')
    table.addClass('transaction-item-list-'+id)
    const length = table.attr('class').split(' ').length
    const total = countTotal(discount,price.substring(2),quantity)
    const row = `<tr id="transaction-left-option-`+ id +`">
                    <th id="transaction-left-row-`+ length +`" class="sample `+ id +`" scope="row">`+ length +`</th>
                    <td id="transaction-left-name-`+ id +`">`+ name +`</td>
                    <td id="transaction-left-quantity-`+ id +`">`+ quantity +`</td>
                    <td id="transaction-left-total-`+ id +`">&#8369; `+ total.toLocaleString() +`</td>
                    <td id="transaction-left-`+ id +`">
                        <i id="transaction-row-add-`+ id +`" class="custom-pointer fa-solid fa-rectangle-xmark text-danger"></i>
                    </td>
                </tr>`
    table.append(row)
    setProductRemoveButton($('#transaction-row-add-'+id),id,total)
    calculateTotalPrice(total)
    setLeftRowOption($('#transaction-left-option-'+id),name,quantity,price,id)
}

function setLeftRowOption(link,name,quantity,price,id) {
    link.on('dblclick',()=> {
        $.ajax({
            url: 'http://localhost:8080/api/product/quantity-discount',
            data: {
                'id': id,
                'quantity': quantity > 0 ? quantity : 0,
            },
            success:function (response) {
                const discount = response['discount'] ? response['discount'] : 0
                const sum = parseFloat(quantity) * parseFloat(price.substring(2))
                const total = sum - (sum * (discount/100))
                $('#transaction-left-edit-quantity').val(quantity)
                $('#transaction-left-edit-title').text(name)
                $('#transaction-left-edit-price').val(price)
                $('#transaction-left-edit-discount').val(discount + ' %')
                $('#transaction-left-edit-sum').val('\u20B1 ' + sum)
                $('#transaction-left-edit-total').val('\u20B1 ' + total)
                $('#transaction-left-edit-hidden').removeClass()
                $('#transaction-left-edit-hidden').addClass(id)
                $('#transaction-left-list-edit').modal('show')
                leftEditButton()
            },
            error:function (jqXHR, status, error) {

            }
        })
    })
}

function leftEditButton() {
    $('#transaction-left-edit-button').on('click',()=> {
        const id = $('#transaction-left-edit-hidden').attr('class').split(' ')[0]
        const quantity = $('#transaction-left-edit-quantity').val()
        const discount = $('#transaction-left-edit-discount').val().split(' ')[0]
        $('#transaction-row-add-'+id).click()
        addProductToLeftList(quantity,id,discount,true)
    })
}

$('#transaction-left-edit-quantity').on('keyup',()=> {
    let quantity = parseInt($('#transaction-left-edit-quantity').val())
    const price = $('#transaction-left-edit-price').val()
    const id = $('#transaction-left-edit-hidden').attr('class').split(' ')[0]
    $.ajax({
        url: 'http://localhost:8080/api/product/quantity-discount',
        data: {
            'id': id,
            'quantity': quantity > 0 ? quantity : 0,
        },
        success:function (response) {
            if(!Number.isInteger(quantity)) quantity = 0
            const discount = response['discount'] ? response['discount'] : 0
            const sum = parseFloat(quantity) * parseFloat(price.substring(2))
            const total = sum - (sum * (discount/100))
            $('#transaction-left-edit-sum').val('\u20B1 ' + sum.toLocaleString())
            $('#transaction-left-edit-discount').val(discount + ' %')
            $('#transaction-left-edit-total').val('\u20B1 ' + total.toLocaleString())
        },
        error:function (jqXHR, status, error) {

        }
    })
})

function setProductRemoveButton(button,id,total) {
    button.on('click',()=> {
        const negative = (-1 * parseFloat(total))
        calculateTotalPrice(negative)
        $('#transaction-add-left-table').removeClass('transaction-item-list-'+id)
        button.parent().parent().remove()
        changeLeftListNumbering(0)
    })
}

function changeLeftListNumbering(cycle) {
    let flag = true
    let i = 1
    let check = 0;
    let count = 1;
    while(flag) {
        const row = cycle === 2 ? $('#left-list-add-'+i).attr('class') : $('#transaction-left-row-'+i).attr('class')
        if(row === undefined && check === 1) flag = false
        else if(row === undefined) {
            i++
            check++
        } else {
            if(cycle === 0) $('#transaction-left-row-'+i).text(count)
            else if(cycle === 1) $('#transaction-left-row-'+i).attr('id','left-list-add-'+count)
            else if(cycle === 2) $('#left-list-add-'+i).attr('id','transaction-left-row-'+count)
            count++
            i++
        }
    }
    if(cycle === 0) changeLeftListNumbering(1)
    else if(cycle === 1) changeLeftListNumbering(2)
}

function generateReportId() {
    $.ajax({
        url: 'http://localhost:8080/api/transaction/generate-report-id',
        success: function (response) {
            $('#transaction-add-report').text('ID: ' + response)
        }
    })
}

function isReportIdExisting() {
    setInterval(()=> {
        const report = $('#transaction-add-report').text().substring(4)
        $.ajax({
            url: 'http://localhost:8080/api/transaction/is-exist-report-id',
            data: {'id': report},
            success: function (response) {
                if(response) generateReportId()
            }
        })
    },1000)
}

function calculateTotalPrice(productPrice) {
    const totalElement = $('#transaction-add-total')
    const total = totalElement.text().substring(9)
    const totalPrice = parseFloat(total) + parseFloat(productPrice)
    totalElement.text('Total: \u20B1 ' + totalPrice.toLocaleString())
}

function clear() {
    $('#transaction-add-total').text('Total: \u20B1 ' + 0)
    $('#transaction-add-left-table').empty()
}

$('#transaction-add-clear').on('click',()=> {
    clear()
})

$('#add-pay-dropdown-1').on('click',()=> {
    $('#add-pay-dropdown').text('Default')
    $('#add-pay-modal-hidden').addClass('d-none')
})

$('#add-pay-dropdown-2').on('click',()=> {
    const hidden = $('#add-pay-modal-hidden')
    $('#add-pay-dropdown').text('Senior')
    hidden.text('Version: senior')
    hidden.removeClass('d-none')
})

$('#add-pay-dropdown-3').on('click',()=> {
    const hidden = $('#add-pay-modal-hidden')
    $('#add-pay-dropdown').text('PWD')
    hidden.text('Version: pwd')
    hidden.removeClass('d-none')
})

$('#add-pay-modal').on('show.bs.modal',()=> {
    const user = $('#main-user-name').text()
    const id = $('#transaction-add-report').text()
    $('#add-pay-modal-id').text('Ref No: ' + id.substring(4))
    $('#add-pay-modal-user').text('Cashier: ' + user)
    $('#add-pay-modal-date').text('Date: ' + getDate())
    setPayModal()
})

function setPayModal() {
    const body = $('#add-pay-modal-body')
    body.empty()
    $('#add-pay-modal-total').text('Total: \u20B1 0.00')
    let i = 1
    let flag = true
    while(flag) {
        const item = getAllProduct(i)
        if(item[0] === 'UNDEFINED') break
        const row = `<tr>
                      <div id="add-pay-row-`+ item[3] +`" class="d-none"></div>
                      <td class="text-start">`+ item[0] +`</td>
                      <td class="text-end">`+ item[2] +`</td>
                      <td class="text-end">`+ item[1] +`</td>
                    </tr>`
        body.append(row)
        i++
    }
}

function getAllProduct(num) {
    const row = $('#transaction-left-row-'+num).attr('class')
    if(row === undefined) return ['UNDEFINED']
    const id = row.split(' ')[1]
    const name = $('#transaction-left-name-'+id).text()
    const total = $('#transaction-left-total-'+id).text()
    const quantity = $('#transaction-left-quantity-'+id).text()
    calculateTotalToPay(total.substring(2))
    return [name,total,quantity,id]
}

function calculateTotalToPay(total) {
    const elem = $('#add-pay-modal-total')
    const elemText = elem.text().substring(9)
    elem.text('Total: \u20B1 ' + (parseFloat(elemText) + parseFloat(total)))
}

export function getDate() {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const MM = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    let hh = today.getHours()
    let mm = today.getMinutes()
    let ss = today.getSeconds()

    hh = hh < 10 ? '0' + hh : hh
    mm = mm < 10 ? '0' + mm : mm
    ss = ss < 10 ? '0' + ss : ss

    return MM + '/' + dd + '/' + yyyy + ' ' + hh + ':' + mm + ':' + ss
}