import {
    i_add_generate_id,
    i_add_input,
    i_add_populate,
    i_history_populate,
    i_null_generate_id,
    i_null_populate, ip,
    json_var,
    stockInfo,
    t_add_populate,
    t_add_report_id,
    t_history_populate,
    t_ret_new_total,
    t_ret_populate
} from "./variable.js";

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

export function clearTable() {
    json_var.t_add_return_item = []
    json_var.t_add_report = []
    json_var.t_add_report_item = []
    json_var.t_ret_table = []
    json_var.t_ret_table_null = []
    json_var.t_inventory_report_null = []
    json_var.t_inventory_report_delivery = []
    json_var.t_ret_table_delivery = []
    json_var.i_add_table = []
    json_var.i_add_report = []
    json_var.i_null_report_item = []
    json_var.i_null_report = []
}

export function clearIntervals() {
    clearInterval(t_add_populate.getIntervalId())
    clearInterval(t_add_report_id.getIntervalId())
    clearInterval(t_ret_populate.getIntervalId())
    clearInterval(t_ret_new_total.getIntervalId())
    clearInterval(t_history_populate.getIntervalId())
    clearInterval(i_add_populate.getIntervalId())
    clearInterval(i_add_input.getIntervalId())
    clearInterval(i_add_generate_id.getIntervalId())
    clearInterval(i_null_populate.getIntervalId())
    clearInterval(i_null_generate_id.getIntervalId())
    clearInterval(i_history_populate.getIntervalId())
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

export function setRowColor(row,quantity) {
    if(quantity <= stockInfo.red) {
        row.addClass('bg-danger')
        row.addClass('bg-opacity-25')
    }else if(quantity <= stockInfo.yellow) {
        row.addClass('bg-warning')
        row.addClass('bg-opacity-25')
    }
}

export function setBorderColorNonDecimal(quantity,elem) {
    if(Math.sign(quantity) === 1 && Number.isInteger(parseFloat(quantity)) && quantity !== 0) {
        elem.addClass('border-success')
        elem.removeClass('border-danger')
        return true
    }else {
        elem.removeClass('border-success')
        elem.addClass('border-danger')
        return false
    }
}

export function ajaxUrl(url) {
    return $.ajax({
        url: ip.url + url
    })
}

export function ajaxPostStringify(url, json_data) {
    return $.ajax({
        url: ip.url + url,
        type: 'POST',
        contentType: 'application/json',
            // dataType: 'json', ** Not working with saving product to database, why?
        data: JSON.stringify(json_data)
    })
}

export function ajaxPostNonString(url, json_data) {
    return $.ajax({
        url: ip.url + url,
        type: 'POST',
        data: json_data
    })
}

// same with ajaxDefault
export function ajaxSearchGet(url, data) {
    return $.ajax({
        url: ip.url + url,
        type: 'GET',
        data: {'data': data}
    })
}

export function ajaxDefault(url,data) {
    return $.ajax({
        url: ip.url + url,
        data: {'data': data}
    })
}

export function ajaxDefaultArray(url,array) {
    return $.ajax({
        url: ip.url + url,
        data: array
    })
}

export function sortPriceDescending() {
    return (a, b) => parseFloat(b.price) - parseFloat(a.price)
}

