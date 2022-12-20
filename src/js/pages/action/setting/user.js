import {ipcRenderer, user_list} from "../../../variable.js";
import {add, ajaxPostNonString, ajaxPostStringify, ajaxUrl, capitalizeWords} from "../../../function.js";

export function startUser() {
    setVisibilityOfCreateAccount()
    setVisibilityOfChangePassword()
    setVisibilityOfDeleteAccount()
    setVisibilityOfUserList()
    populateUserList()
    setCreateAccount()
    setChangePassword()
    setDeleteAccount()
}

function setVisibilityOfUserList() {
    const interval = setInterval(()=> {
        $('#user-list-button').off('click')
        $('#user-list-button').on('click',()=> {
            ajaxUrl('/api/user/generate').then((response)=> {
                hideAndEnable()
                $('#user-table-section').removeClass('d-none')
                $('#user-list-button').prop('disabled',true)
                $('#create-id').val(response)
            })
        })
        if($('#user-list-button').length === 1) clearInterval(interval)
    },1000)
}

function setVisibilityOfCreateAccount() {
    const interval = setInterval(()=> {
        $('#user-create-button').off('click')
        $('#user-create-button').on('click',()=> {
            ajaxUrl('/api/user/generate').then((response)=> {
                hideAndEnable()
                $('#user-create-section').removeClass('d-none')
                $('#user-create-button').prop('disabled',true)
                $('#create-id').val(response)
            })
        })
        if($('#user-create-button').length === 1) clearInterval(interval)
    },1000)
}

function setVisibilityOfDeleteAccount() {
    const interval = setInterval(()=> {
        $('#user-delete-button').off('click')
        $('#user-delete-button').on('click',()=> {
            hideAndEnable()
            $('#user-delete-section').removeClass('d-none')
            $('#user-delete-button').prop('disabled',true)
        })
        if($('#user-delete-button').length === 1) clearInterval(interval)
    },1000)
}

function setVisibilityOfChangePassword() {
    const interval = setInterval(()=> {
        $('#user-change-button').off('click')
        $('#user-change-button').on('click',()=> {
            hideAndEnable()
            $('#user-change-section').removeClass('d-none')
            $('#user-change-button').prop('disabled',true)
        })
        if($('#user-change-button').length === 1) clearInterval(interval)
    },1000)
}

function hideAndEnable() {
    $('#user-create-section').addClass('d-none')
    $('#user-change-section').addClass('d-none')
    $('#user-delete-section').addClass('d-none')
    $('#user-table-section').addClass('d-none')
    $('#user-create-button').prop('disabled',false)
    $('#user-change-button').prop('disabled',false)
    $('#user-delete-button').prop('disabled',false)
    $('#user-list-button').prop('disabled',false)
}

function setCreateAccount() {
    const interval = setInterval(()=> {
        $('#user-create-account').off('click')
        $('#user-create-account').on('click',()=> {
            const id = $('#create-id').val()
            const password = $('#create-password').val()
            const repeatPassword = $('#create-repeat-password').val()
            const firstName = capitalizeWords($('#create-first').val().split(' '))
            const lastName = capitalizeWords($('#create-last').val().split(' '))
            if(firstName.trim() === '' || lastName.trim() === '' || password.trim() === '' || repeatPassword.trim() === '')
                ipcRenderer.send('showError','Create Account','Check blank space')
            else if(password !== repeatPassword) ipcRenderer.send('showError','Create Account','Password did not match!')
            else if(password.length < 8 || repeatPassword.length < 8) ipcRenderer.send('showError','Create Account','Invalid password length!')
            else createAccount(id,password,firstName,lastName)
        })
        if($('#user-create-account').length === 1) clearInterval(interval)
    },1000)
}

function createAccount(id,password,firstName,lastName) {
    const user = {
        'id': id,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        'role': 1,
        'isActive:': '1',
        'isSave': false,
    }

    ajaxPostStringify('/api/user/create', user)
        .then((response)=> {
            if(!response) {
                ipcRenderer.send('default','Create Account',
                    'An account with name: ' + lastName + ', ' + firstName + ' exist in database. Continue?',['Continue','No'])
                ipcRenderer.removeAllListeners('default')
                ipcRenderer.on('default',(e,num)=> {
                    user.isSave = true
                    if(num === 0) ajaxPostStringify('/api/user/create', user)
                        .then(()=> {
                            ipcRenderer.send('showMessage','Create Account','Account is successfully created!\nID: ' + id)
                            hideAndEnable()
                            $('#create-id').val('')
                            $('#create-password').val('')
                            $('#create-repeat-password').val('')
                            $('#create-first').val('')
                            $('#create-last').val('')
                        })
                })
            } else {
                ipcRenderer.send('showMessage','Create Account','Account is successfully created!\nID: ' + id)
                hideAndEnable()
            }
        })
}

function populateUserList() {
    user_list.intervalId = setInterval(()=> {
        ajaxUrl('/api/user/get-user-list')
            .then((data)=> {
                $('#user-table-body').empty()
                for(let i in data) {
                    const row = `<tr class="d-flex">
                                    <th class="col-1 text-start">${add(i,1).toLocaleString()}</th>
                                    <th class="col-3 text-center">${data[i]['id']}</th>
                                    <th class="col-4 text-center">${data[i]['lastName']}, ${data[i]['firstName']}</th>
                                    <th class="col-4 text-center">${data[i]['timestamp']}</th>
                                 </tr>`
                    $('#user-table-body').append(row)
                }
            })
    },1000)
}

function setChangePassword() {
    const interval = setInterval(()=> {
        $('#user-change-password').off('click')
        $('#user-change-password').on('click',()=> {
            const id = $('#change-id').val()
            const oldPassword = $('#change-old-password').val()
            const newPassword = $('#change-new-password').val()
            const repeatNewPassword = $('#change-repeat-new-password').val()

            if(id.trim() === '' || oldPassword.trim() === '' || newPassword.trim() === '' || repeatNewPassword.trim() === '')
                ipcRenderer.send('showError','Change Password','Check blank space')
            else if(newPassword < 8) ipcRenderer.send('showError','Change Password','Invalid new password length! (8 or more)')
            else if(newPassword !== repeatNewPassword) ipcRenderer.send('showError','Change Password', 'Doesn\'t match with the new password')
            else ajaxPostNonString('/api/user/change-password',{'id': id,'oldPassword': oldPassword,'newPassword':newPassword})
                .then((response)=> {
                    if(response) {
                        ipcRenderer.send('showMessage','Change Password','Password successfully changed.')
                        $('#change-id').val('')
                        $('#change-old-password').val('')
                        $('#change-new-password').val('')
                        $('#change-repeat-new-password').val('')
                    } else ipcRenderer.send('showError','Change Password','Invalid ID or old password')
                })
        })

        if($('#user-change-password').length === 1) clearInterval(interval)
    },1000)
}

function setDeleteAccount() {
    const interval = setInterval(()=> {
        $('#user-delete-account').off('click')
        $('#user-delete-account').on('click',()=> {
            const id = $('#delete-id').val()
            const password = $('#delete-password').val()
            if(id.trim() === '' || password.trim() === '') ipcRenderer.send('showError','Delete Account','Check blank space!')
            else ajaxPostNonString('/api/user/delete-account',{'id':id,'password':password})
                .then((response)=> {
                  if(response) {
                      ipcRenderer.send('showMessage','Delete Account',`Account: ${id} is successfully deleted.`)
                      $('#delete-id').val('')
                      $('#delete-password').val('')
                  } else ipcRenderer.send('showError','Delete Account','Invalid ID or Admin Password!')

                })
        })

        if($('#user-delete-account').length === 1) clearInterval(interval)
    })
}