
$().ready(()=> {
    setInterval(getReport(),1000)
})

function getReport() {

}
function getAllReport() {
    $.ajax({
        url: 'http://localhost:8080/api/transaction/get-all-report',
        success: function (response) {

        }
    })
}