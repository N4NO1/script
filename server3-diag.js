var request = require('request')
const { Console } = require("console")
var AWS = require('aws-sdk')
const interval = process.argv[2] || 10000
const timeDelay = 100
// Set the region 
AWS.config.update({region: 'eu-west-1'})

console.log("Overwatch started")

const emails = [
    'n.rouse@stok.ly',
    'd.preece@stok.ly'
]

var sites = [
    {
        url: "stok.ly",
        errors : 0
    },
    {
        url: "annadavies.co.uk",
        errors: 0
    },
    {
        url: "imperialteas.co.uk",
        errors: 0
    }
]



setInterval(async function checkServer(){
    console.log("Overwatch Running")
    // console.log(sites)
    for(var site in sites) {
        
        const siteOptions = {
            url: "https://" + sites[site].url,
            method: "GET"
        }   
        // console.log(siteOptions)
        const startTime = new Date()
        const siteResponse = await makeRequest(siteOptions)
        const endTime = new Date()
        const reqTime = endTime - startTime
        console.log(sites[site].url, "responded " + siteResponse.response.statusCode + " in " + reqTime +"ms")
        if (siteResponse.response.statusCode != 200 ) {
            sites[site].errors++
        }
        else{
            sites[site].errors = 0
        }
    }


    // console.log(sites)
    var body = await anyErrors()
    console.log(body)
    if (body == null) {}
    else {
        const emailsSuccessful = await sendEmail(body)
        if (emailsSuccessful == true) {console.log("email notification succeessfully queued")}
        else {console.log("email notification failed")}
    }

    console.log("Waiting")

}, interval)



async function anyErrors() {
    var htmlBody = ""
    for (var site of sites) {
        if (site.errors > 1) {
            htmlBody = htmlBody + ("<p>Site https://" + site.url + " has not been reachable for 2+ attempts (current interval : " + interval + "ms </p>")
        }
    }
    if (htmlBody == "") {return null}
    else {return htmlBody}
}



function makeRequest(options, retryAttempt = 0){
    return new Promise((resolve, reject) =>{
        setTimeout(() => request(options, (error, response, body) => {
            if (error) {
                if (retryAttempt >= 1) { return reject(error || "Retryed 1 time and failed.") }
                // try the request again 
                return makeRequest(options, retryAttempt + 1)
            }
            if (response.statusCode < 200 && response.statuscode > 299) {return reject(new error(body))}
            return resolve({body, response})
        }),timeDelay)
    })
}



async function sendEmail(bodyHtml) {

    var params = {
        Destination: { /* required */
          ToAddresses: emails
        },
        Message: { /* required */
          Body: { /* required */
            Html: {
             Charset: "UTF-8",
             Data: bodyHtml
            },
           },
           Subject: {
            Charset: 'UTF-8',
            Data: 'URGENT - server3 site issue report'
           }
          },
        Source: 'user@stok.ly', /* required */
      }

      var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise()
      
      sendPromise.then(
        function(data) {
        //   console.log(data.MessageId)
          return true
        }).catch(
          function(err) {
        //   console.error(err, err.stack)
          return false
        })
}