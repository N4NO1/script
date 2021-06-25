var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const accessToken= process.argv[2]
const environment = process.argv[3]
const timeDelay = process.argv[4]
const companyId = process.argv[5]


const stream = fs.createReadStream("Input CSVs\\balances.csv")  //stream read checks ignore.csv for sale orders to ignore
    .pipe(csv({
        mapHeaders: ({ header, index }) => header.trim()
    }))
    .on("data", (data) => {
        stream.pause()
        const {barcode, balance}=data
        handleCustomer(barcode, balance).then(() => { setTimeout(() =>{stream.resume()},timeDelay) })
    })
    .on("end", () => { 
        console.log("Done")
    })
async function handleCustomer(barcode, sheetBalance){
    const customerGetOptions={
        url: "https://"+(environment === "prod" ? companyId+".webapp-" : "")+"api." + (environment === "prod" ? "" : "dev." ) + "stok.ly"+(environment==="dev"?"/v0/":"/")+"customers?filter={barcode}::["+barcode+"]",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true,
    }
    const getResponse = await makeRequest(customerGetOptions)
    console.log(customerGetOptions.url)
    if(environment==="prod"){
    if(getResponse.body.total !==0 ){
        await patchCustomer(getResponse.body.items,sheetBalance)
    }
    else {console.warn("prod Customer",barcode,"Not Found")}
}
else if(environment ==="dev"){
    if(getResponse.body.metadata.count !==0 ){
       await patchCustomer(getResponse.body.data,sheetBalance)
    }
    else {console.warn("dev Customer",barcode,"Not Found")}
}
}

async function patchCustomer(data,sheetBalance){
    // console.log(parseFloat(sheetBalance),data[0].accountBalance)
    const correctedBalance = parseFloat(sheetBalance) + parseFloat(data[0].accountBalance)

    const customerPatchOptions={
        url:"https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/customers/"+data[0].customerId,
        method:"PATCH",
        headers:{authorization: "Bearer " + accessToken},
        json:true,
        body:{accountBalance:{
                amount:correctedBalance,
                currency:"GBP"
            }
        }
    }
    //options end here
    console.log("PATCH",data[0].barcode,"£",correctedBalance)
    const patchResponse = await makeRequest(customerPatchOptions)
    console.log("PATCH",data[0].barcode,"--", patchResponse.response.statusCode, patchResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + patchResponse.body.message)
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