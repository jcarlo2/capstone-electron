import {i_history_option, i_history_populate, ip, ipcRenderer} from "../../../variable.js";

export function startHistory() {
    setOption()
    setArchive()
    i_history_populate.setIntervalId(setInterval(()=> {
        const option = $('#inventory-history-option').text()
        const search = $('#inventory-history-left-search').val()
        const start = $('#inventory-history-start').val()
        const end = $('#inventory-history-end').val()
        if(search !== '') getAllReportBySearch(option,search)
        else if(start !== '' && end === '') getAllReportByStart(option,start)
        else if(start === '' && end !== '') getAllReportByEnd(option,end)
        else if(start !== '' && end !== '') getAllReportByDate(option,start,end)
        else getAllReport(option)
    },1000))
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
    if(id.charAt(0) === 'I') archiveDeliveryReport(id)
    else if(link === '') archiveNullReport(id)
    else archiveNullReportWithLink(link,id)
}

function archiveDeliveryReport(id) {

}

function archiveNullReport(id) {

}

function archiveNullReportWithLink(link,id) {

}

function getAllReport(option) {
    if(option === 'Null Archived') getAllNullReport('0')
    else if(option === 'Delivery Report') getAllDeliveryReport('1')
    else if(option === 'Delivery Archived') getAllDeliveryReport('0')
    else getAllNullReport('1')
}

function getAllReportBySearch(option,search) {
    if(option === 'Null Archived') getAllNullReportBySearch('0',search)
    else if(option === 'Delivery Report') getAllDeliveryReportBySearch('1',search)
    else if(option === 'Delivery Archived') getAllDeliveryReportBySearch('0',search)
    else getAllNullReportBySearch('1',search)
}

function getAllReportByDate(option,start,end) {
    if(option === 'Null Archived') getAllNullReportByDate('0',start,end)
    else if(option === 'Delivery Report') getAllDeliveryReportByDate('1',start,end)
    else if(option === 'Delivery Archived') getAllDeliveryReportByDate('0',start,end)
    else getAllNullReportByDate('1',start,end)
}

function getAllReportByEnd(option,end) {
    if(option === 'Null Archived') getAllNullReportByEnd('0',end)
    else if(option === 'Delivery Report') getAllDeliveryReportByEnd('1',end)
    else if(option === 'Delivery Archived') getAllDeliveryReportByEnd('0',end)
    else getAllNullReportByEnd('1',end)
}

function getAllReportByStart(option,start) {
    if(option === 'Null Archived') getAllNullReportByStart('0',start)
    else if(option === 'Delivery Report') getAllDeliveryReportByStart('1',start)
    else if(option === 'Delivery Archived') getAllDeliveryReportByStart('0',start)
    else getAllNullReportByStart('1',start)
}

function getAllDeliveryReportBySearch(isValid,search) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-delivery-report-search',
        data: {
            'isValid': isValid,
            'search': search,
        },
        success: (response)=> {
            
            populateLeftList(response)
        }
    })
}

function getAllNullReportBySearch(isValid,search) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-null-report-search',
        data: {
            'isValid': isValid,
            'search': search,
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function getAllDeliveryReportByStart(isValid,start) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-delivery-report-start',
        data: {
            'isValid': isValid,
            'start': start,
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function getAllNullReportByStart(isValid,start) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-null-report-start',
        data: {
            'isValid': isValid,
            'start': start,
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function getAllDeliveryReportByEnd(isValid,end) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-delivery-report-end',
        data: {
            'isValid': isValid,
            'end': end,
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function getAllNullReportByEnd(isValid,end) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-null-report-end',
        data: {
            'isValid': isValid,
            'end': end,
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function getAllNullReportByDate(isValid,start,end) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-null-report-date',
        data: {
            'isValid': isValid,
            'start': start,
            'end': end,
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function getAllDeliveryReportByDate(isValid,start,end) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-delivery-report-date',
        data: {
            'isValid': isValid,
            'start': start,
            'end': end,
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function getAllNullReport(isValid) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-null-report',
        data: {
            'isValid': isValid
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function getAllDeliveryReport(isValid) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-delivery-report',
        data: {
            'isValid': isValid
        },
        success: (response)=> {
            populateLeftList(response)
        }
    })
}

function populateLeftList(data) {
    $('#inventory-history-left-body').empty()
    for(let i=0;i<data.length;i++) {
        const id = data[i]['id']
        const row = `<tr id="inventory-history-`+ id +`" class="d-flex">
                        <th class="col-1">`+ (i+1) +`</th>
                        <td class="col-7">`+ id +`</td>
                        <td class="col-4">`+ data[i]['timestamp'] +`</td>
                    </tr>`
        $('#inventory-history-left-body').append(row)
        setDoubleClick(data[i],$('#inventory-history-'+id))
    }
}

function setOption() {
    i_history_option.setIntervalId(setInterval(()=> {
        $('#inventory-history-option-1').off('click')
        $('#inventory-history-option-1').on('click',()=> {
            $('#inventory-history-option').text('Null Report')
            $('#inventory-history-delete').removeClass('invisible')
        })

        $('#inventory-history-option-2').off('click')
        $('#inventory-history-option-2').on('click',()=> {
            $('#inventory-history-option').text('Null Archived')
            $('#inventory-history-delete').addClass('invisible')
        })

        $('#inventory-history-option-3').off('click')
        $('#inventory-history-option-3').on('click',()=> {
            $('#inventory-history-option').text('Delivery Report')
            $('#inventory-history-delete').addClass('invisible')
        })

        $('#inventory-history-option-4').off('click')
        $('#inventory-history-option-4').on('click',()=> {
            $('#inventory-history-option').text('Delivery Archived')
            $('#inventory-history-delete').addClass('invisible')
        })

        if($('#inventory-history-option-1').length === 1
            && $('#inventory-history-option-2').length === 1
            && $('#inventory-history-option-3').length === 1
            && $('#inventory-history-option-4').length === 1) {
            clearInterval(i_history_option.getIntervalId())
        }
    }))
}

function setDoubleClick(data,row) {
    row.on('dblclick',()=> {
        $('#inventory-history-hidden').removeClass()
        $('#inventory-history-hidden').addClass('d-none')
        $('#inventory-history-user').val(data['user'])
        $('#inventory-history-id').val(data['id'])
        $('#inventory-history-date').val(data['timestamp'])
        $('#inventory-history-total').val('\u20B1 ' + parseFloat(data['total']).toLocaleString())
        if(data['link'] !== undefined || data['link'] !== '') {
            $('#inventory-history-hidden').addClass(data['link'])
        }
        if(data['id'].charAt(0) === 'I') getDeliveryItems(data)
        else getNullItems(data)
    })
}

function getNullItems(data) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-null-item',
        data: {
            'id': data['id']
        },
        success: (response)=> {
            populateTable(response)
        }
    })
}

function getDeliveryItems(data) {
    $.ajax({
        url: ip.url + '/api/inventory/get-all-delivery-item',
        data: {
            'id': data['id']
        },
        success: (response)=> {
            populateTable(response)
        }
    })
}

function populateTable(data) {
    $('#inventory-history-item-body').empty()
    for(let i=0;i<data.length;i++) {
        const price = data[i]['price'] === undefined ? '---' : parseFloat(data[i]['price']).toLocaleString()
        const row = `<tr class="d-flex">
                        <th class="col-1">`+ (i+1) +`</th>
                        <td class="col-5">`+ data[i]['name'] +`</td>
                        <td class="col-2">&#8369; `+ price +`</td>
                        <td class="col-2">`+ data[i]['quantity'] +`</td>
                        <td class="col-2">&#8369; `+ parseFloat(data[i]['totalAmount']).toLocaleString() +`</td>
                    </tr>`
        $('#inventory-history-item-body').append(row)
    }
}
