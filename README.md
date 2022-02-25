This repository contains scripts that I have compiled

Current list includes:
===
[accountBalance.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/accountBalance.js)
---
1. this will update the account balance of customers from their barcode.  it uses the balances.csv file to input data.

[addAttributes.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/addAttributes.js)
---
1. This will append attributes onto an entire accounts' item types.  This will not affect currently assigned attributes.

[collectItems.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/collectItems.js)
---
1. this will mark sale orders as collected in a specified account.  sale orders can be omitted using their sale ID.  It uses the ignore.csv to input data.

[confirmStock.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/conmfirmStock.js)
---
1. This will check the value of inventory displayed on the item list, compared to the data in an items location data.

[copyMappings.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/copyMappings.js)
---
1. This will copy the mappings from 1 channel to another. 

[createItemTypes.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/createItemTypes.js)
---
1. this will create item types from a list of names provided. It uses the itemtypes.csv file to input data.

[listingOveride.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/listingOveride.js)
---
1. This will work through every listing in a channel and remove all of the overides, or selected ones depending on configuration.

[salesScaleTest.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/salesScaleTest.js)
---
1. This will test the horizontal scaling of the sales service. This ensures that more services/workers are started when lag could be experienced. only the account causing the lag should be affected.

[scheduleSync.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/scheduleSync.js)
---
1. This will take a CSV of SKUs and schedule them to sync in a defined channel

[skuChange.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/skuChange.js)
---
1. This will take a CSV of existing SKUs and the SKUs to change to.  It will search for the existing SKU, if found it will update it to the new value.

[updatesaleorders.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/updatesaleorders.js)
---
1. this will run through all the sale orders of an account, getting 100 at a time, then patching an empty body.  This updates the sale order.  Originally used to hot-fix a sale order bug.

[updateTypes.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/updateTypes.js)
---
1. This will work through all of the item types in an account and effectively click save on them.  This resolves any issues with attributes showing that are deleted on items.

[varianceResolve.js](https://github.com/N4NO1/script/blob/main/Stokly-Scripts/varianceResolve.js)
---
1. This will work through an accounts variances and resolve them so that no inventory changes occur.