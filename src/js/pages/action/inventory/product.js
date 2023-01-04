import {i_product_archive, i_product_discount, ipcRenderer, t_add_populate} from "../../../variable.js";
import {
    add,
    ajaxDefaultArray,
    ajaxPostNonString,
    ajaxPostStringify,
    ajaxUrl, setProductNotification,
    setRowColor
} from "../../../function.js";
import {saveLog} from "../log/log.js";

export function startInventoryProduct() {
    setSearch()
    setDropDown()
    setAddDiscount()
    setClearButton()
    setProductHistoryModal()
    setAddButton()
    setUpdateButton()
    setDeactivateProductButton()
    setInactiveProductButtonToShowModal()
    setInactivateProductTable()
    hideElement()
}

function hideElement() {
    ipcRenderer.removeAllListeners('getRoleSettingUser')
    ipcRenderer.send('getRoleSettingUser')
    ipcRenderer.on('getRoleSettingUser',(e,role)=> {
        if(role === 1) {
            $('#product-left-add').addClass('d-none')
            $('#product-left-update').addClass('d-none')
            $('#product-left-archive').addClass('d-none')
            $('#product-discount-add').addClass('d-none')
            $('#inventory-product-archive').addClass('d-none')
        }
    })
}

function setInactiveProductButtonToShowModal() {
    const interval = setInterval(()=>{
        $('#inventory-product-archive').off('click')
        $('#inventory-product-archive').on('click',()=> {
            $('#product-archive-modal').modal('show')
        })
        if($('#inventory-product-archive').length === 1) clearInterval(interval)
    },1000)
}

function setInactivateProductTable() {
    i_product_archive.intervalId = setInterval(()=> {
        ajaxUrl('/api/product/product-archive-list')
            .then((response)=> {
                populateInactiveProductTable(response)
            })
    },1000)
}

function populateInactiveProductTable(data) {
    $('#product-archive-body').empty()
    for(let i in data) {
        const row = `<tr id="product-archive-${i}" class="d-flex">
                        <th class="col-1">${add(i,1).toLocaleString()}</th>
                        <th class="col-2 text-center">${data[i]['id']}</th>
                        <th class="col-3 text-center">${data[i]['name']}</th>
                        <th class="col-2 text-center">&#8369; ${data[i]['price'].toLocaleString()}</th>
                        <th class="col-2 text-center">&#8369; ${data[i]['capital'].toLocaleString()}</th>
                        <th class="col-2 text-center">${data[i]['quantityPerPieces'].toLocaleString()}</th>
                    </tr>`
        $('#product-archive-body').append(row)
        setClickToActivateProduct($('#product-archive-'+i),data[i])
    }
}

function setClickToActivateProduct(row,data) {
    row.off('click')
    row.on('click',()=> {
        const id = data['id']
        ipcRenderer.send('buttonArray','Activate Product', `Activate product: ${id}.\nRetain or start with zero stock?`,['Retain','Zero','Cancel'],2)
        ipcRenderer.removeAllListeners('buttonArray')
        ipcRenderer.on('buttonArray',(e,num)=> {
            if(num === 0) {
                saveLog('Product Activate', `Changing product ${id} status to active  with original stock`)
                ajaxPostNonString('/api/product/activate-product',{'id':data['id'],'isZero':false})
            } else if(num === 1) {
                saveLog('Product Activate', `Changing product ${id} status to active with zero stock`)
                ajaxPostNonString('/api/product/activate-product',{'id':data['id'],'isZero':true})
            }
        })
    })
}

function setDeactivateProductButton() {
    const interval = setInterval(()=> {
        $('#product-left-archive').off('click')
        $('#product-left-archive').on('click',()=> {
            const id = $('#inventory-product-update').val()
            const name = $('#inventory-product-name').val()
            if(id !== '') {
                ajaxDefaultArray('/api/product/product-archive',{'id':id})
                    .then(()=> {
                        ipcRenderer.send('default','Archive Product',`${id} : ${name}`,['Archive','Cancel'])
                        ipcRenderer.removeAllListeners('default')
                        ipcRenderer.on('default',(e,num)=> {
                            if(num === 0) {
                                saveLog('Product Archive', `Archived product = ID: ${id} / Name: ${name}`)
                                ipcRenderer.send('showMessage','Archive Product', `${id} is successfully archived.`)
                                clear()
                            }
                        })
                    }).catch(()=> {
                        ipcRenderer.send('showError','Archive Product', `Failed to archive ${id}.\nCheck server connection and try again!`)
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
            ipcRenderer.send('default','Product Update',`${id} : ${name}`,['Update','Cancel'])
            ipcRenderer.removeAllListeners('default')
            ipcRenderer.on('default',(e,num)=> {
                if(num === 0) {
                    const product = makeProductEntity(id,name,price,capital)
                    ajaxPostStringify('/api/product/update-product',product)
                        .then(()=> {
                            saveLog('Product Update',
                                `Updating product = ID: ${id} / Name: ${name} / Price: \u20B1 ${price} / Capital: ${capital}`)
                            ipcRenderer.send('showMessage','Update Product',`${id }successfully updated.`)
                            clear()
                        }).fail(()=> {
                            ipcRenderer.send('showError','Update Product',`Error updating product ${id}`)
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
        ajaxDefaultArray('/api/product/find-all-archived-discount-id',{'id':id}),
        ajaxDefaultArray('/api/product/get-product-history',{'id':id})
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
           $('#inventory-discount-add-update').addClass('d-none')
           $('#inventory-discount-add-quantity').removeClass('border-dark')
           $('#inventory-discount-add-quantity').removeClass('border-2')
           $('#inventory-discount-add-quantity').addClass('border-danger')
           $('#inventory-discount-add-quantity').addClass('border-4')
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
        const id = $('#inventory-product-update').val()
        const discount = $('#inventory-discount-add-percent').val()
        let quantity = $('#inventory-discount-add-quantity').val()
        if((discount === '' || discount === 0) && (quantity === '' || quantity === 0)) ipcRenderer.send('showError','Add Discount','Invalid: check discount percentage')
        else ajaxPostNonString('/api/product/add-product-discount',{'quantity':quantity,'discount':discount,'id':id})
            .then(()=> {
                saveLog('Product Discount Add', `Added new discount to a product = ID: ${id} / Quantity: ${quantity} / Discount: ${discount} %`)
                ipcRenderer.send('showMessage','Add Product Discount', `${id}: successfully added new discount.`)
                $('#inventory-history-discount-list').modal('hide')
            })
    })
}

$('#inventory-discount-add-quantity').on('keyup',()=> {
    const id = $('#inventory-product-update').val()
    let quantity = $('#inventory-discount-add-quantity').val()
    quantity = quantity === '' ? 0 : parseInt(quantity)
    ajaxDefaultArray('/api/product/check-discount-quantity-exist',{'id':id,'quantity':quantity})
        .then((response)=> {
            if(quantity === 0 || response) {
                $('#inventory-discount-add-quantity').removeClass('border-success')
                $('#inventory-discount-add-quantity').addClass('border-danger')
                $('#inventory-discount-add-save').prop('disabled',true)
            } else {
                $('#inventory-discount-add-quantity').addClass('border-success')
                $('#inventory-discount-add-quantity').removeClass('border-danger')
                $('#inventory-discount-add-save').prop('disabled',false)
            }
        })
})

$('#inventory-history-discount-list').on('bs.hidden.modal',()=> {
    $('#inventory-discount-add-quantity').removeClass('border-success')
    $('#inventory-discount-add-quantity').addClass('border-danger')
    $('#inventory-discount-add-save').prop('disabled',true)
})

function clear() {
    $('#inventory-product-update').val('')
    $('#inventory-product-name').val('')
    $('#inventory-product-price').val('')
    $('#inventory-product-capital').val('')
    clearInterval(i_product_discount.intervalId)
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
    t_add_populate.intervalId = setInterval(() => {
        const search = $('#inventory-product-search').val()
        const filter = $('#inventory-product-filter').text()
        let ajax = undefined
        if (search === '') ajax = ajaxDefaultArray('/api/product/all-merchandise',{'filter': filter})
        else if (search !== undefined) ajax = ajaxDefaultArray('/api/product/search-merchandise',{'search': search,'filter':filter})
        if(ajax !== undefined) ajax.then((response)=> populateProductList(response))
    }, 1000)
}

function populateProductList(data) {
    setProductNotification($('#notification'),data)
    const list = $('#inventory-product-product')
    list.empty()
    for(let i in data) {
        const id = data[i]['id']
        let quantity = parseInt(data[i]['quantityPerPieces'])
        const row = `<tr id="inventory-product-table-${id}" class="inventory-product-item d-flex">
                        <th class="col-1" scope="row">${add(i,1).toLocaleString()}</th>
                        <td class="col-2 text-start">${id}</td>
                        <td class="col-5 text-start">${data[i]['name']}</td>
                        <td class="col-2 text-start">&#8369; ${data[i]['price']}</td>
                        <td class="col-2 text-start">${quantity.toLocaleString()}</td>
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
        clearInterval(i_product_discount.intervalId)
        i_product_discount.intervalId = setInterval(()=> {
            if(id !== '' || id !== undefined) {
                ajaxDefaultArray('/api/product/find-all-valid-discount',{'id':id})
                    .then((response)=> populateDiscount(response))
            }
        },1000)
    })
}

function populateDiscount(data) {
    $('#inventory-product-discount').empty()
    for(let i in data) {
        const row = `<tr id="inventory-discount-row-${data[i]['quantity']}" class="d-flex">
                        <td class="col-1 ">${add(i,1).toLocaleString()}</td>
                        <td class="col-6 text-center">${data[i]['quantity'].toLocaleString()}</td>
                        <td class="col-5 text-center" >${data[i]['discount']} %</td>
                    </tr>`
        $('#inventory-product-discount').append(row)
        setClickDiscount($('#inventory-discount-row-'+data[i]['quantity']), data[i])
    }
}

function setClickDiscount(row,data) {
    row.off('click')
    row.on('click',()=> {
        const name = $('#inventory-product-name').val()
        const id = data['id']
        const quantity = data['quantity']
        const discount = data['discount']
        $('#inventory-discount-add-quantity').removeClass('border-4')
        $('#inventory-discount-add-quantity').addClass('border-dark')
        $('#inventory-discount-add-quantity').addClass('border-2')
        $('#inventory-discount-add-save').addClass('d-none')
        $('#inventory-discount-add-archive').removeClass('d-none')
        $('#inventory-discount-add-update').removeClass('d-none')
        $('#inventory-discount-product-id').text(id)
        $('#inventory-discount-product-name').text(name)
        $('#inventory-discount-add-quantity').val(quantity)
        $('#inventory-discount-add-percent').val(discount)
        setProductDiscountArchive(id,discount,quantity)
        setProductDiscountUpdate(id,discount,quantity)
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

function setProductDiscountUpdate(id,discount,quantity) {
    $('#inventory-discount-add-update').off('click')
    $('#inventory-discount-add-update').on('click',()=> {
        const quantityUpdate = $('#inventory-discount-add-quantity').val()
        const discountUpdate = $('#inventory-discount-add-percent').val()
        ipcRenderer.send('default',
            'Update Discount',`Do you want to update ${id} = Quantity: ${quantity} / Discount: ${discount} % to Quantity: ${quantityUpdate} / Discount: ${discountUpdate} %`,['Update','Cancel'])
        ipcRenderer.removeAllListeners('default')
        ipcRenderer.on('default',(e,num)=> {
            if(num === 0) {
                ajaxPostNonString('/api/product/update-product-discount',
                {'id':id,'quantity':quantity,'discount':discount,'quantityUpdate':quantityUpdate,'discountUpdate':discountUpdate})
                    .then((response)=> {
                        if(response) {
                            saveLog('Product Discount Update',
                                `Updated product discount ID: ${id} / Quantity ${quantity} / Discount: ${discount} % to Quantity: ${quantityUpdate} / Discount: ${discountUpdate} %`)
                            ipcRenderer.send('showMessage','Product Discount Update','Product discount update successfully.')
                            $('#inventory-history-discount-list').modal('hide')
                        } else ipcRenderer.send('showError','Product Discount Update',`Invalid: id: ${id} / Quantity: ${quantityUpdate} / Discount: ${discountUpdate} % \nCheck for input`)
                    })
            }
        })
    })
}

function setProductDiscountArchive(id,discount,quantity) {
    $('#inventory-discount-add-archive').off('click')
    $('#inventory-discount-add-archive').on('click',()=> {
        ipcRenderer.send('default','Archive Discount',`Do you want to archive ${id} : Quantity: ${quantity} / Discount: ${discount} %`,['Continue','Cancel'])
        ipcRenderer.removeAllListeners('default')
        ipcRenderer.on('default',(e,num)=> {
            if(num === 0) {
                ajaxPostNonString('/api/product/archive-product-discount',{'id':id,'quantity':quantity})
                    .then(()=> {
                        saveLog('Product Discount Archive', `Archived product discount = ID: ${id} / Quantity: ${quantity} / Discount: ${discount} %`)
                        ipcRenderer.send('showMessage',
                            'Archive Discount', `${id} = Quantity: ${quantity} / Discount:${discount} % is successfully archived.`)
                        clear()
                        $('#inventory-history-discount-list').modal('hide')
                    })
            }
        })
    })
}

function populateProductHistoryModal(data) {
    $('#product-history-body').empty()
    for(let i in data) {
        const row = `<tr class="d-flex">
                        <td class="col-1">${add(i,1)}</td>
                        <td class="col-4">${data[i]['name']}</td>
                        <td class="col-2">&#8369; ${parseFloat(data[i]['price']).toLocaleString()}</td>
                        <td class="col-2">&#8369; ${parseFloat(data[i]['capital']).toLocaleString()}</td>
                        <td class="col-3">${data[i]['createdAt']}</td>
                    </tr>`
        $('#product-history-body').append(row)
    }
}

function populateDiscountHistoryModal(data) {
    $('#discount-history-body').empty()
    for(let i in data) {
        const row = `<tr id="discount-${i}" class="d-flex">
                        <td class="col-1">${add(i,1)}</td>
                        <td class="col-3">${data[i]['quantity']}</td>
                        <td class="col-3">${data[i]['discount']}</td>
                        <td class="col-5">${data[i]['timestamp']}</td>
                    </tr>`
        $('#discount-history-body').append(row)
        setClickToActivateDiscount(data[i],$('#discount-'+i))
    }
}

function setClickToActivateDiscount(data,row) {
    row.off('click')
    row.on('click',()=> {
        const id = $('#inventory-product-update').val()
        const quantity = data['quantity']
        const discount = data['discount']
        ajaxDefaultArray('/api/product/is-exist-discount',{'id': id, 'quantity': quantity}).then((response)=> {
            const message = response ? `Quantity: ${quantity} is active. Override?` : `Add to product discount: Quantity: ${quantity} / Discount: ${discount} %`
            const button = response ? ['Override','Cancel'] : ['Continue','Cancel']
            ipcRenderer.send('default','Product discount',message,button)
            ipcRenderer.removeAllListeners('default')
            ipcRenderer.on('default',(e,num)=> {
                if(num === 0 && response) ajaxPostNonString('/api/product/discount-activate',{'id': id, 'quantity': quantity, 'discount': discount, 'isOverride': true})
                else ajaxPostNonString('/api/product/discount-activate',{'id': id, 'quantity': quantity, 'discount': discount, 'isOverride': false})
                if(num === 0) {
                    saveLog('Product Discount Activate', `Added product discount ${id} = Quantity: ${quantity} / Discount: ${discount} %`)
                    ipcRenderer.send('showMessage','Product Discount',`${id} = Quantity: ${quantity} / Discount: ${discount} % is successfully added.`)
                }
            })
        })
    })
}

$('#product-history-modal').on('hidden.bs.modal',()=> {
    $('#product-history-body').empty()
    $('#product-history-id').text('')
    $('#product-history-name').text('')
})

$('#inventory-product-add-history').on('hidden.bs.modal',()=> {
    $('#database-product-add-id').removeClass('border-success')
    $('#database-product-add-id').removeClass('border-danger')
    $('#database-product-add-id').removeClass('border-4')
    $('#database-product-add-id').addClass('border-dark')
    $('#database-product-add-id').addClass('border-2')
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
    ajaxDefaultArray('/api/product/is-product-exist',{'id':id})
        .then((response)=> {
            if(id === '' || response) {
                $('#database-product-add-id').removeClass('border-success')
                $('#database-product-add-id').removeClass('border-dark')
                $('#database-product-add-id').removeClass('border-2')
                $('#database-product-add-id').addClass('border-danger')
                $('#database-product-add-id').addClass('border-4')
                $('#database-product-add-btn').prop('disabled',true)
            } else {
                $('#database-product-add-id').addClass('border-success')
                $('#database-product-add-id').addClass('border-4')
                $('#database-product-add-id').removeClass('border-danger')
                $('#database-product-add-id').removeClass('border-dark')
                $('#database-product-add-id').removeClass('border-2')
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
            saveLog('Product Add',
                `Added new product = ID: ${id} / Name: ${name} / Price: \u20B1 ${price} / Capital: ${capital}`)
            ipcRenderer.send('showMessage','Add Product', `${id} is successfully saved.`)
            $('#inventory-product-add-history').modal('hide')
        }).fail(()=> {
            ipcRenderer.send('showError','Add Product', `${id} is not successfully saved.\nCheck server connection before trying again!`)
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
