var request = require('request')
const { Console } = require("console")
const dateRegex = /[1-2][0-9]{3}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/
const timeDelay = 200

var accessTokenGlobal = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImlYdXRBMEtfZEpFaXBOVEZqcXRHRCJ9.eyJodHRwczovL2FwaS5zdG9rLmx5L3VzZXJJZCI6IjY0OWZkMmMwLTNjYjUtNDlmMy04NGJlLTdkMDI4NGI4NTg1NCIsImh0dHBzOi8vYXBpLnN0b2subHkvY29ubmVjdGlvbiI6InBvaW50dG9wb2ludCIsImlzcyI6Imh0dHBzOi8vc3Rva2x5LXByb2R1Y3Rpb24tMy5ldS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NWZhMDFhNzYzMTIxMDEwMDc2MzZlMDM1IiwiYXVkIjpbImh0dHBzOi8vY29yZS1hcGkuc3Rvay5seS8iLCJodHRwczovL3N0b2tseS1wcm9kdWN0aW9uLTMuZXUuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY0NjIxNTkwMCwiZXhwIjoxNjQ2MzAyMzAwLCJhenAiOiJEYjZKRnVEUjVGTGhmY2xMMDlsRWU5Z24wenowTXczOSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUiLCJndHkiOiJwYXNzd29yZCJ9.BqAkOLb4ZXxrM0B4oA3nOI_qXrghESTphcWn1fe9IWKktD4IOeag-QrfRnbXT1ZC8JJWmvY7Gaonb2hTFug-jNBvsQqIZ3ImYC0Xcbw-Wb01P4pQKaVHDGT05RbkD7P6JV4ybdHAsnxelrDKDcKO2U9ihGOoWa5scTIAhnrj3Od2EeU9sT29nbYHEHVFyYwNvBVdUxOmW_OL8vY7SeFx63JXZyr0zKqwZmhydvdj1own7VQrmSEnUAUMPt7634xqFjTqV5dj3xAyjKsBLz8bNsL7OqnudUaoFz7507GHfmdMNQLHC-leuY7sivrBbBYfVOgIfFIjR1OVGx84wkZrgQ"


movementControl(accessTokenGlobal, "production")

async function movementControl(accessToken, environment = "dev") {
    var page = 0
    var pageResponseObject = {}


    do {

        pageResponseObject = await getMovementPage(accessToken, 100, page, environment)
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


async function getMovementPage(accessToken, pageSize = 100, pageNumber = 0, environment = "dev", fromDate = "", toDate = "") {
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
        uri: "https://api." + (environment === "production" ? "" : "dev.") + "stok.ly/v0/inventory-movements"+filter,
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