var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const accessToken= process.argv[2]
const environment = process.argv[3] || "dev"
const timeDelay = process.argv[4] || 0
const locationId = process.argv[5]
if (locationId === "help"){
    console.log("node index.js accessToken [environment (default=dev)] timeDelay locationId"),
    process.exit(1)
    }
if (!(locationId && accessToken)) {
    console.log("missing arguments")
    console.log("node collectitems.js accessToken [environment (default=dev)] timeDelay locationId")
    process.exit(1)
}
    var ignoreIdArray = []
    const stream = fs.createReadStream("ignore.csv") 
    .pipe(csv({
        mapHeaders: ({ header, index }) => header.trim()
    }))
    .on("data", (data) => {
        stream.pause()
        const {ignoreId} = data
        ignoreIdArray.push(ignoreId)
        ignoreIdArray = ignoreIdArray
        stream.resume()
    })
    .on("end", () => { 
        console.log(ignoreIdArray)
        handleSales()
    })

async function handleSales(){
    //sets options for Get channel request
    const getTotalOptions={
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders",
            method: "GET",
            headers: {authorization: "Bearer " + accessToken}
    }
    //console.log(channelOptions.url)
    const totalResponse = await makeRequest(getTotalOptions)
    const totalData = JSON.parse(totalResponse.body)
    console.log("Listing Total:", totalData.metadata.count)
    var pageNumber = 0
    var results = 0
    do {
        const saleOptions={
        url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders?page="+pageNumber,
        method: "GET",
        headers: {authorization: "Bearer " + accessToken}
        }

    const pageResponse = await makeRequest(saleOptions)
    console.log("GET","total orders:",totalData.metadata.count ,"--", pageResponse.response.statusCode, pageResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + pageResponse.body.message)
    // console.log(saleResponse)

    for (var i=0;i <= (JSON.parse(pageResponse.body).data.length-1); i++){
        results = JSON.parse(pageResponse.body).data.length
        console.log(pageNumber,i)
        //start of loop
        var saleId =""
        saleId= JSON.parse(pageResponse.body).data[i].saleOrderId
        niceId = JSON.parse(pageResponse.body).data[i].niceId

        if (ignoreIdArray.includes(niceId+""))
        {console.log("ignoring order:",niceId)}
        else{
            console.log(saleId)
            const saleItemOptions={
                method: "GET",
                headers: {authorization: "Bearer " + accessToken}
            }
            

            saleItemOptions.url = "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders/" +saleId +"/items"
            const saleItemResponse = await makeRequest(saleItemOptions)
            var listings =[]
            const saleData = JSON.parse(saleItemResponse.body)
            
            for (const j in saleData.data){
                listings.push({lineId: saleData.data[j].lineId, quantity: saleData.data[j].quantity})
            }
            // console.log(listings)
            const collectOptions={
                url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders/"+saleId+"/collect-items",
                method: "POST",
                headers: {authorization: "Bearer " + accessToken},
                json: true,
                body: {
                    items: listings,
                    locationId: locationId
                }
            }
            // console.log(collectOptions)
            // console.log(listings)
            const postResponse = await makeRequest(collectOptions)
            console.log("POST",saleId,postResponse.response.statusCode, postResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + postResponse.body.message)
            console.log()
    
        }
        //end of loop
    }
    pageNumber++
} while (results === 100 )
    console.log("DONE")  
 
}
function makeRequest(options){
    return new Promise((resolve, reject) =>{
        request(options, (error, response, body) => {
            if (error) {return reject(error)}
            if (response.statusCode < 200 && response.statuscode > 299) {return reject(new error(body))}
            return resolve({body, response})
        })
    })
}