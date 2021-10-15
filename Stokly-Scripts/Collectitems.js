var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const { Console } = require("console")
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
    const stream = fs.createReadStream("input CSVs\\ignore.csv")  //stream read checks ignore.csv for sale orders to ignore
    .pipe(csv({
        mapHeaders: ({ header, index }) => header.trim()
    }))
    .on("data", (data) => {
        stream.pause()
        const {ignoreId} = data
        ignoreIdArray.push(ignoreId)
        stream.resume()
    })
    .on("end", () => { 
        console.log(ignoreIdArray)
        handleSales()
    })



async function handleSales(){
    //sets options for first request, this tells us how many orders there are
    const getTotalOptions={
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders?filter=[itemStatuses]::{unprocessed}",
            method: "GET",
            headers: {authorization: "Bearer " + accessToken}
    }

 
    const totalResponse = await makeRequest(getTotalOptions)
    const totalData = JSON.parse(totalResponse.body)
    console.log("Listing Total:", totalData.metadata.count)
    var pageNumber = 0
    var pageSize = 0

    do {
        const saleOptions={
        url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders?filter=[itemStatuses]::{unprocessed}&page="+pageNumber,
        method: "GET",
        headers: {authorization: "Bearer " + accessToken}
        }

    const pageResponse = await makeRequest(saleOptions) || 0
    console.log("GET","total orders:",totalData.metadata.count ,"--", pageResponse.response.statusCode, pageResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + pageResponse.body.message)
    // console.log(saleResponse)
        pageSize = JSON.parse(pageResponse.body).data.length
    for (var i=0;i <= (pageSize-1); i++){
        console.log("Page:"+pageNumber,"||","Order:"+(i+1) +" of " + pageSize)
        //start of loop
        var saleId ="" //defines saleId as a string

        saleId= JSON.parse(pageResponse.body).data[i].saleOrderId
        niceId = JSON.parse(pageResponse.body).data[i].niceId

        //checks if the order Id is on the ignore document
        if (ignoreIdArray.includes(niceId+""))
        {console.log("ignoring order:",niceId)}
        //start of else
        else{
            console.log(saleId)
            //get items on order options
            const saleItemOptions={
                method: "GET",
                headers: {authorization: "Bearer " + accessToken}
            }
            

            saleItemOptions.url = "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders/" +saleId +"/items"
            const saleItemResponse = await makeRequest(saleItemOptions)
            console.log("GET",saleId,saleItemResponse.response.statusCode, saleItemResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + saleItemResponse.body.message)


            var listings =[]
            const saleData = JSON.parse(saleItemResponse.body)
        
            for (const j in saleData.data){
                listings.push({lineId: saleData.data[j].lineId, quantity: saleData.data[j].quantity})
            }

//options for posting the collection request
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
            console.log(collectOptions.url)
        
            console.log(collectOptions.body)

            const postResponse = await makeRequest(collectOptions)
            console.log("POST",saleId,postResponse.response.statusCode, postResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + postResponse.body.message)
            console.log()
    
        }
        //end of else
        //end of loop
    }
    pageNumber++
} while (pageSize === 100 )
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