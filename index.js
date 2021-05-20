const csv = require("csv-parser")
const fs = require("fs")
const handleRow = require("./post")

const source = process.argv[2]
const accessToken = process.argv[3]
const environment = process.argv[4] || "dev"
const timeDelay = process.argv[5] || 0



if (!(source && accessToken)) {
    console.log("missing arguments")
    console.log("node index.js sourceFile accessToken [environment (default=dev)] timeDelay")
    process.exit(1)
}

var length = 0

const sum = fs.createReadStream(source) //Initial read of file -> gets line count
.pipe(csv({mapHeaders: ({header, index}) => header.trim}))
.on("data", () => {length++})
.on("end", () => {
    //console.log(length)

    const processData = handleRow(accessToken, environment, length) //passes data to function in post.js to send requests

    const stream = fs.createReadStream(source) //filestream to send csv data for requests
    .pipe(csv({
        mapHeaders: ({ header, index }) => header.trim()
    }))
    .on("data", (data) => {
        stream.pause()
        processData(data).then(() => { setTimeout(() =>{stream.resume()},timeDelay) })
    })
    .on("end", () => { console.log("done") })
})