////////////////////////////////////////////////////////////////////////////////////////
//variables in this section are set at runtime or are required modules for this script//
////////////////////////////////////////////////////////////////////////////////////////
var request = require("request")                                                      //
const fs = require("fs")                                                              //
const csv = require("csv-parser")                                                     //
const { Console } = require("console")                                                //
var current = new Date()                                                              //
////////////////////////////////////////////////////////////////////////////////////////




const accessToken= process.argv[2]
const environment = process.argv[3]


//attributes to add to item types
const addAttributeIds = [
    "2c141905-2ac9-46f8-b42b-dd964750c7ff",
    "6a2d7257-5e73-451f-80e2-3533ba1117b9"
]
var skippedPages = []

getItemPage()


async function getItemPage() {
    var pageNumber = 0
//get 100 item types a page at a time, until less that 100 are returned
    do {

        //set options to get page x from stok.ly
        const getPageOptions = {
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/item-types?size=100&filter=[status]!={1}&page=" + pageNumber,
            method: "GET",
            headers: {authorization: "Bearer " + accessToken},
            json: true
        }

        //send request wait for the response, then store it in a variable. Set the time the response was received
        const itemTypePageFullResponse = await makeRequest(getPageOptions)
        current = new Date()

        //check the status of the response, was it successful? code=200
        console.log(current.toISOString(),"|","GET Item Types",itemTypePageFullResponse.response.statusCode, itemTypePageFullResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + itemTypePageFullResponse.body.message )

        //if the request was successful, get the page length and enter the rest of the code, else skip to next page
        if (itemTypePageFullResponse.response.statusCode == 200) {

            // separate the data array from the response data so the variable is smaller
            itemTypePageBodyData = itemTypePageFullResponse.body.data

            //set the page length for the do/while
            pageLength = itemTypePageBodyData.length

            //for each item type run this loop
            for(itemType of itemTypePageBodyData) {

                //handle item type
               const assignedAttributes = await handleIndividualType(itemType.itemTypeId)

               //if null is returned write a error message, and continue to next iteration
                if (assignedAttributes == null)  {
                    console.error(">>>skipping item type due to request error:" + itemType.name +"<<<")
                    continue
                }
                var outputArray = []
                console.log("adding new attributes")
                for (addAttributeId of addAttributeIds){
                    outputArray.push(addAttributeId)
                }
                console.log("adding existing attributes")
                for (assignedAttributeId of assignedAttributes) {
                    outputArray.push(assignedAttributeId)
                }

                console.log("Existing attribute count :" + assignedAttributes.length, "Added attributes count :" + addAttributeIds, "Output attributes Count :" + outputArray.length)

                if (outputArray.length == (assignedAttributes.length + addAttributeIds.length)) {
                    Console.log("Counts Match, patch item")
                    await patchType(id, outputArray)
                } else {
                    console.error(">>>counts do not match!<<<")
                }
            }

        } else {
            //if page request failed, push page number to array for notice at end
            skippedPages.push(pageNumber)
            console.error(">>>Skipped page #" + pageNumber + "<<<")
        }


        pageNumber++
    } while (pageLength == 100)
}

async function handleIndividualType(typeId) {
    
    //Set options for getting an item type
    const getTypeOptions = {
        url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/item-types/" + typeId +"/attributes?size=1000&filter=[status]!={1}",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true
    }

    const itemTypeFullResponse = await makeRequest(getTypeOptions)
    current = new Date()
        //check the status of the response, was it successful? code=200
        console.log(current.toISOString(),"|","GET Item Types",itemTypeFullResponse.response.statusCode, itemTypeFullResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + itemTypeFullResponse.body.message )

        //check if the request was successful
        if(itemTypeFullResponse.response.statusCode == 200) {
            //create an empty array for existing IDs to be pushed to
            var existingAttributes = []

            for (attribute of itemTypeFullResponse.body.data) {

                //push existing attributes to the array
                existingAttributes.push(attribute.itemAttributeId)
            }

            //return the array as result
            return existingAttributes

        }else {
            //if request failed, return null, skip item type
            return null
        }

}

async function patchType(id, attributeArray){
    
    const patchOptions = {
            url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/item-types/"+id,
            method: "PATCH",
            headers: {authorization: "Bearer " + accessToken},
            json: true,
            body: {
                itemAttributeIds: attributeArray
            }
    }

    const patchResponse = await makeRequest(patchOptions)
    current = new Date()
    
    console.log(current.toISOString(),"|","Patch Item Type:"+id,itemTypeFullResponse.response.statusCode, itemTypeFullResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + itemTypeFullResponse.body.message )

}

function makeRequest(options, retryAttempt = 0){
    return new Promise((resolve, reject) =>{
        request(options, (error, response, body) => {
            if (error) {
                if (retryAttempt >= 1) { return reject(error || "Retryed 1 time and failed.") }
                // try the request again 
                return makeRequest(options, retryAttempt + 1)
            }
            if (response.statusCode < 200 && response.statuscode > 299) {return reject(new error(body))}
            return resolve({body, response})
        })
    })
}