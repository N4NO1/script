const request = require("request")

module.exports = handleRow

function handleRow(accessToken, environment) {
    return function postData(data) {
        return new Promise((resolve, reject) => {
            const { itemId,supplierId,cost,supplierSku } = data // is this how to grab data from CSV??

            const simpleUrl = "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/items/" + itemId

            const options = {
                url: simpleUrl,
                method: "PATCH",
                headers: {
                    authorization: "Bearer " + accessToken
                },
                json: true,
                body: {
                    appendUnitsOfMeasure: true,
                    unitsOfMeasure: [{ //data for UOM - no appending
                        itemId: itemId,
                        supplierId: supplierId,
                        supplierSku: supplierSku,
                        cost: {
                            amount: cost,
                            currency: "GBP"
                            },
                        quantityInUnit: 1
                    }]
                }
            
            }
            console.log(options.body)
            request(options, function handlePostResponse(error, response, body) {
                
                console.log("PATCH", options.url, "--", response.statusCode, "--", response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + body.message)           
                return resolve()
            })
        })
    }
}