var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const { Console } = require("console")


const accessToken= process.argv[2]
const environment = process.argv[3]
// const attributeIds = [
//     "1adeb93a-bcf1-42d6-9cd9-839e3f64c1d1",
//     "1bde7945-12ac-49c4-a706-31d857a0bbac",
//     "23bf7c3d-cddd-4727-b0ba-45c547022050",
//     "4aef8a2e-8d24-4104-a123-7c77b7803837",
//     "59728882-dcd3-4e6b-859a-e432e89c9d62",
//     "610fb8c5-bea0-423a-b566-1356c1d5c526",
//     "a631b87c-fa95-4736-81ab-a404a7720530",
//     "fe80266d-5a94-48e6-8827-88407d723bd1"
// ]


typeControl()

async function typeControl() {

    const getAllTypesOptions = {
        url: "https://api." + (environment === "prod" ? "" : "dev." ) + "stok.ly/v0/item-types?size=1000&filter=[status]!={1}",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken}
    }


    const allTypes = await makeRequest(getAllTypesOptions)
    console.log("GET","total item types:",JSON.parse(allTypes.body).metadata.count ,"--", allTypes.response.statusCode, allTypes.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + allTypes.body.message)
    const data = JSON.parse(allTypes.body).data


    for (const itemType of data) {
        await appendAttributes(itemType.itemTypeId)
    }

}

async function appendAttributes(id) {
    const appendOptions = {
        url:"https://api."+(environment === "prod" ? "" : "dev." )+"stok.ly/v0/item-types/"+id,
        method:"PATCH",
        headers: {authorization: "Bearer " + accessToken},
        json:true,
        body:{
            itemAttributeIds: await attributeIdArray(id)
        }
    }

    const postRequest = await makeRequest(appendOptions)
    console.log("PATCH",id ,"--", postRequest.response.statusCode, postRequest.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + postRequest.body.message)
}


async function attributeIdArray(id) {
    const getOneOptions = {
        url:"https://api."+(environment === "prod" ? "" : "dev." )+"stok.ly/v0/item-types/"+id+"/attributes",
        method:"GET",
        headers: {authorization: "Bearer " + accessToken},
    }

    const getOneResponse = await makeRequest(getOneOptions)
    console.log("GET" ,"--", getOneResponse.response.statusCode, getOneResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + getOneResponse.body.message)
    return await createAttributeArray(attributeIds, JSON.parse(getOneResponse.response.body).data)
}


async function createAttributeArray(addIds, currentData) {
    var attributeArray = addIds
    for(var attributeData of currentData) {
        await attributeArray.push(attributeData.itemAttributeId)
    }
    return attributeArray
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