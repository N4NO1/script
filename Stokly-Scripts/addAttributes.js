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

]
var skippedPages = []

control().then( () => {
console.log(skippedPages.length === 0 ? "Done" : "Done, but skipped pages :" + skippedPages)
control(skippedPages)
})


async function control(pageArray = []) {
    var page = 0
    var length = 0
    if (pageArray.length == 0) {
        do {
       length = await getTypePage(page)
       page ++
    } while (length == 100)
    }
    else{
        var pageNumber = pageArray.shift()
        while (pageNumber != undefined) {
            console.log(">>>Retrying page #" + pageNumber + "<<<")
            await getTypePage(pageNumber)
            pageNumber = pageArray.shift()
            await wait(5000)
        }
        console.log("Retryed all pages")
    }

    
}

async function getTypePage(pageNumber = 0) {

        //get 100 item types a page at a time, until less that 100 are returned
    

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
            console.log(">>>Types returned :" + pageLength + "<<<")
            //for each item type run this loop
            for(const itemType of itemTypePageBodyData) {

                //handle item type
               const assignedAttributes = await getAssignedAttributes(itemType.itemTypeId)

               //if null is returned write a error message, and continue to next iteration
                if (assignedAttributes == null)  {
                    console.error(">>>skipping item type due to request error:" + itemType.name +"<<<")
                    continue
                }
                var outputArray = []
                console.log("adding new attributes")
                for (const addAttributeId of addAttributeIds){
                    outputArray.push(addAttributeId)
                }
                console.log("adding existing attributes")
                for (const assignedAttributeId of assignedAttributes) {
                    outputArray.push(assignedAttributeId)
                }

                console.log("Existing attribute count :" + assignedAttributes.length, "Added attributes count :" + addAttributeIds.length, "Output attributes Count :" + outputArray.length)

                if (outputArray.length == (assignedAttributes.length + addAttributeIds.length)) {
                    console.log("Counts Match, patch item")
                    await patchType(itemType.itemTypeId, outputArray)
                } else {
                    console.error(">>>counts do not match!<<<")
                }
            }

        } else {
            //if page request failed, push page number to array for notice at end
            skippedPages.push(pageNumber)
            console.error(">>>Skipped page #" + pageNumber + "<<<")
        }
            return pageLength

}

async function getAssignedAttributes(typeId) {
    
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

            for (const attribute of itemTypeFullResponse.body.data) {

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
    
    console.log(current.toISOString(),"|","Patch Item Type:"+id,patchResponse.response.statusCode, patchResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + patchResponse.body.message )
    console.log(">>><<<")
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

function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
}