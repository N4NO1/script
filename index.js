const csv = require("csv-parser")
const fs = require("fs")
const handleRow = require("./post")
const request = require("request")
const { getHeapCodeStatistics } = require("v8")
const source = process.argv[2]
const accessToken = process.argv[3]
const environment = process.argv[4] || "dev"
const timeDelay = process.argv[5] || 0
if (!(source && accessToken)) {
    console.log("missing arguments")
    console.log("node index.js sourceFile accessToken [environment (default=dev)] timeDelay")
    process.exit(1)
}
channelRequest("84e87056-e624-41fc-bc01-37f28ef3931b")
let bodyarray = []
let listingIdArray=[]
function channelRequest(channelId) {
    return new Promise((resolve, reject) =>{
        const options = {
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/channels/" + channelId +"/listings?size=5",
            method: "GET",
            headers: {authorization: "Bearer " + accessToken}
        }
    request(options, function handlePostResponse(error,response,body) {
            bodyarray = JSON.parse(body).data
            console.log(response.statusCode)
            //console.log(i, bodyarray[index],bodyarray.length)
            bodyarray.forEach(function(element) {
                listingIdArray.push(element.listingId)
            })
            console.log(listingIdArray)
        return resolve()
        })
    })
}

    
//var length = 0

// const sum = fs.createReadStream(source) //Initial read of file -> gets line count
// .pipe(csv({mapHeaders: ({header, index}) => header.trim}))
// .on("data", () => {length++})
// .on("end", () => {
//     //console.log(length)

//     const processData = handleRow(accessToken, environment, length) //passes data to function in post.js to send requests

    
//     // const stream = fs.createReadStream(source) //filestream to send csv data for requests
//     // .pipe(csv({
//     //     mapHeaders: ({ header, index }) => header.trim()
//     // }))
//     // .on("data", (data) => {
//     //     stream.pause()
//     //     processData(data).then(() => { setTimeout(() =>{stream.resume()},timeDelay) })
//     // })
//     // .on("end", () => { console.log("done") })
// })