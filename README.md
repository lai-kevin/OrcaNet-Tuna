# This is the README documentation for the btcd API

## Instructions
## 1. If you are on a windows computer, please use a MacOS or Linux computer.

## 2. When you have all the files run the following commands to build BTCD:
```
cd btcd
go build
cd  ./cmd/btcctl
go build

```
## 3. Navitgate back to your project directory and run the following commands to build btcwallet
```
cd btcwallet
go mod tidy
go build
```

## 4. Ensure that you have the necessary binary files for btcd, btcctl, and btcwallet.

## 5. Running the server
```
cd server
go build
go run main.go
```
## 6. Check the btc.conf in the btcd folder. If there is a miningaddr there and it is your first time running the api, delete it.

</br>

## 7. Using Postman
### Set Post Request at: http://localhost:8080/

### <br/>
### Create Wallet 
### http://localhost:8080/createWallet
When a new user wants to create a wallet, the api will generate a 12 char password for them This handler will create a wallet with the password. A wallet address will be generated and open be ready for transactions. No JSON data is needed for input here.**User does not need to go back to login screen to log in the wallet will already be opened.**



### Log In
### http://localhost:8080/login
If a user has an existing wallet, the frontend will ask for the password and send ths password in JSON format to the handler. It will then unlock the wallet if the password is correct.

```
{
    "password": "password_here"
}
```

### Getting Mining Address
### http://localhost:8080/getMiningAddress
This is used for each node to get their mining (wallet) address. This will be useful for when a node wants to send money to you. No JSON data is required here. Handler will write out something like this:
```
{
    "miningAddress": "1GqmeKwUqKdVes6qowDXqStoz4yNfftkHi"
}
```

### Get Balance
### http://localhost:8080/getMiningAddress
Returns the balance of the user like this:
```
{
    "balance": "147.99999773"
}
```

### Mining (Generating Coins)
### http://localhost:8080/mine

Frontend will send a JSON data file to specify the number of blocks (coins) they want to mine.
```
{
    "num_blocks": 2
}
```

### Send To Address (Sending Money)
###  http://localhost:8080/sendToAddress
Frontend will send a JSON data file to specify the address you want to send money to and the amount
```
{
  "address": "1GqmeKwUqKdVes6qowDXqStoz4yNfftkHi",
  "amount": "0.01"
}
```

## Side Notes
### - If there are any issues with running the server, it may be because you do not have the binaries built. 
### - Remember to build in btcd, btcd/cmd/btcctl, and btcwallet directory.
### - Ensure you have the btcd.conf, btcwallet.conf, and btcctl.conf files. You may need to manually copy the .conf files and paste them in your computer's following directories:
/Users/[username]/Library/Application Support/Btcd/btcd.conf
</br>
/Users/[username]/Library/Application Support/Btcctl/btcctl.conf
</br>
/Users/[username]/Library/Application Support/Btcwallet/btcwallet.conf

### - If you already have a wallet, you cannot create another one. To create another wallet remove your existing one. For MacOS run: rm "/Users/[YOUR USERNAME]/Library/Application Support/Btcwallet/mainnet/wallet.db"
