This repository contains scripts that I have compiled

#Current list includes:
##1. accountBalance.js - this will update the account balance of customers from their barcode.  it uses the balances.csv file to input data.

##2. Collectitems.js - this will mark sale orders as collected in a specified account.  sale orders can be omitted using their sale ID.  It uses the ignore.csv to input data.

##3. createItemTypes.js - this will create item types from a list of names provided. It uses the itemtypes.csv file to input data.

##4. updatesaleorders.js - this will run through all the sale orders of an account, getting 100 at a time, then patching an empty body.  This updates the sale order.  Originally used to hot-fix a sale order bug.
