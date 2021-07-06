var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const accessToken= process.argv[2]
const environment = process.argv[3]
const timeDelay = process.argv[4]


const stream = fs.createReadStream("Input CSVs\\skuinput.csv")  //stream read checks ignore.csv for sale orders to ignore
    .pipe(csv({
        mapHeaders: ({ header, index }) => header.trim()
    }))
    .on("data", (data) => {
        stream.pause()
        const {oldSku, newSku}=data
        handleSku(oldSku,newSku).then(() => { setTimeout(() =>{stream.resume()},timeDelay) })
    })
    .on("end", () => { 
        console.log("Done")
    })
async function handleSku(searchSku, newSku){
    const itemGetOptions={
        url: "https://api."+(environment === "prod"?"":"dev.")+"stok.ly/v0/items?filter={sku}==["+searchSku+"]",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true,
    }
    const getResponse = await makeRequest(itemGetOptions)
    console.log(itemGetOptions.url)
    console.log("GET",itemGetOptions.url, "--",getResponse.response.statusCode, getResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- "+ getResponse.body.message)
    console.log(getResponse.body.data[0].itemId)
    if(getResponse.response.statusCode === 200 && getResponse.body.metadata.count !== 0){
        if(getResponse.body.data[0].sku === searchSku){
            var itemId = getResponse.body.data[0].itemId
            patchItem()
        }
        
    }
}w

async function patchItem(itemId, newSku){
    const itemPatchOptions={
        url:"https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/items/"+itemId,
        method:"PATCH",
        headers:{authorization: "Bearer " + accessToken},
        json:true,
        body:{
                sku:newSku
        }
    }
    //options end here
    const patchResponse = await makeRequest(itemPatchOptions)
    console.log("PATCH","--", patchResponse.response.statusCode, patchResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + patchResponse.body.message)
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