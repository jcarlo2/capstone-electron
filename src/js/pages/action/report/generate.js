import {add, ajaxDefaultArray, ajaxUrl, subtract} from '../../../function.js';
import {ipcRenderer, savePath, xlsx} from '../../../variable.js';

export function startGenerate() {
    setShowButton()
    setTab()
    setMaximumDate()
}

function setExportButton(transactionSummary,voidSummary,deliverySummary,transactionProducts,voidProducts,deliveryProducts) {
    $('#generate-export').off('click')
    $('#generate-export').on('click', ()=> {
        ipcRenderer.send('default','Export','Export as Excel or Microsoft Word?',['Excel','MS Word','Cancel'])
        ipcRenderer.removeAllListeners('default')
        ipcRenderer.on('default',(e,num)=> {
            if(num === 0) makeExcelFile(transactionSummary,voidSummary,deliverySummary,transactionProducts,voidProducts,deliveryProducts)
            else if(num === 1) makeMsWordFile(transactionSummary,voidSummary,deliverySummary,transactionProducts,voidProducts,deliveryProducts)
        })
    })
}

function makeMsWordFile(transactionSummary,voidSummary,deliverySummary,transactionProducts,voidProducts,deliveryProducts) {

}

function makeExcelFile(transactionSummary,voidSummary,deliverySummary,transactionProducts,voidProducts,deliveryProducts) {
    ajaxUrl('/api/date/get-date').then((response)=> {
        const user = $('#main-user-name').text()
        const book = xlsx.utils.book_new()
        const transactionSheets = setTransactionSheets(transactionProducts)
        const voidSheets = setVoidSheets(voidProducts)
        const deliverySheets = setDeliverySheet(deliveryProducts)
        const summarySheet = setSummarySheet(transactionSummary,voidSummary,deliverySummary)

        xlsx.utils.book_append_sheet(book,summarySheet,'Summary')
        xlsx.utils.book_append_sheet(book,transactionSheets[2],'Transaction (Name)')
        xlsx.utils.book_append_sheet(book,transactionSheets[0],'Transaction (Quantity)')
        xlsx.utils.book_append_sheet(book,transactionSheets[1],'Transaction (Profit)')

        xlsx.utils.book_append_sheet(book,voidSheets[2],'Void (Name)')
        xlsx.utils.book_append_sheet(book,voidSheets[0],'Void (Quantity)')
        xlsx.utils.book_append_sheet(book,voidSheets[1],'Void (Loss)')

        xlsx.utils.book_append_sheet(book,deliverySheets[2],'Delivery (Name)')
        xlsx.utils.book_append_sheet(book,deliverySheets[0],'Delivery (Quantity)')
        xlsx.utils.book_append_sheet(book,deliverySheets[1],'Delivery (Cost)')
        xlsx.writeFile(book, savePath.folderPath + '/' + user + '-' + response.replaceAll(':','-').replaceAll(' ','-') + '.xlsx')
    })
}

function setSummarySheet(transactionSummary,voidSummary,deliverySummary) {
    const profit = transactionSummary['totalProfit']
    const loss = voidSummary['totalLoss']
    const incomeHex = 'D6E865'
    const transactionHex = '21A359'
    const voidHex = 'CFCC1F'
    const deliveryHex = 'ADD8E6'
    const data = [
        [{ v: 'Total Net Income', t: 's', s: setSummaryHeader(incomeHex)}],
        [
            { v: 'Total Profit', t: 's', s: setRowStyle(true,incomeHex)},
            { v: 'Total Loss', t: 's', s: setRowStyle(true,incomeHex)},
            { v: 'Total Amount', t: 's', s: setRowStyle(true,incomeHex)},
            { v: '', t: 's', s: setRowStyle(true,incomeHex)}
        ],
        [
            { v: '\u20B1 ' + profit, t: 's', s: setRowStyle(false,incomeHex)},
            { v: '\u20B1 ' + loss, t: 's', s: setRowStyle(false,incomeHex)},
            { v: '\u20B1 ' + subtract(profit,loss).toLocaleString(), t: 's', s: setRowStyle(false,incomeHex)},
            { v: '', t: 's', s: setRowStyle(false,incomeHex)},
        ],
        [],[],
        [{ v: 'Total Sales', t: 's', s: setSummaryHeader(transactionHex)}],
        [
            { v: 'Total Sales', t: 's', s: setRowStyle(true,transactionHex)},
            { v: 'Total Capital', t: 's', s: setRowStyle(true,transactionHex)},
            { v: 'Total Profit', t: 's', s: setRowStyle(true,transactionHex)},
            { v: '', t: 's', s: setRowStyle(true,transactionHex)}
        ],
        [
            { v: '\u20B1 ' + transactionSummary['totalAmount'], t: 's', s: setRowStyle(false,transactionHex)},
            { v: '\u20B1 ' + transactionSummary['totalCapital'], t: 's', s: setRowStyle(false,transactionHex)},
            { v: '\u20B1 ' + profit, t: 's', s: setRowStyle(false,transactionHex)},
            { v: '', t: 's', s: setRowStyle(false,transactionHex)},
        ],
        [],[],
        [{ v: 'Total Loss', t: 's', s: setSummaryHeader(voidHex)}],
        [
            { v: 'Total Expired', t: 's', s: setRowStyle(true,voidHex)},
            { v: 'Total Damaged', t: 's', s: setRowStyle(true,voidHex)},
            { v: 'Total Quantity', t: 's', s: setRowStyle(true,voidHex)},
            { v: 'Total Loss', t: 's', s: setRowStyle(true,voidHex)}
        ],
        [
            { v: voidSummary['expiredItem'], t: 's', s: setRowStyle(false,voidHex)},
            { v: voidSummary['damagedItem'], t: 's', s: setRowStyle(false,voidHex)},
            { v: voidSummary['totalItem'], t: 's', s: setRowStyle(false,voidHex)},
            { v: '\u20B1 ' + voidSummary['totalLoss'], t: 's', s: setRowStyle(false,voidHex)},
        ],
        [],[],
        [{ v: 'Delivery', t: 's', s: setSummaryHeader(deliveryHex)}],
        [
            { v: 'Total Quantity', t: 's', s: setRowStyle(true,deliveryHex)},
            { v: 'Total Cost', t: 's', s: setRowStyle(true,deliveryHex)},
            { v: '', t: 's', s: setRowStyle(true,deliveryHex)},
            { v: '', t: 's', s: setRowStyle(true,deliveryHex)}
        ],
        [
            { v: deliverySummary['totalItem'], t: 's', s: setRowStyle(false,deliveryHex)},
            { v: '\u20B1 ' + deliverySummary['totalCost'], t: 's', s: setRowStyle(false,deliveryHex)},
            { v: '', t: 's', s: setRowStyle(false,deliveryHex)},
            { v: '', t: 's', s: setRowStyle(false,deliveryHex)},
        ]
    ]
    const sheet = xlsx.utils.aoa_to_sheet(data)
    setSummarySheetProperties(sheet,transactionSummary,voidSummary,deliverySummary)
    return sheet;
}

function setSummarySheetProperties(sheet,transactionSummary,voidSummary,deliverySummary) {
    const columnWidth = [{wch: 20},{wch: 20},{wch: 20},{wch: 20}]
    sheet['!merges'] = [
        {s: {r:0, c: 0}, e: {r:0, c: 3}},
        {s: {r:5, c: 0}, e: {r:5, c: 3}},
        {s: {r:10, c: 0}, e: {r:10, c: 3}},
        {s: {r:15, c: 0}, e: {r:15, c: 3}}
    ]

    calculateSheetColumnWidth(columnWidth,transactionSummary)
    calculateSheetColumnWidth(columnWidth,voidSummary)
    calculateSheetColumnWidth(columnWidth,deliverySummary)
    sheet['!cols'] = columnWidth
}

function setSummaryHeader(hexColor) {
    return { alignment: {horizontal: 'center'},font: { name: 'Calibri', sz: 16, bold: true}, fill: { patternType: 'solid', fgColor: { rgb: hexColor } }}
}

function setRowStyle(isHeader,hexColor) {
    return { font: { name: 'Calibri', sz: 12, bold: isHeader}, fill: { patternType: 'solid', fgColor: { rgb: hexColor } }}
}

function setDeliverySheet(deliveryProducts) {
    let deliveryDataSortedByQuantity = populateDeliverySheetWithData(deliveryProducts[0][0],true)
    let deliveryDataSortedByProfit = populateDeliverySheetWithData(deliveryProducts[0][1],false)
    let deliveryDataSortedByName = populateDeliverySheetWithData(deliveryProducts[0][2],false)
    const sheetSortedByQuantity = xlsx.utils.aoa_to_sheet(deliveryDataSortedByQuantity[0])
    const sheetSortedByProfit = xlsx.utils.aoa_to_sheet(deliveryDataSortedByProfit[0])
    const sheetSortedByName = xlsx.utils.aoa_to_sheet(deliveryDataSortedByName[0])
    sheetSortedByProfit['!cols'] = deliveryDataSortedByQuantity[1]
    sheetSortedByQuantity['!cols'] = deliveryDataSortedByQuantity[1]
    sheetSortedByName['!cols'] = deliveryDataSortedByQuantity[1]
    return [sheetSortedByProfit,sheetSortedByQuantity,sheetSortedByName]
}

function populateDeliverySheetWithData(dataList,isCalculate) {
    const columnWidth = [{wch: 7},{wch: 9},{wch: 13},{wch: 13},{wch: 15}]
    const headerStyle = { font: { name: 'Calibri', sz: 12, bold: true}, fill: { patternType: 'solid', fgColor: { rgb: 'ADD8E6' } }}
    const rowStyle = { font: { name: 'Calibri', sz: 12, bold: false}, fill: { patternType: 'solid', fgColor: { rgb: 'ADD8E6' } }}

    const sheet = [[
        { v: 'ID', t: 's', s: headerStyle},
        { v: 'Name', t: 's', s: headerStyle},
        { v: 'Quantity', t: 's', s: headerStyle},
        { v: 'Discount', t: 's', s: headerStyle},
        { v: 'Total Cost', t: 's', s: headerStyle},
    ]]

    dataList.forEach(data => {
        sheet.push([
            { v: data['id'], t: 's', s: rowStyle},
            { v: data['name'], t: 's', s: rowStyle},
            { v: data['quantity'], t: 's', s: rowStyle},
            { v: data['discount'] + ' %', t: 's', s: rowStyle},
            { v: '\u20B1 ' + data['totalCost'], t: 's', s: rowStyle},
        ])
        if(isCalculate) calculateSheetColumnWidth(columnWidth,data)
    })
    return [sheet,columnWidth];
}

function setVoidSheets(voidProducts) {
    let voidDataSortedByQuantity = populateVoidSheetWithData(voidProducts[0][0],true)
    let voidDataSortedByProfit = populateVoidSheetWithData(voidProducts[0][1],false)
    let voidDataSortedByName = populateVoidSheetWithData(voidProducts[0][2],false)
    const sheetSortedByQuantity = xlsx.utils.aoa_to_sheet(voidDataSortedByQuantity[0])
    const sheetSortedByProfit = xlsx.utils.aoa_to_sheet(voidDataSortedByProfit[0])
    const sheetSortedByName = xlsx.utils.aoa_to_sheet(voidDataSortedByName[0])
    sheetSortedByQuantity['!cols'] = voidDataSortedByQuantity[1]
    sheetSortedByProfit['!cols'] = voidDataSortedByQuantity[1]
    sheetSortedByName['!cols'] = voidDataSortedByQuantity[1]
    return [sheetSortedByQuantity,sheetSortedByProfit,sheetSortedByName]
}

function populateVoidSheetWithData(dataList,isCalculate) {
    const columnWidth = [{wch: 7},{wch: 9},{wch: 11},{wch: 13},{wch: 12},{wch: 15}]
    const headerStyle = { font: { name: 'Calibri', sz: 12, bold: true}, fill: { patternType: 'solid', fgColor: { rgb: 'CFCC1F' } }}
    const rowStyle = { font: { name: 'Calibri', sz: 12, bold: false}, fill: { patternType: 'solid', fgColor: { rgb: 'CFCC1F' } }}

    const sheet = [[
        { v: 'ID', t: 's', s: headerStyle},
        { v: 'Name', t: 's', s: headerStyle},
        { v: 'Reason', t: 's', s: headerStyle},
        { v: 'Quantity', t: 's', s: headerStyle},
        { v: 'Capital', t: 's', s: headerStyle},
        { v: 'Total Loss', t: 's', s: headerStyle},
    ]]

    dataList.forEach(data => {
        sheet.push([
            { v: data['id'], t: 's', s: rowStyle},
            { v: data['name'], t: 's', s: rowStyle},
            { v: data['reason'], t: 's', s: rowStyle},
            { v: data['quantity'], t: 's', s: rowStyle},
            { v: '\u20B1 ' + data['capital'], t: 's', s: rowStyle},
            { v: '\u20B1 ' + data['totalCapital'], t: 's', s: rowStyle},
        ])
        if(isCalculate) calculateSheetColumnWidth(columnWidth,data)
    })
    return [sheet,columnWidth];
}

function setTransactionSheets(transactionProducts) {
    let transactionDataSortedByQuantity = populateTransactionSheetWithData(transactionProducts[0][0],true)
    let transactionDataSortedByProfit = populateTransactionSheetWithData(transactionProducts[0][1],false)
    let transactionDataSortedByName = populateTransactionSheetWithData(transactionProducts[0][2],false)
    const sheetSortedByQuantity = xlsx.utils.aoa_to_sheet(transactionDataSortedByQuantity[0])
    const sheetSortedByProfit = xlsx.utils.aoa_to_sheet(transactionDataSortedByProfit[0])
    const sheetSortedByName = xlsx.utils.aoa_to_sheet(transactionDataSortedByName[0])
    sheetSortedByQuantity['!cols'] = transactionDataSortedByQuantity[1]
    sheetSortedByProfit['!cols'] = transactionDataSortedByQuantity[1]
    sheetSortedByName['!cols'] = transactionDataSortedByQuantity[1]
    return [sheetSortedByQuantity,sheetSortedByProfit,sheetSortedByName]
}

function populateTransactionSheetWithData(dataList,isCalculate) {
    const columnWidth = [{wch: 7},{wch: 9},{wch: 10},{wch: 12},{wch: 13},{wch: 13},{wch: 16},{wch: 18},{wch: 17}]
    const headerStyle = { font: { name: 'Calibri', sz: 12, bold: true}, fill: { patternType: 'solid', fgColor: { rgb: '21A359' } }}
    const rowStyle = { font: { name: 'Calibri', sz: 12, bold: false}, fill: { patternType: 'solid', fgColor: { rgb: '21A359' } }}
    const sheet = [[
        { v: 'ID', t: 's', s: headerStyle},
        { v: 'Name', t: 's', s: headerStyle},
        { v: 'Price', t: 's', s: headerStyle},
        { v: 'Capital', t: 's', s: headerStyle},
        { v: 'Quantity', t: 's', s: headerStyle},
        { v: 'Discount', t: 's', s: headerStyle},
        { v: 'Total Sales', t: 's', s: headerStyle},
        { v: 'Total Capital', t: 's', s: headerStyle},
        { v: 'Total Profit', t: 's', s: headerStyle},
    ]]

    dataList.forEach(data => {
        sheet.push([
            { v: data['id'], t: 's', s: rowStyle},
            { v: data['name'], t: 's', s: rowStyle},
            { v: '\u20B1 ' + data['price'], t: 's', s: rowStyle},
            { v: '\u20B1 ' + data['capital'], t: 's', s: rowStyle},
            { v: data['quantity'], t: 's', s: rowStyle},
            { v: data['discount'] + ' %', t: 's', s: rowStyle},
            { v: '\u20B1 ' + data['totalPrice'], t: 's', s: rowStyle},
            { v: '\u20B1 ' + data['totalCapital'], t: 's', s: rowStyle},
            { v: '\u20B1 ' + data['profit'], t: 's', s: rowStyle}
        ])
        if(isCalculate) calculateSheetColumnWidth(columnWidth,data)
    })
    return [sheet,columnWidth];
}

function calculateSheetColumnWidth(column,product) {
    const values = Object.values(product)
    for(let i in values) {
        column[i]['wch'] = (parseInt(column[i]['wch']) - 5) >= values[i].toString().length ? column[i]['wch'] : values[i].length + 5
    }
}

function setMaximumDate() {
    ajaxUrl('/api/date/get-date').then((response)=> {
        const date = response.split(' ')[0]
        $('#generate-main-start').prop('max',date)
        $('#generate-main-start').val(date)
        $('#generate-main-end').prop('max',date)
    })
}

function setShowButton() {
    const interval = setInterval(()=> {
        $('#generate-main-show').off('click')
        $('#generate-main-show').on('click',()=> {
            $('#generate-export').prop('disabled',true)
            $('#generate-main-show').prop('disabled',true)
            const start = $('#generate-main-start').val()
            let end = $('#generate-main-end').val()
            if(new Date(start) > new Date(end)) ipcRenderer.send('showError','Date','Invalid date: check start and end date')
            else {
                end = end === '' ? end : end + ' 23:59:59'
                let data
                let option = 'all'
                if(start !== '' && end !== '') {
                    option = 'date'
                    data = {'start':start,'end':end}
                } else if(start !== '' && end === '') {
                    option = 'start'
                    data = {'start':start}
                } else if(start === '' && end !== '') {
                    option = 'end'
                    data = {'end':end}
                }
                showData(option,data)
                $('#generate-export').prop('disabled',false)
                $('#generate-main-show').prop('disabled',false)
            }
        })
        if($('#generate-main-show').length === 1) {
            $('#generate-main-show').prop('disabled',false)
            $('#generate-main-show').click()
            clearInterval(interval)
        }
    },1000)
}

function showData(option,data) {
    let ajax
    if(option === 'all') {
        ajax = $.when(
            ajaxUrl('/api/transaction/calculate-sales-' + option),
            ajaxUrl('/api/inventory/calculate-void-' + option),
            ajaxUrl('/api/inventory/calculate-delivery-' + option),

            ajaxUrl('/api/transaction/calculate-product-sales-' + option),
            ajaxUrl('/api/inventory/calculate-product-void-' + option),
            ajaxUrl('/api/inventory/calculate-product-delivery-' + option)
        )
    }else {
        ajax = $.when(
            ajaxDefaultArray('/api/transaction/calculate-sales-' + option,data),
            ajaxDefaultArray('/api/inventory/calculate-void-' + option,data),
            ajaxDefaultArray('/api/inventory/calculate-delivery-' + option,data),

            ajaxDefaultArray('/api/transaction/calculate-product-sales-' + option,data),
            ajaxDefaultArray('/api/inventory/calculate-product-void-' + option,data),
            ajaxDefaultArray('/api/inventory/calculate-product-delivery-' + option,data)
        )
    }

    if(ajax !== undefined) {
        ajax.then((transactionSummary,voidSummary,deliverySummary,transactionProducts,voidProducts,deliveryProducts)=> {
            setValidSummary(transactionSummary[0])
            setTotalSummary(transactionSummary[0],voidSummary[0])
            setDeliverySummary(deliverySummary[0])
            setTransactionProducts(transactionProducts[0][2])
            setVoidProducts(voidProducts[0][2])
            setDeliveryProducts(deliveryProducts[0][2])
            setExportButton(transactionSummary[0],voidSummary[0],deliverySummary[0],transactionProducts,voidProducts,deliveryProducts)
        })
    }
}

function setDeliveryProducts(data) {
    $('#generate-right-delivery-body').empty()
    for(let i in data) {
        const row = `<tr class='d-flex'>
                        <th class='col-1'>`+ add(i,1).toLocaleString() +`</th>
                        <td class='col-2 text-start'>`+ data[i]['id'] +`</td>
                        <td class='col-3 text-start'>`+ data[i]['name'] +`</td>
                        <td class='col-2 text-center'>`+ parseFloat(data[i]['quantity']).toLocaleString() +`</td>
                        <td class='col-2 text-center'>`+ parseFloat(data[i]['discount']).toLocaleString() +` %</td>
                        <td class='col-2 text-center'>&#8369; `+ parseFloat(data[i]['totalCost']).toLocaleString() +`</td>
                    </tr>`
        $('#generate-right-delivery-body').append(row)
    }
}

function setVoidProducts(data) {
    $('#generate-right-void-body').empty()
    for(let i in data) {
        const row = `<tr class='d-flex'>
                        <th class='col-1 text-start'>`+ add(i,1).toLocaleString() +`</th>
                        <td class='col-2 text-start'>`+ data[i]['id'] +`</td>
                        <td class='col-3 text-start'>`+ data[i]['name'] +`</td>
                        <td class='col-2 text-center'>`+ data[i]['quantity'] +`</td>
                        <td class='col-2 text-center'>&#8369; `+ data[i]['capital'] +`</td>
                        <td class='col-2 text-center'>&#8369; `+ parseFloat(data[i]['totalCapital']).toLocaleString() +`</td>
                    </tr>`
        $('#generate-right-void-body').append(row)
    }
}

function setTransactionProducts(data) {
    $('#generate-right-transaction-body').empty()
    for(let i in data) {
        const row = `<tr class='d-flex'>
                        <th class='col-1 text-start'>`+ add(i,1).toLocaleString() +`</th>
                        <td class='col-3 text-start'>`+ data[i]['name'] +`</td>
                        <td class='col-1 text-center'>`+ parseInt(data[i]['quantity']).toLocaleString() +`</td>
                        <td class='col-1 text-center'>&#8369; `+ parseFloat(data[i]['price']).toLocaleString() +`</td>
                        <td class='col-2 text-center'>&#8369; `+ parseFloat(data[i]['totalPrice']).toLocaleString() +`</td>
                        <td class='col-2 text-center'>&#8369; `+ parseFloat(data[i]['totalCapital']).toLocaleString() +`</td>
                        <td class='col-2 text-center'>&#8369; `+ parseFloat(data[i]['profit']).toLocaleString() +`</td>
                    </tr>`
        $('#generate-right-transaction-body').append(row)
    }
}

function setValidSummary(data) {
    $('#valid-total-sales').text('\u20B1 ' + parseFloat(data['totalAmount']).toLocaleString())
    $('#valid-total-capital').text('\u20B1 ' + parseFloat(data['totalCapital']).toLocaleString())
    $('#valid-total-profit').text('\u20B1 ' + parseFloat(data['totalProfit']).toLocaleString())
}

function setTotalSummary(valid,invalid) {
    $('#summary-total-sales').text('\u20B1 ' + parseFloat(valid['totalProfit']).toLocaleString())
    $('#summary-total-loss').text('\u20B1 ' + parseFloat(invalid['totalLoss']).toLocaleString())
    $('#summary-total-amount').text('\u20B1 ' + subtract(valid['totalProfit'],invalid['totalLoss']).toLocaleString())
}

function setDeliverySummary(data) {
    $('#generate-left-delivery-quantity').text(parseInt(data['totalItem']).toLocaleString())
    $('#generate-left-delivery-cost').text('\u20B1 ' + parseFloat(data['totalCost']).toLocaleString())
}

function setTab() {
    const interval = setInterval(()=> {
        const sales = $('#generate-tab-sales')
        const voids = $('#generate-tab-void')
        const delivery = $('#generate-tab-delivery')

        sales.off('click')
        sales.on('click',()=> {
            setVisibility()
            $('#generate-tab-sales-body').removeClass('d-none')
            $('#generate-tab-sales').addClass('bg-opacity-75')
            sales.addClass('active')
        })

        voids.off('click')
        voids.on('click',()=> {
            setVisibility()
            $('#generate-tab-void-body').removeClass('d-none')
            $('#generate-tab-void').addClass('bg-opacity-75')
            voids.addClass('active')
        })

        delivery.off('click')
        delivery.on('click',()=> {
            setVisibility()
            $('#generate-tab-delivery-body').removeClass('d-none')
            $('#generate-tab-delivery').addClass('bg-opacity-75')
            delivery.addClass('active')
        })

        if(sales.length === 1 && voids.length === 1 && delivery.length === 1) clearInterval(interval)
    },1000)
}

function setVisibility() {
    $('#generate-tab-sales').addClass('bg-opacity-25')
    $('#generate-tab-void').addClass('bg-opacity-25')
    $('#generate-tab-delivery').addClass('bg-opacity-25')
    $('#generate-tab-sales-body').addClass('d-none')
    $('#generate-tab-void-body').addClass('d-none')
    $('#generate-tab-delivery-body').addClass('d-none')
    $('#generate-tab-sales').removeClass('active')
    $('#generate-tab-void').removeClass('active')
    $('#generate-tab-delivery').removeClass('active')
    $('#generate-tab-sales').removeClass('bg-opacity-75')
    $('#generate-tab-void').removeClass('bg-opacity-75')
    $('#generate-tab-delivery').removeClass('bg-opacity-75')
}