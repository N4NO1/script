const request = require("request")

module.exports = handleRow

function handleRow(accessToken, environment) {
    return function postData(data) {
        return new Promise((resolve, reject) => {
            const { itemId,supplierId,cost } = data // is this how to grab data from CSV??

            const simpleUrl = "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/items/" + itemId + "/units-of-measure" //UOM endpoint

            const options = {
                url: simpleUrl,
                method: "PATCH",
                headers: {
                    authorization: "Bearer " + accessToken
                },
                json: true,
                body: {
                    data: [{ //data for UOM - no appending
                        itemId: itemId,
                        supplierId: supplierId,
                        cost: cost,
                        currency: "GBP",
                        quantityInUnit: 1
                    }]
                }
            }
            request(options, function handlePostResponse(error, response, body) {
                console.log("PATCH", options.url, "--", response.statusCode, "--", response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + body.message)           
                return resolve()
            })
        })
    }
}