var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const accessToken= process.argv[2]
const environment = process.argv[3]
const searchMethod = process.argv[4]
const timeDelay = process.argv[5] || 100

if(!(accessToken && environment)){
    console.log("invalid parameters")
    console.log("node skuchange.js accesstoken [environment (prod or dev)] [searchmethod (exact or contain)] [timedelay (default 100ms)]")
    process.exit(1)
}
if(!(environment === "prod" || environment === "dev"))
{
    console.log("invalid enviroment")
    console.log("accepted values: prod, dev")
    process.exit(1)
}
if(!(searchMethod === "exact" || searchMethod === "contain")){
    console.log("invalid searchMethod")
    console.log("accepted values: exact, contain")
    process.exit(1)
}

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
        url: "https://api."+(environment === "prod"?"":"dev.")+"stok.ly/v0/items?filter={sku}"+(searchMethod === "exact"?"==":"::")+"["+searchSku+"]",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true,
    }
    const getResponse = await makeRequest(itemGetOptions)
    console.log("GET",itemGetOptions.url, "--",getResponse.response.statusCode, getResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- "+ getResponse.body.message)
    if(getResponse.response.statusCode === 200 && getResponse.body.metadata.count !== 0){
        var i = 1
        var found = false
        //checks if the correct sku is returned, allows the use of contains in the search above
        if(searchMethod === "exact"){found = true}
        do{
        if(getResponse.body.data[i-1].sku === searchSku){
            console.log("found SKU -",getResponse.body.data[i-1].sku)
            var itemId = getResponse.body.data[0].itemId
            const patchBody = {sku:newSku}
            patchItem(itemId,patchBody)
            found = true
        }
        else if (i>= getResponse.body.metadata.count) {
            console.log("Sku not found in response, skipping value")
        }
        else {
            console.log("sku not found at data index", i-1)
        }
        i++
    } while (i<= getResponse.body.metadata.count&& found === false)
    } else {console.log(getResponse.response.statusCode === 200?"sku not found, skipping value:":"GET error skipping value")}
}

async function patchItem(itemId,body){
    const itemPatchOptions={
        url:"https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/items/"+itemId,
        method:"PATCH",
        headers:{authorization: "Bearer " + accessToken},
        json:true, 
        body:body
    }
    //options end here
    const patchResponse = await makeRequest(itemPatchOptions)
    console.log("PATCH",itemPatchOptions.url,"new sku:"+body.sku,"--", patchResponse.response.statusCode, patchResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + patchResponse.body.message)
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