import {
    startInventoryAdd
} from "./action/inventory/add.js";
import {startInventoryNull} from "./action/inventory/null.js";
import {clearTable,clearIntervals} from "../function.js";
import {startHistory} from "./action/inventory/history.js";

$().ready(()=> {
    $('#inventory-left').load('src/pages/inventory/add-left.html')
    $('#inventory-right').load('src/pages/inventory/add-right.html')
})

export function setInventoryButtons() {
    $('#btn-inventory-add').on('click',()=> {
        clearIntervals()
        clearTable()
        startInventoryAdd()
        setAdd()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    $('#btn-inventory-null').on('click',()=> {
        clearIntervals()
        clearTable()
        startInventoryNull()
        setNull()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    $('#btn-inventory-history').on('click',()=> {
        clearIntervals()
        clearTable()
        setHistory()
        startHistory()
        setTimeout(()=> $('#main-section').removeClass('d-none'),500)
    })

    $('#btn-inventory-product').on('click',()=> {
        clearIntervals()
        clearTable()
        setProduct()
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