export const {ipcRenderer} = require('electron')

class globalVariable {
    transactionFindAllProduct = 999

    getTransactionFindAllProduct() {
       return this.transactionFindAllProduct
    }

    setTransactionFindAllProduct(set) {
        this.transactionFindAllProduct = set
    }
}

export const ins = new globalVariable()
export const mainSection = $('#main-section')

