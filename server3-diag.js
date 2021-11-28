var request = require('request')
const { Console } = require("console")
var AWS = require('aws-sdk')
// Set the region 
AWS.config.update({region: 'eu-west-1'})

const interval = process.argv[2]

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
    console.log("running")
    // console.log(sites)
    for(var site in sites) {
        
        const siteOptions = {
            url: "https://" + sites[site].url,
            method: "GET"
        }
        console.log(siteOptions)
        const siteResponse = await makeRequest(siteOptions)

        if (siteResponse.response.statusCode != 200 ) {
            sites[site].errors++
        }
        else{sites[site].errors = 0}
    }


    var body = anyErrors()
    if (body = null) {}
    else {
        sendEmail(body)
    }


}, interval)

function anyErrors() {
    var htmlBody = ""
    for (var site of sites) {
        if (site.errors > 1) {
            htmlBody = htmlBody + ("<p>Site https://" + site.url + " has not been reachable for 2+ attempts (current interval : " + interval + "ms </p>")
        }
    }
    if (htmlBody = "") {return null}
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

function sendEmail(bodyHtml) {

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
          console.log(data.MessageId)
        }).catch(
          function(err) {
          console.error(err, err.stack)
        })
}