var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const accessToken= process.argv[2]
const environment = process.argv[3] || "dev"
const timeDelay = process.argv[4] || 300



const stream = fs.createReadStream("Input CSVs\\itemtypes.csv")  //stream read checks ignore.csv for sale orders to ignore
    .pipe(csv({
        mapHeaders: ({ header, index }) => header.trim()
    }))
    .on("data", (data) => {
        stream.pause()
        const {name}=data
        handleItemType(name).then(() => { setTimeout(() =>{stream.resume()},timeDelay) })
    })
    .on("end", () => { 
        console.log("Done")
    })

    async function handleItemType(typeName){
        const options = {
            url:"https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/item-types",
            method:"POST",
            headers: {authorization: "Bearer " + accessToken},
            json: true,
            body:{name:typeName}
        }
        const response = await makeRequest(options)
        console.log("POST","--", response.response.statusCode, response.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + response.body.message)
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