var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const { Console } = require("console")
const accessToken= process.argv[2]
const environment = process.argv[3] || "dev"

const stream = fs.createReadStream("Input CSVs\\removeimages.csv")
.pipe(csv({
    mapHeaders: ({header, index}) => header.trim()
}))
.on("data", (data) =>{
    stream.pause()
    const {itemId} = data
    handleId(itemId).then(() => { setTimeout(() =>{stream.resume()},csvDelay) })
})
.on("end", () => { 
    console.log("Done")
})



async function handleId(itemId) {

    const patchOptions = {
        url: "https://api."+(environment === "prod"?"":"dev.")+"stok.ly/v0/items/"+ itemId,
        method: "PATCH",
        headers: {authorization: "Bearer " + accessToken},
        json: true,
        body: {images: []}
    }

    const patchResponse = await makeRequest(patchOptions)
    console.log("PATCH",itemId,patchResponse.response.statusCode, patchResponse.response.statusCode === 202 ? "success" : "error --" + patchResponse.response.body || "No Body")
}



function makeRequest(options, retryAttempt = 0){
    return new Promise((resolve, reject) =>{
        request(options, (error, response, body) => {
            if (error) {
                if (retryAttempt >= 1) { return reject(error || "Retryed 1 time and failed.") }
                // try the request again 
                return makeRequest(options, retryAttempt + 1)
            }
            if (response.statusCode < 200 && response.statuscode > 299) {return reject(new error(body))}
            return resolve({body, response})
        })
    })
}