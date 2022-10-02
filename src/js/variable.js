export const {ipcRenderer} = require('electron')


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
 * t_add_report: *[]                transaction report
 * t_ret_table: *[]                 table to render in return transaction / transaction report item
 * t_add_report_item : [],          for add transaction
 * t_ret_table_null: *[]            inventory null report item
 * t_inventory_report_null: *[]     inventory null report
 */
export const json_var = {
    't_ret_table' : [],
    't_add_report' : [],
    't_add_report_item' : [],
    't_inventory_report_null' : [],
    't_ret_table_null' : [],
}

export const t_add_populate = new IntervalVariable()
export const t_add_clear = new IntervalVariable()
export const t_add_pay = new IntervalVariable()
export const t_ret_populate = new IntervalVariable()
export const t_ret_clear = new IntervalVariable()
export const t_ret_new_total = new IntervalVariable()
export const t_history_populate = new IntervalVariable()
export const t_history_delete = new IntervalVariable()
export const mainSection = $('#main-section')
