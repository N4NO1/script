var request = require("request")
const accessToken= process.argv[2]
const environment = process.argv[3] || "dev"
const timeDelay = process.argv[4] || 0
if (timeDelay === "help"){
    console.log("node updatesaleorders.js accessToken [environment (default=dev)] [timeDelay (default=0)]"),
    process.exit(1)
    }
if (!(accessToken)) {
    console.log("missing arguments")
    console.log("node index.js accessToken [environment (default=dev)] [timeDelay (default=0)]")
    process.exit(1)
}
handleSales()
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
        url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders?sortDirection=ASC&page="+pageNumber,
        method: "GET",
        headers: {authorization: "Bearer " + accessToken}
        }

    const pageResponse = await makeRequest(saleOptions)
    console.log("GET","total orders:",totalData.metadata.count ,"--", pageResponse.response.statusCode, pageResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + pageResponse.body.message)
    // console.log(saleResponse)
    results = JSON.parse(pageResponse.body).data.length
    console.log("Got",results,"Orders")
    for (var i=0;i <= (results-1); i++){
        console.log("page:",pageNumber,"Order:",i+1)
        //start of loop
        var saleId =""
        saleId= JSON.parse(pageResponse.body).data[i].saleOrderId
        // console.log(saleId)
        const patchOptions={
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v1/saleorders/"+saleId,
            method: "Patch",
            headers: {authorization: "Bearer " + accessToken},
            json: true,
            body: { }
        }
        const postResponse = await makeRequest(patchOptions)
        console.log("PATCH",saleId,postResponse.response.statusCode, postResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + postResponse.body.message)
        console.log()

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