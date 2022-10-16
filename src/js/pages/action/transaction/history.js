import {ip, ipcRenderer, t_history_delete, t_history_option, t_history_populate} from "../../../variable.js";

export function startHistory() {
    setOption()
    t_history_populate.setIntervalId(setInterval(()=> {
        const search = $('#transaction-history-left-search').val()
        const start = $('#transaction-history-start').val()
        const end = $('#transaction-history-end').val()
        const option = $('#transaction-history-option').text()
        if(search !== '') {
            if(option === 'Report') getAllReportBySearch(search)
            else getAllArchivedReportBySearch(search)
        }else if(start !== '' && end === '') {
            if(option === 'Report') getAllReportByStart(start)
            else getAllArchivedReportByStart(start)
        } else if(start === '' && end !== '') {
            if(option === 'Report') getAllReportByEnd(end)
            else getAllArchivedReportByEnd(end)
        } else if(start !== '' && end !== '') {
            if(option === 'Report') getAllReportByDate(start,end)
            else getAllArchivedReportByDate(start,end)
        } else {
            if(option === 'Report') getAllReport()
            else getAllArchivedReport()
        }
    },500))
}

function getAllArchivedReport() {
    $.ajax({
        url: ip.url + '/api/transaction/get-all-archived-report',
        success: (response)=> {
            populate(response)
        }
    })
}

function getAllArchivedReportBySearch(search) {
    $.ajax({
        url: ip.url + '/api/transaction/search-archived-transaction',
        data: {'search': search},
        contentType: 'application/json',
        dataType:'json',
        success: function (response) {
            populate(response)
        }
    })
}

function getAllReportBySearch(search) {
    $.ajax({
        url: ip.url + '/api/transaction/search-transaction',
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
        url: ip.url + '/api/transaction/search-date',
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

function getAllArchivedReportByDate(start,end) {
    $.ajax({
        url: ip.url + '/api/transaction/search-archived-date',
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

function getAllArchivedReportByEnd(end) {
    $.ajax({
        url: ip.url + '/api/transaction/search-archived-end',
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

function getAllArchivedReportByStart(start) {
    $.ajax({
        url: ip.url + '/api/transaction/search-archived-start',
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
    const body = $('#transaction-history-left-body')
    if(data.length === 0) body.empty()
    body.empty()
    for(let i=0;i<data.length;i++) {
        body.addClass(data[i]['id'])
        const row = `<tr class="d-flex" id="history-`+ data[i]['id'] +`">
                        <th class="col-1" scope="row">`+ (i+1) +`</th>
                        <td class="col-7 text-start">`+ data[i]['id'] +`</td>
                        <td class="col-4">`+ data[i]['timestamp'] +`</td>
                    </tr>`
        body.append(row)
        setDoubleClick(data[i]['id'],data[i]['timestamp'],data[i]['totalAmount'],data[i]['user'])
    }
}

function setDoubleClick(id,timestamp,total,user) {
    $('#history-'+id).on('dblclick',()=> {
        $('#transaction-history-user').val(user)
        $('#transaction-history-id').val(id)
        $('#transaction-history-date').val(timestamp)
        $('#transaction-history-total').val('\u20B1 ' + parseFloat(total).toLocaleString())
        setTable(id)
    })
}

function setTable(id) {
    $.ajax({
        url: ip.url + '/api/transaction/find-all-item',
        type: 'GET',
        contentType: 'application/json',
        data:{'id': id},
        success: function (response) {
            populateTable(response)
        }
    })
}

function populateTable(data) {
    $('#transaction-history-item-body').empty()
    for(let i=0;i<data.length;i++) {
        const row = `<tr class="d-flex">
                        <th class="col-1" scope="col">` + (i + 1) + `</th>
                        <td class="col-5 text-start">` + data[i]['name'] + `</td>
                        <td class="col-2">\u20b1 ` + parseFloat(data[i]['price']).toLocaleString() + `</td>
                        <td class="col-2">` + data[i]['sold'] + `</td>
                        <td class="col-2">\u20b1 ` + data[i]['totalAmount'].toLocaleString() + `</td>
                    </tr>`
        $('#transaction-history-item-body').append(row)
    }
}

export function setDelete() {
    t_history_delete.setIntervalId(setInterval(()=> {
        $('#transaction-history-delete').off('click')
        $('#transaction-history-delete').on('click',()=> {
            const id = $('#transaction-history-id').val()
            if(id !== '') {
                ipcRenderer.send('return', id)
                ipcRenderer.removeAllListeners('returnResponse')
                ipcRenderer.on('returnResponse',(e, num)=> {
                    if(num === 0) {
                        deleteReport(id)
                        clear()
                    } else if(num === 1) {
                        deleteAllReport(id)
                        clear()
                    }
                })
            }
        })
        if($('#transaction-history-delete').length === 1) clearInterval(t_history_delete.getIntervalId())
    },1000))
}

function deleteReport(id) {
    $.ajax({
        url: ip.url + '/api/transaction/delete',
        type: 'POST',
        contentType: 'application/json',
        data:{'id': id},
        success: ()=> {
            ipcRenderer.send('showMessage','Success', id + ' is archived')
        }
    })
}

function deleteAllReport(id) {
    $.ajax({
        url: ip.url + '/api/transaction/delete-all',
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
}

function setOption() {
    t_history_option.setIntervalId(setInterval(()=> {
        $('#transaction-history-option-1').on('click',()=> {
            $('#transaction-history-option').text('Report')
            $('#transaction-history-delete').removeClass('invisible')
        })

        $('#transaction-history-option-2').on('click',()=> {
            $('#transaction-history-option').text('Archived')
            $('#transaction-history-delete').addClass('invisible')
        })

        if($('#transaction-history-option-1').length === 1
            && $('#transaction-history-option-2').length === 1) {
            clearInterval(t_history_option.getIntervalId())
        }
    }))
}