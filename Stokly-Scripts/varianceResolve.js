var request = require("request")
const accessToken = process.argv[2]

resolveVariance()


async function resolveVariance(){
    var varianceOptions= {
        url:"",
        method:"GET",
        headers: {authorization: "Bearer " + accessToken}
    }
    var variancePostOptions = {
        url: "",
        method: "POST",
        headers: {authorization: "Bearer " + accessToken},
        json:true,
        body :{
        blemishedCreations: 0,
        dismissals: 0,
        onHandAdjustment : 0,
        Reason:"Mass Resolve"
        }
    }
    var pageNumber = 0
    var countReturned = 0
    do{
        varianceOptions.url = "https://api.stok.ly/v0/variances?filter=([status]::{0})&size=1&page=" + pageNumber
        const oneVariance = await makeRequest(varianceOptions)
        console.log("GET a variance", varianceOptions.url,"--", oneVariance.response.statusCode, oneVariance.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + oneVariance.body.message)
        var countReturned = (JSON.parse(oneVariance.body).data).length
        if ( countReturned > 0) {
            var body= JSON.parse(oneVariance.body).data[0]
            variancePostOptions.url = "https://api.stok.ly/v0/variances/" + body.varianceId+"/resolutions"


            if (body.expected > body.actual) {
                variancePostOptions.body.dismissals = 0
            }
            else{
            variancePostOptions.body.dismissals = Math.abs(body.actual - body.expected)
            }


            const resolve = await makeRequest(variancePostOptions)
            console.log(variancePostOptions.url)
            console.log("Resolve a variance","--", resolve.response.statusCode, resolve.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + resolve.body.message)

            pageNumber++
        }
        console.log("Count Returned", countReturned)
    } while ( countReturned > 0)
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