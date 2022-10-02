export function add(a, b) {
    return parseFloat(a) + parseFloat(b)
}

export function subtract(a,b) {
    return parseFloat(a) - parseFloat(b)
}

export function multiply(a, b) {
    return parseFloat(a) * parseFloat(b)
}

export function divide(a, b) {
    return parseFloat(a) / parseFloat(b)
}

export function getDate() {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const MM = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    let hh = today.getHours()
    let mm = today.getMinutes()
    let ss = today.getSeconds()

    hh = hh < 10 ? '0' + hh : hh
    mm = mm < 10 ? '0' + mm : mm
    ss = ss < 10 ? '0' + ss : ss

    return MM + '/' + dd + '/' + yyyy + ' ' + hh + ':' + mm + ':' + ss
}