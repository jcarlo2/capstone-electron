import {add, ajaxPostStringify, ajaxUrl, ajaxUrlPost} from "../../../function.js";
import {ipcRenderer, log_populate} from "../../../variable.js";

export function startLog() {
    populateLogTable()
    setArchiveAll()
    hideElement()
}

function hideElement() {
    ipcRenderer.removeAllListeners('getRoleSettingUser')
    ipcRenderer.send('getRoleSettingUser')
    ipcRenderer.on('getRoleSettingUser',(e,role)=> {
        if(role === 1) $('#log-archive-all').addClass('invisible')
    })
}

function populateLogTable() {
    log_populate.intervalId = setInterval(()=> {
        ajaxUrl('/api/log/get-all-log').then((data)=> {
            $('#log-main-body').empty()
            for(let i in data) {
                const color = data[i]['isDeletable'] === '1' ? 'bg-info bg-opacity-50' : 'bg-danger bg-opacity-50'
                const row = `<tr class="d-flex ${color}">
                        <th class="col-1">${add(i,1).toLocaleString()}</th>
                        <td class="col-2 text-start">${data[i]['user']}</td>
                        <td class="col-2 text-start">${data[i]['action']}</td>
                        <td class="col-5 text-start">${data[i]['description']}</td>
                        <td class="col-2 text-start">${data[i]['timestamp']}</td>
                      </tr>`
                $('#log-main-body').append(row)
            }
        })
    },1000)
}

export function saveLog(action,description) {
    const user = $('#main-user-name').text()
    ajaxPostStringify(
        '/api/log/save-log-record',
        {
            'no': '',
            'user': user,
            'action': action,
            'description': description,
            'timestamp': '',
            'isDeletable': '1'
        }
    )
}

function setArchiveAll() {
    const interval = setInterval(()=> {
        $('#log-archive-all').off('click')
        $('#log-archive-all').on('click',()=> {
            ipcRenderer.send(
                'default',
                'Archive',
                'Are you sure you want to archive all logs?\nLogs archived cannot be unarchive again but can be retrieve using server application.',
                ['Archive All','No']
            )
            ipcRenderer.removeAllListeners('default')
            ipcRenderer.on('default',(e,num)=> {
                if(num === 0) ajaxUrlPost('/api/log/archive-all')
                    .then(()=> ipcRenderer.send('showMessage','Archive','All logs are successfully archived.'))
            })
        })
        if($('#log-archive-all').length === 1) clearInterval(interval)
    },1000)
}