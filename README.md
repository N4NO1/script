This repository contains scripts that I have compiled

Current list includes:
===
accountBalance.js
---
1. this will update the account balance of customers from their barcode.  it uses the balances.csv file to input data.

Collectitems.js
---
1. this will mark sale orders as collected in a specified account.  sale orders can be omitted using their sale ID.  It uses the ignore.csv to input data.

createItemTypes.js
---
1. this will create item types from a list of names provided. It uses the itemtypes.csv file to input data.

updatesaleorders.js
---
1. this will run through all the sale orders of an account, getting 100 at a time, then patching an empty body.  This updates the sale order.  Originally used to hot-fix a sale order bug.
