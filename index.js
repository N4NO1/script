const csv = require("csv-parser")
const fs = require("fs")
const handleRow = require("./post")

const source = process.argv[2]
const accessToken = process.argv[3]
const environment = process.argv[4] || "dev"

if (!(source && accessToken)) {
    console.log("missing arguments")
    console.log("node attributeRemover sourceFile accessToken [environment (default=dev)]")
    process.exit(1)
}

const processData = handleRow(accessToken, environment)

const stream = fs.createReadStream(source)
.pipe(csv({
    mapHeaders: ({ header, index }) => header.trim()
}))
.on("data", (data) => {
    stream.pause()
    processData(data).then(() => { stream.resume() })
})
.on("end", () => { console.log("done") })