This repository contains scripts that I have compiled

Current list includes:
===
[accountBalance.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/accountBalance.js)
---
This will update the account balance of customers from their barcode.  it uses the [balances.csv](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/Input%20CSVs/balances.csv) file to input data.

```node
node accountBalance.js :accessToken :environment :companyId :timeDelay
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|
|companyId|The companyId of the account|
|timeDelay|API request time delay|300

[addAttributes.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/addAttributes.js)
---
This will append attributes onto an entire accounts' item types.  This will not affect currently assigned attributes.

**You must provide an attribute array directly into the code**

```node
node addAttributes.js :accessToken :environment
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|



[collectItems.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/collectItems.js)
---
This will mark sale orders as collected in a specified account.  sale orders can be omitted using their sale ID.  **It uses [ignore.csv](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/Input%20CSVs/ignore.csv) to input data.**

```node
node collectItems.js :accessToken :environment :timeDelay :locationId
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|
|timeDelay|API request time delay|0
|locationId|The locationID to collect items from|

[confirmStock.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/conmfirmStock.js)
---
This will check the value of inventory displayed on the item list, compared to the data in an items location data.

```node
node confirmStock.js :accessToken :environment :timeDelay
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|
|timeDelay|API request time delay|250

[copyMappings.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/copyMappings.js)
---
This will copy the mappings from 1 channel to another. 

```node
node copyMappings.js :accessToken :fromChannel :toChannel :companyID
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|fromChannel|The channel ID to copy mappings from|
|toChannel|The channel ID to copy mappings to|
|companyId|The companyId of the account|

[createItemTypes.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/createItemTypes.js)
---
This will create item types from a list of names provided. It uses the [itemtypes.csv](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/Input%20CSVs/itemtypes.csv) file to input data.

```node
node createItemTypes.js :accessToken :environment :timeDelay
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|
|timeDelay|API request time delay|300|

[listingOveride.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/listingOveride.js)
---
This will work through every listing in a channel and remove all of the overides, or selected ones depending on configuration.

```node
node listingOveride.js :accessToken :environment :channelId
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|
|channelId|Channel ID to remove the overides from|

[removeImages.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/removeImages.js)
This script will remove the images from items where their ID is specified in [removeimages.csv](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/Input%20CSVs/removeimages.csv) 

```node
node removeImages.js :accessToken :environment
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|

[salesScaleTest.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/salesScaleTest.js)
---
This will test the horizontal scaling of the sales service. This ensures that more services/workers are started when lag could be experienced. only the account causing the lag should be affected.

```node
node salesScaleTest.js :accessToken :environment
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|

[scheduleSync.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/scheduleSync.js)
---
This will take this CSV [listings.csv](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/Input%20CSVs/listings.csv)of SKUs and schedule them to sync in a defined channel

```node
node scheduleSync.js :accessToken :environment :timeDelay
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|

[skuChange.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/skuChange.js)
---
This will take this CSV [skuinput.csv](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/Input%20CSVs/skuinput.csv) of existing SKUs and the SKUs to change to.  It will search for the existing SKU, if found it will update it to the new value.

```node
node skuChange.js :accessToken :environment :searchMethod :timeDelay
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|
|searchMethod|exact or contain|
|timeDelay|API request time delay|100|

[updatesaleorders.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/updatesaleorders.js)
---
This will run through all the sale orders of an account, getting 100 at a time, then patching an empty body.  This updates the sale order.  Originally used to hot-fix a sale order bug.

```node
node updateSaleOrders.js :accessToken :environment :timeDelay
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|
|timeDelay|API request time delay|100|

[updateTypes.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/updateTypes.js)
---
This will work through all of the item types in an account and effectively click save on them.  This resolves any issues with attributes showing that are deleted on items.

```node
node updateTypes.js :accessToken :environment
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|
|environment|dev or prod|dev|

[varianceResolve.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/varianceResolve.js)
---
This will work through an accounts variances and resolve them so that no inventory changes occur.

```node
node varianceResolve.js :accessToken
```
|Argument|Values Accepted|Default Value|
|:---:|:---:|:---:|
|accessToken|Bearer Token for authentication|