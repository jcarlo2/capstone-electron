export const {ipcRenderer} = require('electron')
export const path = require('platform-folders')
export const xlsx = require('xlsx-js-style')
export const fs = require('fs')
export const ipAdd = require('ip')
export const ip = {'address': require('ip').address()}
export const role = {'role': '-1'}

class RowStockColor {
    _red = 50
    _yellow = 100

    get red() {
        return this._red;
    }

    set red(value) {
        this._red = value;
    }

    get yellow() {
        return this._yellow;
    }

    set yellow(value) {
        this._yellow = value;
    }
}

export const stockInfo = new RowStockColor()

class IntervalVariable {
    _intervalId = 999

    get intervalId() {
       return this._intervalId
    }

    set intervalId(value) {
        this._intervalId = value
    }
}

class SavePath {
    _folderPath = path.getDocumentsFolder()

    get folderPath() {
        return this._folderPath
    }

    set folderPath(value) {
        this._folderPath = value
    }
}

export const savePath = new SavePath()

/**
 * Used for table renderer and saving entity to database
 *      <NAME>                              <TAB>                   <FUNCTION>
 * t_add_return_item: []                transaction add         : null report item
 * t_add_report: []                     transaction add         : report transaction add
 * t_add_report_item : []               transaction add         : render / report item
 * t_ret_table: []                      transaction return      : render / report item
 * t_ret_table_null: []                 transaction return      : report item
 * t_inventory_report_null: []          transaction return      : report inventory null
 * t_inventory_report_delivery : []     transaction return      : report inventory delivery
 * t_ret_table_delivery' : []           transaction return      : report item
 * i_add_table: []                      inventory add           : render / report item
 * i_add_report: []                     inventory add           : report inventory add
 * i_null_report_item: []               inventory null          : render / report item
 * i_null_report: []                    inventory null          : report inventory null
 */
export const json_var = {
    't_add_return_item' : [],
    't_add_report' : [],
    't_add_report_item' : [],
    't_ret_table' : [],
    't_ret_table_null' : [],
    't_inventory_report_null' : [],
    't_inventory_report_delivery' : [],
    't_ret_table_delivery' : [],
    'i_add_table' : [],
    'i_add_report' : [],
    'i_null_report_item' : [],
    'i_null_report' : [],
}

// transaction interval

export const t_add_populate = new IntervalVariable()
export const t_add_date = new IntervalVariable()
export const t_add_report_id = new IntervalVariable()
export const t_add_dropdown = new IntervalVariable()
export const t_ret_populate = new IntervalVariable()
export const t_ret_new_total = new IntervalVariable()
export const t_ret_date = new IntervalVariable()
export const t_history_populate = new IntervalVariable()

// inventory interval

export const i_add_populate = new IntervalVariable()
export const i_add_input = new IntervalVariable()
export const i_add_generate_id = new IntervalVariable()
export const i_null_populate = new IntervalVariable()
export const i_null_generate_id = new IntervalVariable()
export const i_history_populate = new IntervalVariable()
export const i_product_discount = new IntervalVariable()
export const i_product_archive = new IntervalVariable()

// log interval
export const log_populate = new IntervalVariable()

// setting
export const connection_checker = new IntervalVariable()
export const user_list = new IntervalVariable()


class Buttons {
    _transaction
    _inventory
    _report
    _log
    _setting
    _tAdd
    _tReturn
    _tHistory
    _iAdd
    _iNull
    _iHistory
    _iProduct

    get transaction() {
        return this._transaction
    }

    set transaction(value) {
        this._transaction = value
    }

    get inventory() {
        return this._inventory
    }

    set inventory(value) {
        this._inventory = value
    }

    get report() {
        return this._report
    }

    set report(value) {
        this._report = value
    }

    get log() {
        return this._log
    }

    set log(value) {
        this._log = value
    }

    set setting(value) {
        this._setting = value
    }

    get setting() {
        return this._setting
    }

    get tAdd() {
        return this._tAdd;
    }

    set tAdd(value) {
        this._tAdd = value;
    }

    get tReturn() {
        return this._tReturn;
    }

    set tReturn(value) {
        this._tReturn = value;
    }

    get tHistory() {
        return this._tHistory;
    }

    set tHistory(value) {
        this._tHistory = value;
    }

    get iAdd() {
        return this._iAdd;
    }

    set iAdd(value) {
        this._iAdd = value;
    }

    get iNull() {
        return this._iNull;
    }

    set iNull(value) {
        this._iNull = value;
    }

    get iHistory() {
        return this._iHistory;
    }

    set iHistory(value) {
        this._iHistory = value;
    }

    get iProduct() {
        return this._iProduct;
    }

    set iProduct(value) {
        this._iProduct = value;
    }
}

export const globalButtons = new Buttons()

setInterval(()=> {
    globalButtons.transaction = $('#main-transaction')
    globalButtons.inventory = $('#main-inventory')
    globalButtons.report = $('#main-report')
    globalButtons.log = $('#main-log')
    globalButtons.setting = $('#main-setting')

    globalButtons.tAdd = $('#btn-transaction-add')
    globalButtons.tReturn = $('#btn-transaction-return')
    globalButtons.tHistory = $('#btn-transaction-history')
    globalButtons.iAdd = $('#btn-inventory-add')
    globalButtons.iNull = $('#btn-inventory-null')
    globalButtons.iHistory = $('#btn-inventory-history')
    globalButtons.iProduct = $('#btn-inventory-product')
},500)