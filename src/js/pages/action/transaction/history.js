import {ipcRenderer, t_history_delete, t_history_populate} from "../../../variable.js";

export function startHistory() {
    t_history_populate.setIntervalId(setInterval(()=> {
        const search = $('#transaction-history-left-search').val()
        const start = $('#transaction-history-start').val()
        const end = $('#transaction-history-end').val()
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
    const body = $('#transaction-history-left-body')
    if(data.length === 0) body.empty()
    body.empty()
    for(let i=0;i<data.length;i++) {
        body.addClass(data[i]['id'])
        const row = `<tr id="history-`+ data[i]['id'] +`">
                        <th scope="row">`+ (i+1) +`</th>
                        <td>`+ data[i]['id'] +`</td>
                        <td>`+ data[i]['timestamp'] +`</td>
                    </tr>`
        body.append(row)
        setDoubleClick(data[i]['id'],data[i]['timestamp'],data[i]['totalAmount'])
    }
}

function setDoubleClick(id,timestamp,total) {
    $('#history-'+id).on('dblclick',()=> {
        $('#transaction-history-id').val(id)
        $('#transaction-history-date').val(timestamp)
        $('#transaction-history-total').val('\u20B1 ' + parseFloat(total).toLocaleString())
        setTable(id)
    })
}

function setTable(id) {
    $.ajax({
        url: 'http://localhost:8080/api/transaction/find-all-item',
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
        url: 'http://localhost:8080/api/transaction/delete',
        type: 'POST',
        contentType: 'application/json',
        data:{'id': id},
        success: ()=> {
            ipcRenderer.send('showMessage','Success', id + ' is deleted')
        }
    })
}

function deleteAllReport(id) {
    $.ajax({
        url: 'http://localhost:8080/api/transaction/delete-all',
        type: 'POST',
        contentType: 'application/json',
        data:{'id': id},
        success: ()=> {
            ipcRenderer.send('showMessage','Success', 'All report is deleted')
        }
    })
}

function clear() {
    $('#transaction-history-item-body').empty()
    $('#transaction-history-id').val('')
    $('#transaction-history-date').val('')
    $('#transaction-history-total').val('')
}


