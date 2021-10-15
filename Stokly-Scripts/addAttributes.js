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

const attributeIds = [
    "01ec0f5e-8105-4305-9cea-518a6af14b2e",
    "02461b86-dae8-48e6-9cae-3bd879232fa4",
    "033d3c55-3e29-41cf-8df8-081d1257baa5",
    "0871f81e-8261-46f4-af37-67a9eee001c0",
    "0dd18d49-f84c-48c1-b7a3-4b4505b11c40",
    "0e95c84b-6887-438f-a565-6d798c93cfff",
    "1035bf0a-d7ee-4179-8f2a-210b2087f7e7",
    "14741165-d1fe-45cb-b9ff-328abef23a37",
    "14f812cc-70c4-49da-b8f9-8edabe498e11",
    "151bf810-8821-4995-b525-e8dde18f5c9f",
    "15aedee4-e0e1-4b5f-b68d-b929b566a527",
    "17717a69-b5b9-415d-9fb3-9c90682c2868",
    "177a92b1-f592-4635-b043-1f7776bcaadf",
    "177b8f08-6294-4945-b692-99685976ad8d",
    "198a6578-9e41-43e9-bb7f-4e8d839d3d5a",
    "1fbeaafc-a895-4e63-8f8a-2ff6b01d795c",
    "241d0d97-f95a-4c92-865c-f49c79106931",
    "254c02f3-e529-4a53-b1bb-fb644461965b",
    "258fc434-87f7-4b8c-992d-65766e286bfc",
    "276af489-9ffa-4ea1-b360-74c731f13a35",
    "287820f0-9e71-4f2b-b849-338444281005",
    "2a9d984e-8cfd-459f-84f5-16bd0187c5a1",
    "2ba238e2-ef42-4c32-8047-e46b9e67f099",
    "2c8e2b9d-61fe-43d5-91da-767d78a53cb5",
    "2de87127-0970-430c-936e-41a0049a7c75",
    "309b9b53-a3a4-4fb6-8460-31c63b83ed2f",
    "3215c088-0c62-4beb-a796-7bb5a7c3eeba",
    "35c327e5-f7f3-4cd0-a350-b8cb71e47ed6",
    "35cc2f14-750f-4cc8-a997-7e3e99c58fa4",
    "36041c06-9634-46ae-a3c2-d2b74c2314be",
    "37608f75-264b-437e-9e76-37029fff9b86",
    "3bfc33b3-07c0-406e-af20-7f74a2c8bf10",
    "3d7c2e50-8037-4cda-a0e1-5331359655e5",
    "40788740-cf6a-47d5-9e68-e7e075154405",
    "42ef856f-9166-4ce7-91e0-5b3e34b21b05",
    "492c358d-e0cc-4bc6-827c-43647e5fcd7c",
    "4cf9f689-b582-4f9d-9d61-115a1110e8e9",
    "4d717a98-f235-44ca-ba36-7998dfb88066",
    "4ffa6a07-ca79-4efc-86d9-733362d3d413",
    "53e8b6d1-f190-4275-82b8-be8cebf497f7",
    "5873a592-91b0-4568-9b23-be1d34bd9c00",
    "59f3dc35-369b-4285-a8fd-a52313e801a5",
    "5a9ff67d-c36a-487b-b0e4-9ab8803020bf",
    "5d658902-dc6a-4283-8a55-6f2b7177bf69",
    "5da3c1cf-d5d3-45ff-9837-aa9fa6f67935",
    "608fa62f-0e4f-4446-b10a-b3a139599b62",
    "61dbd13f-2de3-4f02-b730-e4ad9b226177",
    "63f696ac-1c4b-4228-a234-898e49402845",
    "66897a14-4e92-4426-9549-d3417f92476e",
    "677c2b6e-c2c1-4568-9a00-d50e329aa6b6",
    "6876abfb-ad0b-4c47-b984-1afe227b6003",
    "6983e770-a98f-4024-a56b-43a006ad43b9",
    "6a91cd89-f29d-45f7-a048-594e7f7e7aa6",
    "73e403cf-46e2-4516-ada2-5d734ee3bf69",
    "74aeb3f7-44e7-42cd-9756-edaeee2f4bba",
    "7830c70a-0ca0-4c2c-9e43-87342afdb4a0",
    "791ddf91-cd37-403c-98fe-6967e807157c",
    "7a21c107-823f-4c9b-988e-a47dad9a2ee6",
    "7ce88dc4-35ae-4606-b5ea-a52a33e3552d",
    "7ff6df62-b437-4c18-90a6-3b1767a6e859",
    "81b76719-5c53-4c99-ad3a-cf70da510770",
    "835ab964-708f-4c4c-92ce-b87ec515dab8",
    "84ee34cf-65fd-4100-a33e-602811b20046",
    "89333438-0409-4b98-bf81-a4617f9408af",
    "916d050b-5fa7-4c01-a6dc-acf843aeef21",
    "97f0353a-6085-479c-a024-c6ec52f9bb46",
    "99f196b3-dc25-48e3-bf3c-7b4aea6f5c6a",
    "9a2b121c-0657-456f-a7e7-2601243ac0b2",
    "9b31605b-e960-49b1-b67b-c5fb04aae862",
    "9c101bd2-acaa-4832-8575-600fb51d26a8",
    "a02ef032-d583-4e06-b8b0-cade09d76df6",
    "a73f3a23-2c07-433d-a1bb-1f7f300db7c4",
    "af503410-f86c-461c-8858-366a75544a62",
    "af95ff97-283b-49b2-b949-a58b3d5927c0",
    "b004da7b-8507-4914-a199-5c31e28e67ac",
    "b16466af-d9c8-47e0-9934-5bb25eb8b56d",
    "b3f0f599-f28e-4c06-9ea6-f37594ad74b1",
    "b55d4dee-b450-4dc1-a37a-6d0b8fc3d5e6",
    "b5edf0f7-5402-4446-a789-709637b720fd",
    "b961be5d-69aa-445d-920a-902f3bac2810",
    "c3860b70-de6f-4b53-8d35-3c2bb353f750",
    "c5abac0e-d4fc-4769-8654-b38b07d1929a",
    "c74dd5a5-9666-454a-91e5-8ce886dfbaae",
    "ca1c80b8-36a4-499d-b6f9-ef2b9991398d",
    "ccd12ee6-3e67-4761-8d3f-5be4d2c3ea9c",
    "cd69083e-cd80-4997-b5a1-e937deb95a43",
    "cf1b0722-ff7d-4faf-b166-22d85810d84b",
    "cf22f389-ab2c-4ad5-8a20-83dfd22b928e",
    "cf7b5803-6644-4b2b-ac63-e5a91ee25469",
    "d25cbb07-442d-4f7b-bc62-f5e783c89af1",
    "d31bb2b1-2c7b-4c4c-8321-ff8d148c7fb1",
    "d42ec925-26f6-47a8-8b02-b46147b3c77e",
    "d4dcc2ed-2d0d-46a6-8968-01aa49a24d44",
    "d5488231-3072-469b-a596-01cd31661a53",
    "d7e92e3d-1e13-4344-9675-1800879949ef",
    "dc0abc8d-09c8-42c2-917d-0087774c54d4",
    "dcf0c031-7e5f-4eaa-bb76-1462faf6a11b",
    "e5b2a792-0d2c-4b83-8564-dcf9e471bc6c",
    "e86f59a2-5153-4a47-9740-3d7a6e220405",
    "ef5b000b-acd6-444e-bd9f-c8110b9c97ac",
    "f3dd5422-3e31-45d4-8e6c-352725750647",
    "f968acc5-403f-44fc-9e3d-1d100ea4ece1",
    "fa5f6f65-14f4-4469-bca1-ebdf7a92cc33",
    "fdb422f6-4fe0-4d21-b7d4-79a69c2afcd8",
    "ff226ddd-f114-41ff-892d-563a79279baf"
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