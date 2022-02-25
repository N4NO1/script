////////////////////////////////////////////////////////////////////////////////////////
//variables in this section are set at runtime or are required modules for this script//
////////////////////////////////////////////////////////////////////////////////////////
var request = require("request")                                                      //
const { Console } = require("console")                                                //
var current = new Date()                                                              //
const accessToken= process.argv[2]                                                    //
const environment = process.argv[3] || "dev"                                          //
////////////////////////////////////////////////////////////////////////////////////////
const timeDelay = 0
control().then(() => {console.log("done")})

//control function
async function control() {
   const itemId = await createItem()
    console.log(itemId)
   await createListing(itemId)

//    await deleteItem(itemId)

}

//create an item
async function createItem() {
    const createOptions = {
        uri: "https://api."+ (environment === "prod" ? "":"dev.") + "stok.ly/v0/items",
        method: "POST",
        json:true,
        body:{
            typeId:"0e0b2a8d-f7ef-45b3-882c-5f68892c609a",
            sku:"scaletest10",
            name:"scaletest",
        },
        headers: {authorization: "Bearer " + accessToken}
    }
    const createdItemResponse = await makeRequest(createOptions)
    current = new Date()

    console.log(current.toISOString(),"|","Create Item ",createdItemResponse.response.statusCode, createdItemResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + createdItemResponse.body.message )

    if (createdItemResponse.response.statusCode == 202){
        return createdItemResponse.body.data.id
    }else{
        return null
    }
}


async function createListing(id) {
    var createListingOptions ={
        uri:"https://api." + (environment === "prod" ? "" : "dev.") + "stok.ly/v0/listings",
        method:"POST",
        json:true,
        headers: {authorization: "Bearer " + accessToken},
        body:{
            data:{
                itemId:id,
                listIndividually:true,
                sku:""
            },
            deniedInventory:0,
            listToChannel: true,
            type:1,
            channelId:"9ff05511-fa94-4f8c-bba2-e69e71324878"
        }
    }

    for ( let i = 0; i < 1000; i++) {
        createListingOptions.body.data.sku = i
        // console.log(createListingOptions)
        const createListingResponse = await makeRequest(createListingOptions)
        current = new Date()

        console.log(current.toISOString(),"|","Create listing :" +i ,createListingResponse.response.statusCode, createListingResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + createListingResponse.body.message )

    }
}

async function deleteItem(id) {

    const deleteOptions = {
        uri:"https://api." + (environment === "prod" ? "" : "dev.") + "/v0/listings/"+id,
        method:"DELETE",
        json:true,
        headers: {authorization: "Bearer " + accessToken}
    }

    const deleteResponse = await makeRequest(deleteOptions)

    console.log(current.toISOString(),"|","Create listing :" +i ,deleteResponse.response.statusCode, deleteResponse.response.statusCode === 202 ? "SUCCESS" : "ERROR -- " + deleteResponse.body.message )

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