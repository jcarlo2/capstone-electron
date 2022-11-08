import {ipcRenderer, t_add_populate} from "../../../variable.js";
import {ajaxDefault, ajaxPostStringify, ajaxSearchGet, setRowColor} from "../../../function.js";

export function startInventoryProduct() {
    setSearch()
    setDropDown()
    setAddDiscount()
    setClearButton()
    setProductHistoryModal()
    setAddButton()
    setUpdateButton()
    setArchiveButton()
}

function setArchiveButton() {
    const interval = setInterval(()=> {
        $('#product-left-archive').off('click')
        $('#product-left-archive').on('click',()=> {
            const id = $('#inventory-product-update').val()
            const name = $('#inventory-product-name').val()
            if(id !== '') {
                ajaxDefault('/api/product/product-archive',id)
                    .then(()=> {
                        ipcRenderer.send('default','Archive Product',id + ' : ' + name,'Archive','Cancel')
                        ipcRenderer.removeAllListeners('default')
                        ipcRenderer.on('default',(e,num)=> {
                            if(num === 0) {
                                ipcRenderer.send('showMessage','Archive Product', id + ' is successfully archived.')
                                clear()
                            }
                        })
                    }).catch(()=> {
                        ipcRenderer.send('showError','Archive Product', 'Failed to archive ' + id + '.\nCheck server connection and try again!')
                    })
            }
        })
        if($('#product-left-archive').length === 1) clearInterval(interval)
    },1000)
}

function setUpdateButton() {
    const interval = setInterval(()=> {
        $('#product-left-update').off('click')
        $('#product-left-update').on('click',()=> {
            const id = $('#inventory-product-update').val()
            if(id === '') return
            const name = $('#inventory-product-name').val()
            const price = $('#inventory-product-price').val()
            const capital = $('#inventory-product-capital').val()
            ipcRenderer.send('default','Product Update',id + ' : ' + name,'Update','Cancel')
            ipcRenderer.removeAllListeners('default')
            ipcRenderer.on('default',(e,num)=> {
                if(num === 0) {
                    const product = makeProductEntity(id,name,price,capital)
                    ajaxPostStringify('/api/product/update-product',product)
                        .then(()=> {
                            ipcRenderer.send('showMessage','Update Product',id + ' successfully updated.')
                            clear()
                        }).fail(()=> {
                            ipcRenderer.send('showError','Update Product','Error updating product ' + id)
                        })
                }
            })
            if($('#product-left-update').length === 1) clearInterval(interval)
        })
    },1000)
}


function setAddButton() {
    const interval = setInterval(()=> {
        $('#product-left-add').off('click')
        $('#product-left-add').on('click',()=> {
            $('#inventory-product-add-history').modal('show')
        })
        if($('#product-left-add').length === 1) clearInterval(interval)
    },1000)
}

function setProductHistoryModal() {
    const interval = setInterval(()=> {
        $('#product-history-btn').off('click')
        $('#product-history-btn').on('click',()=> {
            const id = $('#inventory-product-update').val()
            const name = $('#inventory-product-name').val()
            $('#product-history-id').text(id)
            $('#product-history-name').text(name)
            setHistory(id)
            $('#product-update-history').prop('disabled',true)
            $('#product-discount-history').prop('disabled',false)
            $('#product-table').removeClass('d-none')
            $('#discount-table').addClass('d-none')
            $('#product-history-modal').modal('show')
            if($('#product-history-btn').length === 1) clearInterval(interval)
        })
    },1000)
}

$('#product-update-history').on('click',()=> {
    $('#product-update-history').prop('disabled',true)
    $('#product-discount-history').prop('disabled',false)
    $('#inventory-product-table').removeClass('d-none')
    $('#discount-table').addClass('d-none')
})

$('#product-discount-history').on('click',()=> {
    $('#product-update-history').prop('disabled',false)
    $('#product-discount-history').prop('disabled',true)
    $('#discount-table').removeClass('d-none')
    $('#inventory-product-table').addClass('d-none')
})

function setHistory(id) {
    $.when(
        ajaxDefault('/api/product/find-all-invalid-discount',id),
        ajaxDefault('/api/product/get-product-history',id)
    ).done((discount,product)=> {
        populateProductHistoryModal(product[0])
        populateDiscountHistoryModal(discount[0])
    })
}

function setClearButton() {
    const interval = setInterval(()=> {
       $('#product-left-clear').off('click')
       $('#product-left-clear').on('click',()=> {
           clear()
           if($('#product-left-clear').length === 1) clearInterval(interval)
       })
    },1000)
}

function setAddDiscount() {
   const interval = setInterval(()=> {
       $('#product-discount-add').off('click')
       $('#product-discount-add').on('click',()=> {
           const id = $('#inventory-product-update').val()
           const name = $('#inventory-product-name').val()
           $('#inventory-discount-add-save').removeClass('d-none')
           $('#inventory-discount-add-archive').addClass('d-none')
           $('#inventory-discount-add-quantity').prop('readonly',false)
           $('#inventory-discount-add-percent').prop('readonly',false)
           $('#inventory-discount-product-id').text(id)
           $('#inventory-discount-product-name').text(name)
           setAddDiscountSave()
           $('#inventory-history-discount-list').modal('show')
           if($('#product-discount-add').length === 1) clearInterval(interval)
       })
   },1000)
}

function setAddDiscountSave() {
    $('#inventory-discount-add-save').off('click')
    $('#inventory-discount-add-save').on('click',()=> {
        
    })
}

function clear() {
    $('#inventory-product-update').val('')
    $('#inventory-product-name').val('')
    $('#inventory-product-price').val('')
    $('#inventory-product-capital').val('')
    $('#inventory-product-discount').empty()
}

function setDropDown() {
    const interval = setInterval(()=> {
        const button = $('#inventory-product-filter')

        $('#inventory-product-filter-1').off('click')
        $('#inventory-product-filter-1').on('click',()=> {
            button.text('Filter By Id')
        })

        $('#inventory-product-filter-2').off('click')
        $('#inventory-product-filter-2').on('click',()=> {
            button.text('Filter By Name')
        })

        $('#inventory-product-filter-3').off('click')
        $('#inventory-product-filter-3').on('click',()=> {
            button.text('Filter By Stock L-H')
        })

        $('#inventory-product-filter-4').off('click')
        $('#inventory-product-filter-4').on('click',()=> {
            button.text('Filter By Stock H-L')
        })

        $('#inventory-product-filter-5').off('click')
        $('#inventory-product-filter-5').on('click',()=> {
            button.text('Filter By Price L-H')
        })

        $('#inventory-product-filter-6').off('click')
        $('#inventory-product-filter-6').on('click',()=> {
            button.text('Filter By Price H-L')
        })
        if($('#inventory-product-filter').length === 1) clearInterval(interval)
    })
}

function setSearch() {
    const interval = setInterval(()=> {
        const search = $('#inventory-product-search').val()
        const filter = $('#inventory-product-filter').text()
        if (search === '') {
            ajaxSearchGet('/api/product/all-merchandise',filter)
                .then((response)=> populateProductList(response))
        } else if(search !== undefined) {
            ajaxSearchGet('/api/product/search-merchandise',search)
                .then((response)=> populateProductList(response))
        }
    },1000)
    t_add_populate.setIntervalId(interval)
}

function populateProductList(data) {
    const list = $('#inventory-product-product')
    list.empty()
    for(let i=0;i<data.length;i++) {
        const id = data[i]['id']
        const price = data[i]['price']
        const name = data[i]['name']
        let quantity = parseInt(data[i]['quantityPerPieces'])
        const row = `<tr id="inventory-product-table-`+ id +`" class="inventory-product-item d-flex">
                        <th class="col-1" scope="row">`+ (i+1) +`</th>
                        <td class="col-2 text-start">`+ id +`</td>
                        <td class="col-5 text-start">`+ name +`</td>
                        <td class="col-2 text-start">&#8369; `+ price +`</td>
                        <td class="col-2 text-start">`+ quantity +`</td>
                    </tr>`
        list.append(row)
        setClick(data[i],$('#inventory-product-table-'+id))
        setRowColor($('#inventory-product-table-'+id),quantity)
    }
}

function setClick(data,row) {
    row.on('click', ()=> {
        const id = data['id']
        $('#inventory-product-update').val(id)
        $('#inventory-product-name').val(data['name'])
        $('#inventory-product-price').val(data['price'])
        $('#inventory-product-capital').val(data['capital'])
        ajaxDefault('/api/product/find-all-valid-discount',id)
            .then((response)=> {
                populateDiscount(response)
            })
    })
}

function populateDiscount(data) {
    $('#inventory-product-discount').empty()
    for(let i in data) {
        const row = `<tr id="inventory-discount-row-`+ data[i]['quantity'] +`" class="d-flex">
                        <td class="col-1 ">`+ (parseInt(i)+1) +`</td>
                        <td class="col-6 text-center">`+ data[i]['quantity'] +`</td>
                        <td class="col-5 text-center" >`+ data[i]['discount'] +` %</td>
                    </tr>`
        $('#inventory-product-discount').append(row)
        setClickDiscount($('#inventory-discount-row-'+data[i]['quantity']), data[i])
    }
}

function setClickDiscount(row,data) {
    row.off('click')
    row.on('click',()=> {
        const name = $('#inventory-product-name').val()
        $('#inventory-discount-add-save').addClass('d-none')
        $('#inventory-discount-add-archive').removeClass('d-none')
        $('#inventory-discount-add-quantity').prop('readonly',true)
        $('#inventory-discount-add-percent').prop('readonly',true)
        $('#inventory-discount-product-id').text(data['id'])
        $('#inventory-discount-product-name').text(name)
        $('#inventory-discount-add-quantity').val(data['quantity'])
        $('#inventory-discount-add-percent').val(data['discount'] + ' %')
        $('#inventory-history-discount-list').modal('show')
    })
}

$('#inventory-history-discount-list').on('hidden.bs.modal',()=> {
    $('#inventory-discount-product-id').text('')
    $('#inventory-discount-product-name').text('')
    $('#inventory-discount-add-quantity').val('')
    $('#inventory-discount-add-percent').val('')
    $('#inventory-discount-add-save').off('click')
})

function populateProductHistoryModal(data) {
    $('#product-history-body').empty()
    for(let i in data) {
        const row = `<tr class="d-flex">
                        <td class="col-1">`+ (parseInt(i) + 1) +`</td>
                        <td class="col-3">&#8369; `+ parseFloat(data[i]['price']).toLocaleString() +`</td>
                        <td class="col-3">&#8369; `+ parseFloat(data[i]['capital']).toLocaleString() +`</td>
                        <td class="col-5">`+ data[i]['createdAt'] +`</td>
                    </tr>`
        $('#product-history-body').append(row)
    }
}

function populateDiscountHistoryModal(data) {
    $('#discount-history-body').empty()
    for(let i in data) {
        const row = `<tr class="d-flex">
                        <td class="col-1">`+ (parseInt(i) + 1) +`</td>
                        <td class="col-5">`+ data[i]['quantity'] +`</td>
                        <td class="col-6">`+ data[i]['discount'] +`</td>
                    </tr>`
        $('#discount-history-body').append(row)
    }
}

$('#product-history-modal').on('hidden.bs.modal',()=> {
    $('#product-history-body').empty()
    $('#product-history-id').text('')
    $('#product-history-name').text('')
})

$('#inventory-product-add-history').on('hidden.bs.modal',()=> {
    $('#database-product-add-id').removeClass('border-success')
    $('#database-product-add-id').addClass('border-danger')
    $('#database-product-add-id').val('')
    $('#database-product-add-name').val('')
    $('#database-product-add-price').val('')
    $('#database-product-add-capital').val('')
    $('#database-product-add-btn').prop('disabled',true)
})

/**
 * Set Product ADD : [ID] checker
 */
$('#database-product-add-id').on('keyup',()=> {
    const id = $('#database-product-add-id').val()
    ajaxDefault('/api/product/is-product-exist',id)
        .then((response)=> {
            if(id === '' || response) {
                $('#database-product-add-id').removeClass('border-success')
                $('#database-product-add-id').addClass('border-danger')
                $('#database-product-add-btn').prop('disabled',true)
            } else {
                $('#database-product-add-id').addClass('border-success')
                $('#database-product-add-id').removeClass('border-danger')
                $('#database-product-add-btn').prop('disabled',false)
            }
        })
})

/**
 * Set Product ADD button
 */
$('#database-product-add-btn').on('click',()=> {
    const id = $('#database-product-add-id').val()
    const name = $('#database-product-add-name').val()
    const price = $('#database-product-add-price').val()
    const capital = $('#database-product-add-capital').val()
    const product = makeProductEntity(id,name,price,capital)
    ajaxPostStringify('/api/product/add-product',product)
        .then(()=> {
            ipcRenderer.send('showMessage','Add Product', id + ' is successfully saved.')
            $('#inventory-product-add-history').modal('hide')
        }).fail(()=> {
            ipcRenderer.send('showError','Add Product', id + ' is not successfully saved.\nCheck server connection before trying again!')
        })
})

function makeProductEntity(id,name,price,capital) {
    return {
            'id': id,
            'name': name,
            'price': price,
            'quantityPerPieces': 0,
            'piecesPerBox': 0,
            'capital': capital,
            'isActive': 1
        }
}