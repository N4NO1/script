var request = require("request")
const accessToken = process.argv[2]
const environment = process.argv[3] || "dev"
var current = new Date()
handler()

async function handler() {
    const itemTypes = await getTypes()
    for (const type of itemTypes) {
        const attributeArray = await getAssignedAttributes(type.itemTypeId)
        await patchTypes(attributeArray, type.itemTypeId)
    }
    console.log("done")
}


async function getTypes() {
    const options = {
        url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/item-types?size=1000&filter=[status]!={1}",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true
    }

    const itemTypesResponse = await makeRequest(options)
    
    current = new Date()

    console.log(current.toISOString(),"|","GET Item Types",itemTypesResponse.response.statusCode, itemTypesResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + itemTypesResponse.body.message )
    
    const data = itemTypesResponse.body.data
    
    return data
}

async function getAssignedAttributes(typeId){

    const options = {
        url: "https://api."+(environment === "prod" ? "" : "dev.") + "stok.ly/v0/item-types/"+typeId+"/attributes?size=1000",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
        json: true
    }

    const assignedAttribute = await makeRequest(options)

    current = new Date()

    console.log(current.toISOString(),"|","GET Assigned Attributes -" , typeId,assignedAttribute.response.statusCode, assignedAttribute.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + assignedAttribute.body.message )
    
    var attributeIds = []

    for (const attribute of assignedAttribute.body.data){
        attributeIds.push(attribute.itemAttributeId)
    }

    return attributeIds
}


async function patchTypes(attributeIdArray, typeId){
    const options = {
        url: "https://api."+(environment === "prod" ? "" : "dev.") + "stok.ly/v0/item-types/"+typeId,
        method: "PATCH",
        headers: {authorization: "Bearer " + accessToken},
        json: true,
        body:{
            itemAttributeIds:attributeIdArray
        }
    }

    const patchResponse = await makeRequest(options)

    console.log(current.toISOString(),"|","PATCH Item Types",patchResponse.response.statusCode, patchResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + patchResponse.body.message )

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