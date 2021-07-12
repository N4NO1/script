var request = require("request")
const accessToken= process.argv[2]
const environment = process.argv[3] || "dev"
const timeDelay = process.argv[4] || 0
const channelId = process.argv[5]
if (channelId === "help"){
    console.log("node index.js accessToken [environment (default=dev)] [timeDelay (default=0)] channelId"),
    process.exit(1)
    }
if (!(channelId && accessToken)) {
    console.log("missing arguments")
    console.log("node index.js accessToken [environment (default=dev)] [timeDelay (default=0)] channelId")
    process.exit(1)
}
handleChannel(channelId)

async function handleChannel(channelId){

    const getTotalOptions={
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/channels/" + channelId +"/listings?size=1&filter=(%5BdataSynchronised%5D%3A%3A%7B0%7D)%26%26(%5Bstatus%5D!%3D%7B2%7D)",
            method: "GET",
            headers: {authorization: "Bearer " + accessToken}
    }

    const totalResponse = await makeRequest(getTotalOptions)
    const totalData = JSON.parse(totalResponse.body)
    console.log("Listing Total:", totalData.metadata.count)
    for (var i=0;i+1 <= Math.ceil(totalData.metadata.count/100) ; i++){
        const channelOptions={
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/channels/" + channelId +"/listings?size=100&filter=(%5BdataSynchronised%5D%3A%3A%7B0%7D)%26%26(%5Bstatus%5D!%3D%7B2%7D)&page="+i,
            method: "GET",
            headers: {authorization: "Bearer " + accessToken}
        }
    const channelResponse = await makeRequest(channelOptions)

    console.log("GET",(i*100)+1, "to",(i+1)*100 > totalData.metadata.count ? totalData.metadata.count : (i+1)*100,"of",totalData.metadata.count ,"--", channelResponse.response.statusCode, channelResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + channelResponse.body.message)
    
    const channelData = JSON.parse(channelResponse.body)
    console.log("removing overide of",channelData.data.length, "listings")
    for (const listing of channelData.data){
        const getOptions={
            url: "https://api.stok.ly/v0/listings/"+listing.listingId,
            method: "GET",
            headers: {authorization: "Bearer " + accessToken},
            json: true,
        }

        getListingData = await makeRequest(getOptions)
        console.log("GET",getOptions.url,getListingData.response.statusCode, getListingData.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + getListingData.body.message || "No Body")
       const listingOptionsConst = listingOptions(listing.listingId, false,getListingData.body.data)
        listingResponse = await makeRequest(listingOptionsConst)
        console.log("PATCH",listingOptionsConst.url,listingResponse.response.statusCode, listingResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + listingResponse.body.message || "No Body")
    }
    }
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
function listingOptions(listingId, overideAll =Boolean, listingBody) {
    const options ={
    url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/listings/" + listingId,
    method: "PATCH",
    headers: {authorization: "Bearer " + accessToken},
    json: true,
}
if (overideAll === true) {
    options.body ={
        data:{
        ageRestriction: null,
        allowNegativeInventory: null,
        attributes: [],
        barcode: null,
        channelSpecifics: [],
        description: null,
        listIndividually: true,
        manufacturer: null,
        maximumQuantity: null,
        minimumMargin: null,
        minimumQuantity: null,
        mpn: null,
        salePrice: null,
        sku: null,
        taxRate: null,
        weight: null,
        }
    }
} else {
    listingBody.sku = null
    listingBody.salePrice = listingBody.data.salePrice
    listingBody.description = listingBody.data.description ?? null
    listingBody.attributes = listingBody.data.attributes ?? null
    delete listingBody.data
    options.body = {data:listingBody}
}
return options
}