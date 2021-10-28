var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const { Console } = require("console")
const { exit } = require("process")
const accessToken= process.argv[2]
const environment = process.argv[3] || "dev"
const timeDelay = process.argv[4] || 250

var current = new Date()
var outputArray = []
handler()

async function handler() {
    console.log("Starting")
    var pagesize = 0
    var page = 0
    do {
        const pageOptions = {
            url: "https://api."+(environment === "prod" ? "" : "dev." )+"stok.ly/v0/items?filter=[status]!={1}&size=250&page="+page,
            method: "GET",
            headers: {authorization: "Bearer " + accessToken}
        }

        //get a page of 250 items
        current = new Date()
        var pageRequest = await makeRequest(pageOptions)
        console.log(current.toISOString(),"|","GET 250 items|Page:" +(page+1)+" --",pageRequest.response.statusCode, pageRequest.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + pageRequest.body.message )
        
        pageData = JSON.parse(pageRequest.body).data
        pageRequest = null



        pagesize = pageData.length
        if (pagesize == 0) {
            console.log("No Items Left, Exiting")
            exit()
        }
        else {
            var itemNumber = 1
            for (const item of pageData) {
                //set variables from the returned array index
                console.log("page :"+(page+1), "item :", itemNumber)
                const id = item.itemId
                const onHand = item.onHand
                const itemStockOptions = {
                    url: "https://api."+(environment === "prod" ? "" : "dev." )+"stok.ly/v0/items/"+id+"/inventory-movements?size=1",
                    method:"GET",
                    headers: {authorization: "Bearer " + accessToken}
                }
                

                // Get stock History
                current = new Date()
                const itemRequest = await makeRequest(itemStockOptions)
                console.log(current.toISOString(),"|","GET Movement Count for " +id,itemRequest.response.statusCode, itemRequest.response.statusCode === 200 ? "SUCCESS" + " | Count =" + JSON.parse(itemRequest.body).metadata.count : "ERROR -- " + itemRequest.body.message )
                
                
                const count = JSON.parse(itemRequest.body).metadata.count
                
                if (count > 0) {
                    const stockHistory = await comprehendHistory(id)
                    if (stockHistory == null) {continue}
                    // console.log("onHand =" + onHand, "Stock History =" + stockHistory)
                    if(stockHistory != onHand) {
                        var itemout = {
                            id:id,
                            History: stockHistory,
                            onHand: onHand
                        }
                        console.log(id, "Values don't match, writing to file")
                        fs.appendFile("output CSVs\\output.txt", JSON.stringify(itemout)+",", (err) => {
                            if (err) throw err
                            else {
                                console.log("File Written")
                            }
                        })
                    }
                    
                } 
                else {
                    console.log(id+" Has no Stock Movements, skipping")
                }
                console.log("")
                itemNumber++
            }
        }
        page++
    } while (pagesize == 250)
    

}

async function comprehendHistory(id){
    var total = 0
    var page = 0
    var attempt = 1
    do {
        var error = false
        const getMovementPage = {
            url: "https://api."+(environment === "prod" ? "" : "dev." )+"stok.ly/v0/items/"+id+"/inventory-movements?size=1000&page="+page,
            method:"GET",
            headers: {authorization: "Bearer " + accessToken}
        }


        try {
            current = new Date()
            movementRequest = await makeRequest(getMovementPage)
            console.log(current.toISOString(),"|","GET Page "+ (page+1) + " of movements for "+id, movementRequest.response.statusCode, movementRequest.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + movementRequest.body.message)
            if (movementRequest.response.statuscode = 200) {
                pageSize = JSON.parse(movementRequest.body).metadata.count
                pageData = JSON.parse(movementRequest.body).data

                for (const movement of pageData) {
                    total += movement.quantity
                }
                page++
            }
            else {
                console.log("Request Failed, trying again once")
            } 
    
        } catch (error) {
            error = TRUE
            attempt++
        }
        if(attempt == 2) {
            attempt = 1
            console.log("Retry Failed, skipping item.")
            return null
        }
        
    } while (pageSize == 1000 || error == true)

    return total
}



function makeRequest(options, retryAttempt = 0){
    return new Promise((resolve, reject) =>{
        setTimeout(() => request(options, (error, response, body) => {
            if (error) {
                if (retryAttempt >= 1) { return reject(error || "Retryed 1 time and failed.") }
                // try the request again 
                return makeRequest(options, retryAttempt + 1)
            }
            if (response.statusCode < 200 && response.statuscode > 299) {return reject(new error(body))}
            return resolve({body, response})
        }),timeDelay)
    })
}