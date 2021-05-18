const request = require("request")
var dateString = String()
module.exports = handleRow
let counter = 0
function handleRow(accessToken, environment) {
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
                    variantItems:[variantIds]
                }
            }
            //console.log(options.body)
            request(options, function handlePostResponse(error, response, body) {
                var date = new Date()
                console.log(counter+1,date.toISOString(),"PATCH", options.url, "--", response.statusCode, response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + body.message)   
                counter++        
                return resolve()
            })
        })
    }
}