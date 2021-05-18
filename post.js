const request = require("request")
var dateString = String()
module.exports = handleRow
let counter = 0
function handleRow(accessToken, environment, length) {
    return function postData(data) {
        return new Promise((resolve, reject) => {
            const { itemId,variantIds} = data // is this how to grab data from CSV??
            const simpleUrl = "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/variable-items/" + itemId
            const options = {
                url: simpleUrl,
                method: "PATCH",
                headers: {
                    authorization: "Bearer " + accessToken
                },
                json: true,
                body: {
                    variantItems:data.variantIds.split(", ")
                }
            }
            //console.log(options.body)
            var progress = Number
            request(options, function handlePostResponse(error, response, body) {
                var date = new Date()
                progress = counter/length*100
                console.log(progress.toFixed(2) + "%",date.toISOString(),"PATCH", options.url, "--", response.statusCode, response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + body.message)   
                counter++        
                return resolve()
            })
        })
    }
}