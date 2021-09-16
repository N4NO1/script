var request = require("request")
const accessToken = process.argv[2]
const fromChannel = process.argv[3]
const toChannel = process.argv[4]
const companyId = process.argv[5]
console.log("From Channel ID:", fromChannel)
console.log("To Channel ID", toChannel)

getAllMappings()

async function getAllMappings() {
    const allMappingOptions = {
        url : "https://"+companyId+".webapp-api.dev.stok.ly/channels/" + fromChannel + "/mappings?size=1000&filter=",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken}
    }
    const allMappingResponse = await makeRequest(allMappingOptions)
    console.log("GET all mappings","--", allMappingResponse.response.statusCode, allMappingResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + allMappingResponse.body.message)
    const allMappingArray = JSON.parse(allMappingResponse.body).items
    //console.log(allMappingArray)
    for (const mapping of allMappingArray) {
        await handleMapping(mapping)  
    }
}


async function handleMapping(mapping) {
    const mappingAttributes = await getOneMapping(mapping.mappingId)
    
    const createMappingResponse = await createMapping(mappingAttributes,mapping)
    console.log("POST","--", createMappingResponse.response.statusCode, createMappingResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + createMappingResponse.body.message)
}


async function getOneMapping(id) {
    const oneMappingOptions = {
        url : "https://api.dev.stok.ly/v0/mappings/" + id +"/attributes",
        method: "GET",
        headers: {authorization: "Bearer " + accessToken}
    }

    const response = await makeRequest(oneMappingOptions)
    console.log("GET one mapping",oneMappingOptions.url,"--", response.response.statusCode, response.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + response.body.message)
    const body = JSON.parse(response.body)

    const attributeArray = await convertAttributes(body.data)

    return attributeArray
}


async function convertAttributes(data){
    var attributeArray = []
    var counter = 0
    for (const attribute of data) {
        attributeArray[counter] = {
            localAttributeId : attribute.localAttributeId,
            remoteAttributeId : attribute.remoteAttributeId
        }
        counter++
    }
    return attributeArray
}


async function createMapping(attributes, mappingData) {
    const mappingValues = await getMappingValues(mappingData.mappingId)

    const createOptions = {
        url: "https://"+companyId+".core-api.dev.stok.ly/mappings/",
        method: "POST",
        headers: {authorization: "Bearer " + accessToken},
        json:true,
        body:{
        allowMappingsToTheSameRemote: true,
        attributes: attributes,
        channelId: toChannel,
        label: mappingData.label,
        localMappableId: mappingValues.localMappableId,
        remoteMappableId: mappingValues.remoteMappableId,
        remoteMappableName: mappingValues.remoteMappableName
        }
        
    }
    const createResponse = await makeRequest(createOptions)
    return createResponse
}


async function getMappingValues(id) {
    const getOptions = {
        url: "https://"+companyId+".webapp-api.dev.stok.ly/mappings/" + id,
        method: "GET",
        headers: {authorization: "Bearer " + accessToken},
    }

    const mappingResponse = await makeRequest(getOptions)
    console.log("GET mapping ids",getOptions.url,"--", mappingResponse.response.statusCode, mappingResponse.response.statusCode === 200 ? "SUCCESS" : "ERROR -- " + mappingResponse.body.message)

    return JSON.parse(mappingResponse.body)
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