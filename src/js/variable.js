export const {ipcRenderer} = require('electron')
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
    intervalId = 999

    getIntervalId() {
       return this.intervalId
    }

    setIntervalId(set) {
        this.intervalId = set
    }
}

/**
 * Used for table renderer and saving entity to database
 *      <NAME>                          <TAB>                   <FUNCTION>
 * t_add_report: *[]                transaction add         : report
 * t_add_report_item : [],          transaction add         : render / report item
 * t_ret_table: *[]                 transaction return      : render / report item
 * t_ret_table_null: *[]            transaction return      : report item
 * t_inventory_report_null: *[]     transaction return      : report
 * i_add_table: *[]                 inventory add           : render / report item
 * i_add_report: *[]                inventory add           : report
 * i_null_report_item: *[]          inventory null          : render / report item
 * i_null_report: *[]               inventory null          : report
 */
export const json_var = {
    't_add_report' : [],
    't_add_report_item' : [],
    't_ret_table' : [],
    't_ret_table_null' : [],
    't_inventory_report_null' : [],
    'i_add_table' : [],
    'i_add_report' : [],
    'i_null_report_item' : [],
    'i_null_report' : [],
}

// transaction interval

export const t_add_populate = new IntervalVariable()
export const t_add_clear = new IntervalVariable()
export const t_add_report_id = new IntervalVariable()
export const t_add_dropdown = new IntervalVariable()
export const t_ret_populate = new IntervalVariable()
export const t_ret_clear = new IntervalVariable()
export const t_ret_new_total = new IntervalVariable()
export const t_history_populate = new IntervalVariable()
export const t_history_delete = new IntervalVariable()
export const t_history_option = new IntervalVariable()

// inventory interval

export const i_add_populate = new IntervalVariable()
export const i_add_pay = new IntervalVariable()
export const i_add_clear = new IntervalVariable()
export const i_add_generate_id = new IntervalVariable()
export const i_add_dropdown = new IntervalVariable()
export const i_null_populate = new IntervalVariable()
export const i_null_generate_id = new IntervalVariable()
export const i_null_clear = new IntervalVariable()
export const i_null_pay = new IntervalVariable()
export const i_null_dropdown = new IntervalVariable()
export const i_history_populate = new IntervalVariable()
export const i_history_option = new IntervalVariable()


class Buttons {
    _transactionAdd
    _transactionReturn = $('#btn-transaction-return')
    _transactionHistory = $('#btn-transaction-history')
    _inventoryAdd = $('#btn-inventory-add')
    _inventoryNull = $('#btn-inventory-null')
    _inventoryHistory = $('#btn-inventory-history')
    _inventoryProduct = $('#btn-inventory-product')

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