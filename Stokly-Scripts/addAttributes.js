var request = require("request")
const fs = require("fs")
const csv = require("csv-parser")
const { Console } = require("console")


const accessToken= process.argv[2]
const environment = process.argv[3]
const attributeIds = [
    "eaa6afc1-ec9e-486b-a113-bba6522dce05","028c84ba-4590-416f-a4e6-796cec5116bf","c2260588-5752-4ec5-947b-4f5a06c6a0e6","c344246b-55f7-4395-a40e-a40409bd8889","9c12c1d5-5c97-482d-b972-a644b9ff14f7","09c336f9-693b-4ae0-a047-16c7fb7b962c","4067f646-a843-4959-9315-4c7ca2e8b679","1e59b1e0-afef-4819-ab83-565c5340a0dc","fc0066cf-830a-4f23-83d9-4bfd263ed665","4836592e-c187-4db3-959c-e35dd72b789a","c4f994b1-7e46-405d-aebf-7f53e8157e8e","d8be2159-fbef-4188-89a3-d9c554976429","70c16ad2-8d17-4229-a970-5d496ef6fc13","8769454d-587f-4564-8950-2cb6b90c8cbe"
]


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