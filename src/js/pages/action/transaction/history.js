import {ip, ipcRenderer, t_history_populate} from "../../../variable.js";
import {ajaxDefaultArray, ajaxUrl, divide, multiply, subtract} from "../../../function.js";

export function startHistory() {
    setOption()
    // FIX * ADD "ALL" OPTION
    t_history_populate.intervalId = setInterval(()=> {
        const search = $('#transaction-history-left-search').val()
        const start = $('#transaction-history-start').val()
        const end = $('#transaction-history-end').val()
        const option = $('#transaction-history-option').text()
        if(search !== '') {
            if(option === 'Report') ajaxDefaultArray('/api/transaction/search-valid-transaction',{'search': search}).then((response)=> populate(response))
            else if(option === 'Archived') ajaxDefaultArray('/api/transaction/search-archived-transaction',{'search': search}).then((response)=> populate(response))
            else ajaxDefaultArray('/api/transaction/search-all-transaction',{'search': search}).then((response)=> populate(response))
        }else if(start !== '' && end === '') {
            if(option === 'Report') ajaxDefaultArray('/api/transaction/search-start',{'start': start}).then((response)=> populate(response))
            else if(option === 'Archived')  ajaxDefaultArray('/api/transaction/search-archived-start',{'start': start}).then((response)=> populate(response))
            else ajaxDefaultArray('/api/transaction/search-all-start',{'start': start}).then((response)=> populate(response))
        } else if(start === '' && end !== '') {
            if(option === 'Report') ajaxDefaultArray('/api/transaction/search-end',{'end': end}).then((response)=> populate(response))
            else if(option === 'Archived') ajaxDefaultArray('/api/transaction/search-archived-end',{'end': end}).then((response)=> populate(response))
            else ajaxDefaultArray('/api/transaction/search-all-end',{'end': end}).then((response)=> populate(response))
        } else if(start !== '' && end !== '') {
            if(option === 'Report') ajaxDefaultArray('/api/transaction/search-date',{'start':start,'end':end}).then((response)=> populate(response))
            else if(option === 'Archived') ajaxDefaultArray('/api/transaction/search-archived-date',{'start':start,'end':end}).then((response)=> populate(response))
            else ajaxDefaultArray('/api/transaction/search-all-date',{'start':start,'end':end}).then((response)=> populate(response))
        } else if(search !== undefined) {
            if(option === 'Report') ajaxUrl('/api/transaction/get-all-valid-report').then((response)=> populate(response))
            else if(option === 'All') ajaxUrl('/api/transaction/get-all-report').then((response)=> populate(response))
            else ajaxUrl('/api/transaction/get-all-archived-report').then((response)=> populate(response))
        }
    },500)
}

function populate(data) {
    const body = $('#transaction-history-left-body')
    if(data.length === 0) body.empty()
    body.empty()
    for(let i=0;i<data.length;i++) {
        body.addClass(data[i]['id'])
        const row = `<tr class="d-flex" id="history-`+ data[i]['id'] +`-`+ i +`">
                        <th class="col-1" scope="row">`+ (i+1) +`</th>
                        <td class="col-7 text-start">`+ data[i]['id'] +`</td>
                        <td class="col-4 text-start">`+ data[i]['timestamp'] +`</td>
                    </tr>`
        body.append(row)
        setClick(data[i]['id'],data[i]['timestamp'],data[i]['totalAmount'],data[i]['user'],i)
    }
}

function setClick(id,timestamp,total,user,i) {
    $('#history-'+id+'-'+i).on('click',()=> {
        $('#transaction-history-user').val(user)
        $('#transaction-history-id').val(id)
        $('#transaction-history-date').val(timestamp)
        $('#transaction-history-total').val('\u20B1 ' + parseFloat(total).toLocaleString())
        ajaxDefaultArray('/api/transaction/find-all-item',{'id':id,'timestamp':timestamp}).then((response)=> populateTable(response))
    })
}

function populateTable(data) {
    $('#transaction-history-item-body').empty()
    for(let i=0;i<data.length;i++) {
        const row = `<tr class="d-flex" id="transaction-history-info-`+ data[i]['productId'] +`">
                        <th class="col-1" scope="col">` + (i + 1) + `</th>
                        <td class="col-5 text-start">` + data[i]['name'] + `</td>
                        <td class="col-2 text-start">\u20b1 ` + parseFloat(data[i]['price']).toLocaleString() + `</td>
                        <td class="col-2 text-start">` + data[i]['sold'] + `</td>
                        <td class="col-2 text-start">\u20b1 ` + data[i]['totalAmount'].toLocaleString() + `</td>
                    </tr>`
        $('#transaction-history-item-body').append(row)
        setDoubleClickMoreInfo($('#transaction-history-info-'+data[i]['productId']),data[i])
    }
}

function setDoubleClickMoreInfo(row,data) {
    row.on('click',()=> {
        const totalPrice = multiply(data['price'],data['sold']).toLocaleString()
        const totalAmount = subtract(totalPrice,multiply(totalPrice,divide(data['discountPercentage'],100)))
        const totalCapital = multiply(data['capital'],data['sold']).toLocaleString()
        $('#transaction-history-info-id').text(data['productId'])
        $('#transaction-history-info-name').text(data['name'])
        $('#transaction-history-info-capital').text('Capital: \u20B1 ' + parseFloat(data['capital']).toLocaleString())

        $('#transaction-history-info-price').val('\u20B1 ' + data['price'])
        $('#transaction-history-info-price-quantity').val('\u20B1 ' + data['sold'])
        $('#transaction-history-info-price-total').val('\u20B1 ' + totalPrice)

        $('#transaction-history-info-amount-price').val('\u20B1 ' + totalPrice)
        $('#transaction-history-info-amount-discount').val(data['discountPercentage'] + ' %')
        $('#transaction-history-info-amount-total').val('\u20B1 ' + totalAmount)

        $('#transaction-history-info-profit-amount').val('\u20B1 ' + totalAmount)
        $('#transaction-history-info-profit-capital').val('\u20B1 ' + totalCapital)
        $('#transaction-history-info-profit-total').val('\u20B1 ' + subtract(totalAmount,totalCapital).toLocaleString())

        $('#transaction-history-modal').modal('show')
    })
}

export function setDelete() {
    const interval = setInterval(()=> {
        $('#transaction-history-delete').off('click')
        $('#transaction-history-delete').on('click',()=> {
            const id = $('#transaction-history-id').val()
            if(id !== '') {
                ipcRenderer.send('return', id)
                ipcRenderer.removeAllListeners('returnResponse')
                ipcRenderer.on('returnResponse',(e, num)=> {
                    if(num === 0) {
                        archiveReport(id)
                        clear()
                    }
                    // else if(num === 1) {
                    //     archiveAllReport(id)
                    //     clear()
                    // }
                })
            }
        })
        if($('#transaction-history-delete').length === 1) clearInterval(interval)
    },1000)
}

function archiveReport(id) {
    $.ajax({
        url: ip.url + '/api/transaction/archive',
        type: 'POST',
        data:{'id': id},
        success: (response)=> {
            if(response) ipcRenderer.send('showMessage','Success', id + ' is archived')
            else ipcRenderer.send('showMessage','Error: ' + id, 'invalid stock count')
        }
    })
}

function archiveAllReport(id) {
    $.ajax({
        url: ip.url + '/api/transaction/archive-all',
        type: 'POST',
        contentType: 'application/json',
        data:{'id': id},
        success: ()=> {
            ipcRenderer.send('showMessage','Success', 'All report is archived')
        }
    })
}

function clear() {
    $('#transaction-history-item-body').empty()
    $('#transaction-history-id').val('')
    $('#transaction-history-date').val('')
    $('#transaction-history-total').val('')
    $('#transaction-history-user').val('')
}

function setOption() {
    const interval = setInterval(()=> {
        $('#transaction-history-option-1').off('click')
        $('#transaction-history-option-1').on('click',()=> {
            $('#transaction-history-option').text('Report')
            $('#transaction-history-delete').removeClass('invisible')
            clear()
        })

        $('#transaction-history-option-2').off('click')
        $('#transaction-history-option-2').on('click',()=> {
            $('#transaction-history-option').text('Archived')
            $('#transaction-history-delete').addClass('invisible')
            clear()
        })

        $('#transaction-history-option-3').off('click')
        $('#transaction-history-option-3').on('click',()=> {
            $('#transaction-history-option').text('All')
            $('#transaction-history-delete').addClass('invisible')
            clear()
        })

        if($('#transaction-history-option-1').length === 1
            && $('#transaction-history-option-2').length === 1
            && $('#transaction-history-option-3').length === 1) {
            clearInterval(interval)
        }
    })
}