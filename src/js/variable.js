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

export const json_var = {
    "t_ret_table" : [],
    "t_ret_table_null" : [], // returned item
    "t_add_report_item" : [], // transaction report item
    "t_add_report" : [], // transaction report
}

export const t_add_populate = new IntervalVariable()
export const t_add_clear = new IntervalVariable()
export const t_add_pay = new IntervalVariable()
export const t_ret_populate = new IntervalVariable()
export const t_ret_clear = new IntervalVariable()
export const t_ret_pay = new IntervalVariable()
export const t_ret_new_total = new IntervalVariable()
export const mainSection = $('#main-section')
