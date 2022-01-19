var request = require("request")
const accessToken = process.argv[2]


async function handler() {
    const itemTypes = await getTypes()

}


async function getTypes() {
    const options = {
        url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/item-types?size=1000&filter=[status]!={1}",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true
    }
}

async function patchTypes(){

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