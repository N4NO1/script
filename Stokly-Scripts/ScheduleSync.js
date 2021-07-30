var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const { Console } = require("console")

const accessToken= process.argv[2]
const environment = process.argv[3] || "dev"
const channelId = process.argv[4]



const stream = fs.createReadStream("Input CSVs\\listings.csv")  //stream read checks ignore.csv for sale orders to ignore
    .pipe(csv({
        mapHeaders: ({ header, index }) => header.trim()
    }))
    .on("data", (data) => {
        stream.pause()
        const {sku}=data
        handleSku(sku).then(() => {stream.resume()})
    })
    .on("end", () => { 
        console.log("Done")
    })

async function handleSku(sku) {
    //set options
    const searchOptions = {
        url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/channels/" + channelId +"/listings?size=1&filter=[sku]=={" + sku + "}",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken}
    }

    var listings = await makeRequest(searchOptions)
    console.log("GET",searchOptions.url, listings.response.statusCode, listings.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + listings.body.message || "No Body")
    if (listings.response.statusCode == 200){
        console.log("Found " + JSON.parse(listings.body).metadata.count)
        listings = JSON.parse(listings.body)
    }
    


    if (listings.metadata.count != 0) {
        const listingId = listings.data[0].listingId
        const syncOptions = {
        url:  "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/listings/" + listingId + "/synchronisations",
        method: "POST",
        headers: {authorization: "Bearer " + accessToken}
        }
        const syncListing = await makeRequest(syncOptions)
        console.log("SYNCED",syncOptions.url,syncListing.response.statusCode, syncListing.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + syncListing.body.message || "No Body")
    } else {
        console.error("SKU not found")
    }
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