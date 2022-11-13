import {add, ajaxDefaultArray, ajaxUrl, subtract} from "../function.js";
import {charts} from "../variable.js";

const xlsx = require('xlsx')

// const wb = xlsx.utils.book_new()
// const ws = xlsx.utils.json_to_sheet([{'1':'one','2':'two'}])
// xlsx.utils.book_append_sheet(wb,ws,'Sales')
// xlsx.writeFile(wb, path.getDocumentsFolder() + '/AA12.xlsx', {
//     bookType: 'xlsx',
//     type: 'file'
// })

export function startGenerate() {
    setShowButton()
    setTab()
}

function setShowButton() {
    const interval = setInterval(()=> {
        $('#generate-main-show').off('click')
        $('#generate-main-show').on('click',()=> {
            const start = $('#generate-main-start').val()
            const end = $('#generate-main-end').val()
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
        })
        if($('#generate-main-show').length === 1) {
            $('#generate-main-show').prop('disabled',false)
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
            ajaxUrl('/api/inventory/calculate-delivery-' + option,data),

            ajaxUrl('/api/transaction/calculate-product-sales-' + option,data),
            ajaxUrl('/api/inventory/calculate-product-void-' + option,data),
            ajaxUrl('/api/inventory/calculate-product-delivery-' + option,data)
        )
    }

    if(ajax !== undefined) {
        ajax.then((transactionSummary,voidSummary,deliverySummary,transactionProducts,voidProducts,deliveryProducts)=> {
            setValidSummary(transactionSummary[0])
            setVoidSummary(voidSummary[0])
            setTotalSummary(transactionSummary[0],voidSummary[0])
            setDeliverySummary(deliverySummary[0])

            setTransactionProducts(transactionProducts[0])
            setChartData(
                transactionProducts[0],
                'generate-chart-transaction-quantity',
                'generate-chart-transaction-profit',
                'Profit'
            )

            setVoidProducts(voidProducts[0])
            setChartData(
                voidProducts[0],
                'generate-chart-void-quantity',
                'generate-chart-void-profit',
                'Loss'
            )
        })
    }
}

function setVoidProducts(data) {
    $('#generate-right-void-body').empty()
    for(let i in data) {
        const row = `<tr class="d-flex">
                        <th class="col-1 text-start">`+ add(i,1).toLocaleString() +`</th>
                        <td class="col-3 text-start">`+ data[i]['name'] +`</td>
                        <td class="col-1 text-center">`+ parseInt(data[i]['quantity']).toLocaleString() +`</td>
                        <td class="col-1 text-center">&#8369; `+ parseFloat(data[i]['price']).toLocaleString() +`</td>
                        <td class="col-2 text-center">&#8369; `+ parseFloat(data[i]['totalPrice']).toLocaleString() +`</td>
                        <td class="col-2 text-center">&#8369; `+ parseFloat(data[i]['totalCapital']).toLocaleString() +`</td>
                        <td class="col-2 text-center">&#8369; `+ parseFloat(data[i]['profit']).toLocaleString() +`</td>
                    </tr>`
        $('#generate-right-void-body').append(row)
    }
}

function setTransactionProducts(data) {
    $('#generate-right-transaction-body').empty()
    for(let i in data) {
        const row = `<tr class="d-flex">
                        <th class="col-1 text-start">`+ add(i,1).toLocaleString() +`</th>
                        <td class="col-3 text-start">`+ data[i]['name'] +`</td>
                        <td class="col-1 text-center">`+ parseInt(data[i]['quantity']).toLocaleString() +`</td>
                        <td class="col-1 text-center">&#8369; `+ parseFloat(data[i]['price']).toLocaleString() +`</td>
                        <td class="col-2 text-center">&#8369; `+ parseFloat(data[i]['totalPrice']).toLocaleString() +`</td>
                        <td class="col-2 text-center">&#8369; `+ parseFloat(data[i]['totalCapital']).toLocaleString() +`</td>
                        <td class="col-2 text-center">&#8369; `+ parseFloat(data[i]['profit']).toLocaleString() +`</td>
                    </tr>`
        $('#generate-right-transaction-body').append(row)
    }
}

function setChartData(data,quantityContainer,profitContainer,secondChartName) {
    const quantity = []
    const profit = []
    for(let i in data) {
        quantity[i] = {
            'name': data[i]['name'],
            'y': data[i]['quantity']
        }
        profit[i] = {
            'name': data[i]['name'],
            'y': data[i]['profit']
        }
    }
    setChart(quantity,'Quantity',quantityContainer,'Quantity')
    setChart(profit,secondChartName,profitContainer,'Profit')
}

function setValidSummary(data) {
    $('#valid-total-sold').text(parseFloat(data['totalItem']).toLocaleString())
    $('#valid-total-sales').text('\u20B1 ' + parseFloat(data['totalAmount']).toLocaleString())
    $('#valid-total-capital').text('\u20B1 ' + parseFloat(data['totalCapital']).toLocaleString())
    $('#valid-total-profit').text('\u20B1 ' + parseFloat(data['total']).toLocaleString())
}

function setVoidSummary(data) {
    $('#invalid-total-sold').text(parseFloat(data['totalItem']).toLocaleString())
    $('#invalid-total-sales').text('\u20B1 ' + parseFloat(data['totalAmount']).toLocaleString())
    $('#invalid-total-capital').text('\u20B1 ' + parseFloat(data['totalCapital']).toLocaleString())
    $('#invalid-total-loss').text('\u20B1 ' + parseFloat(data['total']).toLocaleString())
}

function setTotalSummary(valid,invalid) {
    $('#summary-total-sales').text('\u20B1 ' + parseFloat(valid['total']).toLocaleString())
    $('#summary-total-loss').text('\u20B1 ' + parseFloat(invalid['total']).toLocaleString())
    $('#summary-total-amount').text('\u20B1 ' + subtract(valid['total'],invalid['total']).toLocaleString())
}

function setDeliverySummary(data) {
    $('#generate-left-delivery-quantity').text(parseInt(data['totalItem']).toLocaleString())
    $('#generate-left-delivery-cost').text('\u20B1 ' + parseFloat(data['totalAmount']).toLocaleString())
}

function setChart(chartData,title,container,name) {
    charts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
        },
        credits: {enabled: false},
        accessibility: {enabled: false},
        title: {text: title},
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.2f} %'
                }
            }
        },
        series: [{
            name: name,
            colorByPoint: true,
            data: chartData
        }]
    })
}

function setTab() {
    const interval = setInterval(()=> {
        const sales = $('#generate-tab-sales')
        const voids = $('#generate-tab-void')
        const delivery = $('#generate-tab-delivery')
        const other = $('#generate-tab-other')

        sales.off('click')
        sales.on('click',()=> {
            setVisibility()
            $('#generate-tab-sales-body').removeClass('d-none')
            sales.addClass('active')
        })

        voids.off('click')
        voids.on('click',()=> {
            setVisibility()
            $('#generate-tab-void-body').removeClass('d-none')
            voids.addClass('active')
        })

        delivery.off('click')
        delivery.on('click',()=> {
            setVisibility()
            $('#generate-tab-delivery-body').removeClass('d-none')
            delivery.addClass('active')
        })

        other.off('click')
        other.on('click',()=> {
            setVisibility()
            $('#generate-tab-other-body').removeClass('d-none')
            other.addClass('active')
        })
        if(sales.length === 1 && voids.length === 1 && delivery.length === 1 && other.length === 1) clearInterval(interval)
    },1000)
}

function setVisibility() {
    $('#generate-tab-sales-body').addClass('d-none')
    $('#generate-tab-void-body').addClass('d-none')
    $('#generate-tab-delivery-body').addClass('d-none')
    $('#generate-tab-other-body').addClass('d-none')
    $('#generate-tab-sales').removeClass('active')
    $('#generate-tab-void').removeClass('active')
    $('#generate-tab-delivery').removeClass('active')
    $('#generate-tab-other').removeClass('active')
}