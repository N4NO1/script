var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const { Console } = require("console")
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


const searchOptions={
    method: "GET",
    headers: {authorization: "Bearer " + accessToken},
    json: true,
}
const stream = fs.createReadStream("Input CSVs\\listings.csv")
.pipe(csv({
    mapHeaders: ({header, index}) => header.trim()
}))
.on("data", (data) =>{
    stream.pause()
    const {sku} = data
    handleSku(sku).then(() => { setTimeout(() =>{stream.resume()},csvDelay) })
})
.on("end", () => { 
    console.log("Done")
})



async function handleSku(sku){
    searchOptions.url = ("https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/channels/"+channelId +"/listings?filter=[sku]=={"+sku+"}")
    const searchResponse = await makeRequest(searchOptions)
    console.log("GET",searchOptions.url,searchResponse.response.statusCode, searchResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + searchResponse.body.message || "No Body")
    if(searchResponse.response.statusCode === 200){
    if (searchResponse.body.metadata.count !== 0){
    await handleListing(searchResponse.body.data[0])
    } else {console.log("SKU "+sku+" not found")}
}
}


async function handleListing(listing){
    const getOptions={
        url: "https://api." + (environment === "prod" ? "" : "dev." ) +"stok.ly/v0/listings/"+listing.listingId,
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true,
    }

    //Get listing by ID
    getListingData = await makeRequest(getOptions)
    console.log("GET",getOptions.url,getListingData.response.statusCode, getListingData.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + getListingData.body.message || "No Body")

    // true removes all overides, false removes specified overides
   const listingOptionsConst = listingOptions(listing.listingId, false,getListingData.body.data)  

   //Patch listing by ID
   if (getListingData.response.statusCode == 200){
    listingResponse = await makeRequest(listingOptionsConst)
    console.log("PATCH",listingOptionsConst.url,listingResponse.response.statusCode, listingResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + listingResponse.body.message || "No Body")
   } 
   else {
        console.error("GET unsuccessful, skipping PATCH for:" + listing.listingId)
    }
}

function listingOptions(listingId, overideAll =Boolean, listingBody) {
    const options ={
    url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/listings/" + listingId,
    method: "PATCH",
    headers: {authorization: "Bearer " + accessToken},
    json: true,
}


    listingBody.sku = null
    listingBody.salePrice = null
    listingBody.description = listingBody.data.description ?? null
    listingBody.attributes = listingBody.data.attributes ?? null
    listingBody.listIndividually = listingBody.data.listIndividually 
    delete listingBody.data
    options.body = {data:listingBody}

return options
}