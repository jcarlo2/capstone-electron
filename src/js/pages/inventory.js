import {
    startInventoryAdd
} from "./action/inventory/add.js";
import {startInventoryNull} from "./action/inventory/null.js";
import {clearTable,clearIntervals} from "../function.js";
import {startInventoryHistory} from "./action/inventory/history.js";
import {startInventoryProduct} from "./action/inventory/product.js";

export function setInventoryButtons() {
    $('#btn-inventory-add').off('click')
    $('#btn-inventory-add').on('click',()=> {
        clearTable()
        clearIntervals()
        startInventoryAdd()
        setAdd()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    $('#btn-inventory-null').off('click')
    $('#btn-inventory-null').on('click',()=> {
        clearTable()
        clearIntervals()
        startInventoryNull()
        setNull()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    $('#btn-inventory-history').off('click')
    $('#btn-inventory-history').on('click',()=> {
        clearTable()
        clearIntervals()
        setHistory()
        startInventoryHistory()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    $('#btn-inventory-product').off('click')
    $('#btn-inventory-product').on('click',()=> {
        clearTable()
        clearIntervals()
        setProduct()
        startInventoryProduct()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    function setAdd() {
        $('#main-section').addClass('d-none')
        $('#inventory-left').load('src/pages/inventory/add-left.html')
        $('#inventory-right').load('src/pages/inventory/add-right.html')
        $('#btn-inventory-add').prop('disabled',true)
        $('#btn-inventory-null').prop('disabled',false)
        $('#btn-inventory-history').prop('disabled',false)
        $('#btn-inventory-product').prop('disabled',false)
    }

    function setNull() {
        $('#main-section').addClass('d-none')
        $('#inventory-left').load('src/pages/inventory/null-left.html')
        $('#inventory-right').load('src/pages/inventory/null-right.html')
        $('#btn-inventory-add').prop('disabled',false)
        $('#btn-inventory-null').prop('disabled',true)
        $('#btn-inventory-history').prop('disabled',false)
        $('#btn-inventory-product').prop('disabled',false)
    }

    function setHistory() {
        $('#main-section').addClass('d-none')
        $('#inventory-left').load('src/pages/inventory/history-left.html')
        $('#inventory-right').load('src/pages/inventory/history-right.html')
        $('#btn-inventory-add').prop('disabled',false)
        $('#btn-inventory-null').prop('disabled',false)
        $('#btn-inventory-history').prop('disabled',true)
        $('#btn-inventory-product').prop('disabled',false)
    }

    function setProduct() {
        $('#main-section').addClass('d-none')
        $('#inventory-left').load('src/pages/inventory/product-left.html')
        $('#inventory-right').load('src/pages/inventory/product-right.html')
        $('#btn-inventory-add').prop('disabled',false)
        $('#btn-inventory-null').prop('disabled',false)
        $('#btn-inventory-history').prop('disabled',false)
        $('#btn-inventory-product').prop('disabled',true)
    }
}