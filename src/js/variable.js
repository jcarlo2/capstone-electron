export const {ipcRenderer} = require('electron')
export const path = require('platform-folders')
export const charts = require('highcharts')
class IP {
    _url = 'http://localhost:8080'

    get url() {
        return this._url;
    }

    set url(value) {
        this._url = value;
    }
}

export const ip = new IP()

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
export const t_add_report_id = new IntervalVariable()
export const t_add_dropdown = new IntervalVariable()
export const t_ret_populate = new IntervalVariable()
export const t_ret_new_total = new IntervalVariable()
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


class Buttons {
    _transactionAdd
    _transactionReturn
    _transactionHistory
    _inventoryAdd
    _inventoryNull
    _inventoryHistory
    _inventoryProduct

    get transactionAdd() {
        return this._transactionAdd;
    }

    set transactionAdd(value) {
        this._transactionAdd = value;
    }

    get transactionReturn() {
        return this._transactionReturn;
    }

    set transactionReturn(value) {
        this._transactionReturn = value;
    }

    get transactionHistory() {
        return this._transactionHistory;
    }

    set transactionHistory(value) {
        this._transactionHistory = value;
    }

    get inventoryAdd() {
        return this._inventoryAdd;
    }

    set inventoryAdd(value) {
        this._inventoryAdd = value;
    }

    get inventoryNull() {
        return this._inventoryNull;
    }

    set inventoryNull(value) {
        this._inventoryNull = value;
    }

    get inventoryHistory() {
        return this._inventoryHistory;
    }

    set inventoryHistory(value) {
        this._inventoryHistory = value;
    }

    get inventoryProduct() {
        return this._inventoryProduct;
    }

    set inventoryProduct(value) {
        this._inventoryProduct = value;
    }
}

export const globalButtons = new Buttons()

setInterval(()=> {
    globalButtons.transactionAdd = $('#btn-transaction-add')
    globalButtons.transactionReturn = $('#btn-transaction-return')
    globalButtons.transactionHistory = $('#btn-transaction-history')
    globalButtons.inventoryAdd = $('#btn-inventory-add')
    globalButtons.inventoryNull = $('#btn-inventory-null')
    globalButtons.inventoryHistory = $('#btn-inventory-history')
    globalButtons.inventoryProduct = $('#btn-inventory-product')
},1000)