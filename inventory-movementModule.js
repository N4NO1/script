var request = require('request')
const { Console } = require("console")
const dateRegex = /[1-2][0-9]{3}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/
const timeDelay = 200

var accessTokenGlobal = ""


movementControl(accessTokenGlobal)

async function movementControl(accessToken) {
    var page = 0
    var pageResponseObject = {}


    do {

        pageResponseObject = await getMovementPage(accessToken, 100, page)
        page++

        if (pageResponseObject.length > 0) {
            //what to do if data was returned.
            console.info("Successful Response")
            console.log(pageResponseObject.data[0])
        }
        else {
            console.error("Request failed with status code:",pageResponseObject.statusCode, pageResponseObject.errorMessage)
        }

    } while (pageResponseObject.length == 100)
    
}


async function getMovementPage(accessToken, pageSize = 100, pageNumber = 0, fromDate = "", toDate = "") {
    //Date format [yyyy-mm-dd 00:00:00]
    var filter = "?sortField=date&sortDirection=DESC&size=" + pageSize + "&page=" + pageNumber

    if (fromDate != "" || toDate != "") {
        if (fromDate != "" && toDate != "")
            if (fromDate.match(dateRegex) && toDate.match(dateRegex)) {
                filter += "&(filter={date}>=[" + fromDate + "]&&{date}<=[" + toDate + "])"
            }
            else if (fromDate != "") {
                if (fromDate.match(dateRegex)) {
                    filter += "&filter={date}>=[" + fromDate + "]"
                }
            }
            else {
                if (toDate.match(dateRegex)) {
                    filter += "&filter={date}<=[" + toDate + "]"
                }
            }
    }

    const getRecordPageOptions = {
        uri: "https://api.stok.ly/v0/inventory-movements"+filter,
        method: "GET",
        headers: {
            authorization: "Bearer " + accessToken
        }
    }

    const recordPageResponse = await makeRequest(getRecordPageOptions)

    //console.log("GET", "--", recordPageResponse.response.statusCode, recordPageResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + recordPageResponse.body.message)

    if (recordPageResponse.response.statusCode == 200) {
        var pageDataArray = JSON.parse(recordPageResponse.body).data

        return {
            data: pageDataArray,
            length: pageDataArray.length
        }
    }
    else {
        return {
            length: 0,
            statusCode: recordPageResponse.response.statusCode,
            errorMessage: recordPageResponse.body.message ?? ""
        }
    }

}


function makeRequest(options, retryAttempt = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => request(options, (error, response, body) => {
            if (error) {
                if (retryAttempt >= 1) { return reject(error || "Retryed 1 time and failed.") }
                // try the request again 
                return makeRequest(options, retryAttempt + 1)
            }
            if (response.statusCode < 200 && response.statuscode > 299) { return reject(new error(body)) }
            return resolve({ body, response })
        }), timeDelay)
    })
}
