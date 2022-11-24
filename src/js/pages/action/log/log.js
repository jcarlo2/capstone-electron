import {add, ajaxPostStringify, ajaxUrl} from "../../../function.js";
import {log_populate} from "../../../variable.js";

export function startLog() {
    log_populate.intervalId = setInterval(()=> {
        ajaxUrl('/api/log/get-all-log').then((response)=> {
            $('#log-main-body').empty()
            for(let i in response) {
                const row = `<tr class="d-flex">
                        <th class="col-1">${add(i,1).toLocaleString()}</th>
                        <td class="col-2 text-start">${response[i]['user']}</td>
                        <td class="col-2 text-start">${response[i]['action']}</td>
                        <td class="col-5 text-start">${response[i]['description']}</td>
                        <td class="col-2 text-start">${response[i]['timestamp']}</td>
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
            'no':'',
            'user':user,
            'action':action,
            'description':description,
            'timestamp':'',
        }
    )
}
