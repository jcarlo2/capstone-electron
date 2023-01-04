import {i_history_populate, ipcRenderer} from "../../../variable.js";
import {ajaxDefaultArray, ajaxPostNonString, ajaxUrl, multiply} from "../../../function.js";
import {saveLog} from "../log/log.js";

export function startInventoryHistory() {
    setOption()
    setArchive()
    setSearch()
}

function setSearch() {
    i_history_populate.intervalId = setInterval(()=> {
        const option = $('#inventory-history-option').text()
        const search = $('#inventory-history-left-search').val()
        const start = $('#inventory-history-start').val()
        const end = $('#inventory-history-end').val()
        let ajax
        if(search !== '') ajax = getAllReportBySearch(option,search)
        else if(start !== '' && end === '') ajax = getAllReportByStart(option,start)
        else if(start === '' && end !== '') ajax = getAllReportByEnd(option,end)
        else if(start !== '' && end !== '') ajax = getAllReportByDate(option,start,end)
        else if(search !== undefined) ajax = getAllReport(option)
        if(ajax !== undefined) ajax.then((response)=> populateLeftList(response))
    },1000)
}

function setArchive() {
    const interval = setInterval(()=> {
        $('#inventory-history-archive').off('click')
        $('#inventory-history-archive').on('click',()=> {
            const id = $('#inventory-history-id').val()
            const link = $('#inventory-history-hidden').prop('class').split(' ')[1]
            let flag = true
            if(link === undefined) flag = false
            if(id !== '') {
                ipcRenderer.send('inventoryDelete',id,link,flag)
                ipcRenderer.removeAllListeners('inventoryDeleteResponse')
                ipcRenderer.on('inventoryDeleteResponse',(e,num)=> {
                    if(num === 0) archiveReport(link,id)
                })
            }
        })
    },1000)
    if($('#inventory-history-archive').length === 1) clearInterval(interval)
}

function archiveReport(link,id) {
    if(id.charAt(0) === 'I' && link === undefined) {
        saveLog('Inventory Archive', 'Archived Delivery Report: ' + id)
        archiveDefault('/api/inventory/archived-delivery',{'id':id})
    } else if(id.charAt(0) === 'N' && link === undefined) {
        saveLog('Inventory Archive', 'Archived Void Report: ' + id)
        archiveDefault('/api/inventory/archived-null-report',{'id':id})
    } else {
        saveLog('Inventory Archive', 'Archived Transaction with inventory report link: ' + link)
        archivePostNonString(link,id)
    }


}

// create error when not newest
function archiveDefault(url, id) {
    ajaxDefaultArray(url,id)
        .then(()=> {
            ipcRenderer.send('showMessage','Report archive', id['id'] + ' is successfully archived')
            clear()
        })
}

function archivePostNonString(link,id) {
    ajaxPostNonString('/api/transaction/archive',{'id': link})
        .then(()=> {
            ipcRenderer.send('showMessage','Report archive', id + ' is successfully archived')
            clear()
        })
}

function clear() {
    $('#inventory-history-item-body').empty()
    $('#inventory-history-id').val('')
    $('#inventory-history-user').val('')
    $('#inventory-history-date').val('')
    $('#inventory-history-total').val('')
    $('#inventory-history-hidden').removeClass()
    $('#inventory-history-hidden').addClass('d-none')
    $('#inventory-history-report-info').off('click')
}

function getAllReport(option) {
    if(option === 'Null Report') return ajaxUrl('/api/inventory/get-all-null-report')
    else if(option === 'Null Archived') return ajaxUrl('/api/inventory/get-all-archived-null-report')
    else if(option === 'Delivery Report') return ajaxUrl('/api/inventory/get-all-delivery-report')
    else if(option === 'Delivery Archived') return ajaxUrl('/api/inventory/get-all-archived-delivery-report')
    else return ajaxUrl('/api/inventory/get-all-null-and-delivery')
}

function getAllReportBySearch(option,search) {
    if(option === 'Null Report') return ajaxDefaultArray('/api/inventory/get-all-null-report-search',{'search':search})
    else if(option === 'Null Archived') return ajaxDefaultArray('/api/inventory/get-all-archived-null-report-search',{'search':search})
    else if(option === 'Delivery Report') return ajaxDefaultArray('/api/inventory/get-all-delivery-report-search',{'search':search})
    else if(option === 'Delivery Archived') return ajaxDefaultArray('/api/inventory/get-all-archived-delivery-report-search',{'search':search})
    else return ajaxDefaultArray('/api/inventory/get-all-null-and-delivery-search',{'search':search})
}

function getAllReportByDate(option,start,end) {
    if(option === 'Null Archived') return ajaxDefaultArray('/api/inventory/get-all-null-report-date',{'start':start,'end':end})
    else if(option === 'Null Report') return ajaxDefaultArray('/api/inventory/get-all-archived-null-report-date',{'start':start,'end':end})
    else if(option === 'Delivery Archived') return ajaxDefaultArray('/api/inventory/get-all-delivery-report-date',{'start':start,'end':end})
    else if(option === 'Delivery Report') return ajaxDefaultArray('/api/inventory/get-all-archived-delivery-report-date',{'start':start,'end':end})
    else return ajaxDefaultArray('/api/inventory/get-all-null-and-delivery-date',{'start':start,'end':end})
}

function getAllReportByEnd(option,end) {
    if(option === 'Null Report') return ajaxDefaultArray('/api/inventory/get-all-null-report-end',{'end':end})
    else if(option === 'Null Archived') return ajaxDefaultArray('/api/inventory/get-all-archived-null-report-end',{'end':end})
    else if(option === 'Delivery Report')  return ajaxDefaultArray('/api/inventory/get-all-delivery-report-end',{'end':end})
    else if(option === 'Delivery Archived')  return ajaxDefaultArray('/api/inventory/get-all-archived-delivery-report-end',{'end':end})
    else return ajaxDefaultArray('/api/inventory/get-all-null-and-delivery-end',{'end':end})
}

function getAllReportByStart(option,start) {
    if(option === 'Null Report') return ajaxDefaultArray('/api/inventory/get-all-null-report-start',{'start':start})
    else if(option === 'Null Archived') return ajaxDefaultArray('/api/inventory/get-all-archived-null-report-start',{'start':start})
    else if(option === 'Delivery Report') return ajaxDefaultArray('/api/inventory/get-all-delivery-report-start',{'start':start})
    else if(option === 'Delivery Archived') return ajaxDefaultArray('/api/inventory/get-archived-all-delivery-report-start',{'start':start})
    else return ajaxDefaultArray('/api/inventory/get-all-null-and-delivery-start',{'start':start})
}

function populateLeftList(data) {
    $('#inventory-history-left-body').empty()
    for(let i=0;i<data.length;i++) {
        const id = data[i]['id']
        const row = `<tr id="inventory-history-`+ id +`" class="d-flex">
                        <th class="col-1">`+ (i+1) +`</th>
                        <td class="col-7 text-start">`+ id +`</td>
                        <td class="col-4 text-start">`+ data[i]['timestamp'] +`</td>
                    </tr>`
        $('#inventory-history-left-body').append(row)
        setReportClick(data[i],$('#inventory-history-'+id))
    }
}

function setOption() {
    const interval = setInterval(()=> {
        $('#inventory-history-option-1').off('click')
        $('#inventory-history-option-1').on('click',()=> {
            clear()
            $('#inventory-history-option').text('Null Report')
            ipcRenderer.removeAllListeners('getRoleSettingUser')
            ipcRenderer.send('getRoleSettingUser')
            ipcRenderer.on('getRoleSettingUser',(e,role)=> {
                if(role === 1) $('#inventory-history-archive').addClass('invisible')
                else $('#inventory-history-archive').removeClass('invisible')
            })
        })

        $('#inventory-history-option-2').off('click')
        $('#inventory-history-option-2').on('click',()=> {
            clear()
            $('#inventory-history-option').text('Null Archived')
            $('#inventory-history-archive').addClass('invisible')
        })

        $('#inventory-history-option-3').off('click')
        $('#inventory-history-option-3').on('click',()=> {
            clear()
            $('#inventory-history-option').text('Delivery Report')
            ipcRenderer.removeAllListeners('getRoleSettingUser')
            ipcRenderer.send('getRoleSettingUser')
            ipcRenderer.on('getRoleSettingUser',(e,role)=> {
                if(role === 1) $('#inventory-history-archive').addClass('invisible')
                else $('#inventory-history-archive').removeClass('invisible')
            })
        })

        $('#inventory-history-option-4').off('click')
        $('#inventory-history-option-4').on('click',()=> {
            clear()
            $('#inventory-history-option').text('Delivery Archived')
            $('#inventory-history-archive').addClass('invisible')
        })

        $('#inventory-history-option-5').off('click')
        $('#inventory-history-option-5').on('click',()=> {
            clear()
            $('#inventory-history-option').text('All')
            $('#inventory-history-archive').addClass('invisible')
        })

        if($('#inventory-history-option-1').length === 1
            && $('#inventory-history-option-2').length === 1
            && $('#inventory-history-option-3').length === 1
            && $('#inventory-history-option-4').length === 1
            && $('#inventory-history-option-5').length === 1) {
            clearInterval(interval)
        }
    })
}

function setReportClick(data,row) {
    row.on('click',()=> {
        const total = parseFloat(data['total']).toLocaleString();
        $('#inventory-history-hidden').removeClass()
        $('#inventory-history-hidden').addClass('d-none')
        $('#inventory-history-user').val(data['user'])
        $('#inventory-history-id').val(data['id'])
        $('#inventory-history-date').val(data['timestamp'])
        $('#inventory-history-total').val('\u20B1 ' + total)
        setReportInfo(data,total)
        if(data['link'] !== undefined || data['link'] !== '') {
            $('#inventory-history-hidden').addClass(data['link'])
        }
        getItems(data)
    })
}

function getItems(data) {
    let ajax
    if(data['id'].charAt(0) === 'I') ajax = ajaxDefaultArray('/api/inventory/get-all-delivery-item',{'id': data['id'],'timestamp': data['timestamp']})
    else ajax =  ajaxDefaultArray('/api/inventory/get-all-null-item',{'id': data['id'],'timestamp': data['timestamp']})
    if(ajax !== undefined) ajax.then((response)=> populateTable(response,data['id']))
}

function setReportInfo(data,total) {
    $('#inventory-history-report-info').off('click')
    $('#inventory-history-report-info').on('click',()=> {
        ajaxDefaultArray('/api/inventory/check-if-id-is-archived',{'id':data['id'],'timestamp':data['timestamp']})
            .then((response)=> {
                $('#inventory-history-report-id').text( data['id'])
                $('#inventory-history-report-user').val(data['user'])
                $('#inventory-history-report-date').val(data['timestamp'])
                $('#inventory-history-report-total').val('\u20B1 ' + total)
                $('#inventory-history-report-reason').val(data['reason'])
                $('#inventory-history-report-link').val(data['link'] === '' ? 'None' : data['link'])
                $('#inventory-history-report-archived').val(response === false ? 'No' : 'Yes')
                $('#inventory-history-report').modal('show')
            })
    })
}

function populateTable(data,id) {
    setRightTable(data[0]['price'])
    const flag = data[0]['price'] === undefined;
    for(let i=0;i<data.length;i++) {
        const rowNull = `<tr id="inventory-history-row-`+ data[i]['id'] +`" class="d-flex">
                            <th class="col-1">`+ (i+1) +`</th>
                            <td class="text-start col-5">`+ data[i]['name'] +`</td>
                            <td class="text-start col-2">&#8369; `+ data[i]['capital'] +`</td>
                            <td class="text-start col-2">`+ data[i]['quantity'] +`</td>
                            <td class="text-start col-2">&#8369; `+ multiply(data[i]['capital'],data[i]['quantity']).toLocaleString() +`</td>
                        </tr>`

        const rowDelivery = `<tr id="inventory-history-row-`+ data[i]['id'] +`" class="d-flex">
                                <th class="col-1">`+ (i+1) +`</th>
                                <td class="text-start col-5">`+ data[i]['name'] +`</td>
                                <td class="text-start col-2">`+ data[i]['quantity'] +`</td>
                                <td class="text-start col-2">`+ parseFloat(data[i]['discountPercentage']).toLocaleString() +` %</td>
                                <td class="text-start col-2">&#8369; `+ parseFloat(data[i]['totalAmount']).toLocaleString() +`</td>
                            </tr>`
        $('#inventory-history-item-body').append(flag ? rowDelivery : rowNull)
        setProductClick($('#inventory-history-row-'+data[i]['id']), data[i],id)
    }
}

function setProductClick(row, data,id) {
    row.off('click')
    row.on('click',()=> {
        const totalAmount = parseFloat(data['totalAmount']).toLocaleString()
        const productId = data['id'] === undefined ? data['productId'] : data['id']
        $('#inventory-history-info-name').text(data['name'])
        $('#inventory-history-info-id').text('ID: ' + productId)
        $('#inventory-history-info-reason').text('Reason: ' + data['reason'])
        if(id.charAt(0) === 'I') setDeliveryProductRow(parseFloat(data['totalPrice']).toLocaleString(), data['discountPercentage'],totalAmount)
        else setNullProductRow(parseFloat(data['price']).toLocaleString(),parseInt(data['quantity']),totalAmount)
        $('#inventory-history-product-info').modal('show')
    })
}

function setDeliveryProductRow(totalPrice,discount,totalAmount) {
    $('#inventory-history-product-delivery').removeClass('d-none')
    $('#inventory-history-product-null').addClass('d-none')
    $('#inventory-history-info-cost-amount').val('\u20B1 ' + totalPrice)
    $('#inventory-history-info-cost-discount').val(discount + ' %')
    $('#inventory-history-info-cost-total').val('\u20B1 ' + totalAmount)
    $('#inventory-history-info-reason').addClass('d-none')
}

function setNullProductRow(totalPrice,quantity,totalAmount) {
    $('#inventory-history-product-delivery').addClass('d-none')
    $('#inventory-history-product-null').removeClass('d-none')
    $('#inventory-history-info-amount').val('\u20B1 ' + totalPrice)
    $('#inventory-history-info-amount-quantity').val(quantity)
    $('#inventory-history-info-amount-total').val('\u20B1 ' + totalAmount)
    $('#inventory-history-info-reason').removeClass('d-none')
}

function setRightTable(price) {
    $('#inventory-history-item-body').empty()
    if(price === undefined) {
        $('#inventory-history-table-discount').removeClass('d-none')
        $('#inventory-history-table-price').addClass('d-none')
    }else {
        $('#inventory-history-table-discount').addClass('d-none')
        $('#inventory-history-table-price').removeClass('d-none')
    }
}
