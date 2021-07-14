var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const accessToken= process.argv[2]
const environment = process.argv[3] || "dev"
const channelId = process.argv[4]
const csvDelay = process.argv[5] || 0
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

// const searchOptions={
//     method: "GET",
//     headers: {authorization: "Bearer " + accessToken},
//     json: true,
// }
// const stream = fs.createReadStream("Input CSVs\\listings.csv")
// .pipe(csv({
//     mapHeaders: ({header, index}) => header.trim()
// }))
// .on("data", (data) =>{
//     stream.pause()
//     const {sku} = data
//     handleSku(sku).then(() => { setTimeout(() =>{stream.resume()},csvDelay) })
// })
// .on("end", () => { 
//     console.log("Done")
// })
// async function handleSku(sku){
//     searchOptions.url = ("https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/channels/"+channelId +"/listings?filter=[sku]=={"+sku+"}")
//     const searchResponse = await makeRequest(searchOptions)
//     console.log("GET",searchOptions.url,searchResponse.response.statusCode, searchResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + searchResponse.body.message || "No Body")
//     if(searchResponse.response.statusCode === 200){
//     if (searchResponse.body.metadata.count !== 0){
//     await handleListing(searchResponse.body.data[0])
//     } else {console.log("SKU "+sku+" not found")}
// }
// }

async function handleChannel(channelId){

    const getTotalOptions={
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/channels/" + channelId +"/listings?size=1&filter=[status]!={2}",
            method: "GET",
            headers: {authorization: "Bearer " + accessToken}
    }
    const totalResponse = await makeRequest(getTotalOptions)
    console.log(totalResponse.response.statusCode, getTotalOptions.url)
    const totalData = JSON.parse(totalResponse.body)
    console.log("Listing Total:", totalData.metadata.count)
    for (var i=0;i+1 <= Math.ceil(totalData.metadata.count/100) ; i++){
        const channelOptions={
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/channels/" + channelId +"/listings?size=100&filter=[status]!={2}&page="+i,
            method: "GET",
            headers: {authorization: "Bearer " + accessToken}
        }
    const channelResponse = await makeRequest(channelOptions)

    console.log("GET",(i*100)+1, "to",(i+1)*100 > totalData.metadata.count ? totalData.metadata.count : (i+1)*100,"of",totalData.metadata.count ,"--", channelResponse.response.statusCode, channelResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + channelResponse.body.message)
    
    const channelData = JSON.parse(channelResponse.body)
    console.log("removing overide of",channelData.data.length, "listings")
    for (const listing of channelData.data){
        await handleListing(listing)
    }
    }
    console.log("DONE")
}
async function handleListing(listing){
    const getOptions={
        url: "https://api.stok.ly/v0/listings/"+listing.listingId,
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true,
    }

    getListingData = await makeRequest(getOptions)
    console.log("GET",getOptions.url,getListingData.response.statusCode, getListingData.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + getListingData.body.message || "No Body")
   const listingOptionsConst = listingOptions(listing.listingId, true,getListingData.body.data)
    listingResponse = await makeRequest(listingOptionsConst)
    console.log("PATCH",listingOptionsConst.url,listingResponse.response.statusCode, listingResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + listingResponse.body.message || "No Body")
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
    listingBody.salePrice = null
    listingBody.description = listingBody.data.description ?? null
    listingBody.attributes = listingBody.data.attributes ?? null
    delete listingBody.data
    options.body = {data:listingBody}
}
return options
}