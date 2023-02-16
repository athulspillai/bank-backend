// import db.js
const db = require('./db')
//import jsonwebtoken
const jwt = require('jsonwebtoken')

//register
const register = (uname, acno, pswd) => {

    //check acno is in mongodb-db.users.findOne()
    return db.User.findOne({
        acno
    }).then((result) => {
        console.log(result);
        if (result) {
            return {
                statusCode: 403,
                message: 'Account Already Exist'
            }
        }
        else {
            // to add new user
            const newUser = new db.User({
                username: uname,
                acno,
                password: pswd,
                balance: 0,
                transaction: []

            })
            //to save new user in mongodb use save()
            newUser.save()
            return {
                statusCode: 200,
                message: 'Register successfully'
            }
        }
    })
}

//login 
const login = (acno, pswd) => {
    console.log('inside login function body');
    // check acno,pswd in mongodb
    return db.User.findOne({
        acno,
        password: pswd
    }).then(
        (result) => {
            if (result) {
                //generate a token 
                const token = jwt.sign({
                    currentAcno: acno
                }, 'supersecretkey123')
                return {
                    statusCode: 200,
                    message: 'Login successfully',
                    username: result.username,
                    currentAcno: acno,
                    token
                }
            }
            else {
                return {
                    statusCode: 404,
                    message: 'Invalid Account / Password'
                }
            }
        }
    )

}

//getbalance
const getbalance = (acno) => {
    return db.User.findOne({
        acno


    }).then(
        (result) => {
            if (result) {
                return {
                    statusCode: 200,
                    balance: result.balance

                }
            }
            else {
                return {
                    statusCode: 404,
                    message: 'Invalid Account'
                }
            }
        }
    )

}

//deposit
const deposit = (acno, amt) => {
    let amount = Number(amt)
    return db.User.findOne({
        acno
    }).then((result) => {
        if (result) {
            //acno is present in db
            result.balance += amount
            result.transaction.push({
                type: "Credit",
                fromacno: acno,
                toacno: acno,
                amount
            })
            //update in mongodb
            result.save()
            return {
                statusCode: 200,
                message: `${amount} Successfully Deposit`
            }

        }
        else {
            return {
                statusCode: 404,
                message: 'Invalid Account'
            }
        }
    })




}
//Fund Transfer
const fundtransfer = (req, toacno, pswd, amt) => {
    let amount = Number(amt)
    let fromacno = req.fromacno
    return db.User.findOne({
        acno: fromacno,
        password: pswd
    }).then((result) => {
        // console.log(result);
        if (fromacno == toacno) {
            return {
                statusCode: 401,
                message: "Permission Denied Due To Own Account Fund Transfer!!"
            }
        }
        if (result) {
            //debit account details
            let fromacnobalance = result.balance
            if (fromacnobalance >= amount) {
                result.balance = fromacnobalance - amount
                //credit account details
                return db.User.findOne({
                    acno: toacno
                }).then(creditdata => {
                    if (creditdata) {
                        creditdata.balance += amount
                        creditdata.transaction.push({
                            type: "Credit",
                            fromacno,
                            toacno,
                            amount
                        })
                        creditdata.save();
                        result.transaction.push({
                            type: "Debit",
                            fromacno,
                            toacno,
                            amount
                        })
                        result.save();
                        return {
                            statusCode: 200,
                            message: "Amount Transfer Successfully"
                        }

                    }
                    else {
                        return {
                            statusCode: 401,
                            message: "Invalid Credit Account Number"
                        }
                    }
                })
            }
            else {
                return {
                    statusCode: 403,
                    message: "Insufficient Balance"

                }

            }

        }
        else {
            return {
                statusCode: 401,
                message: "Invalid Debit Account Number/ password"
            }
        }
    }
    )
}

//get all transaction
const getalltransaction = (req) => {
    let acno = req.fromacno
    return db.User.findOne({
        acno
    }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                transaction: result.transaction
            }

        }
        else {
            return {
                statusCode: 401,
                message: "Invalid Account Number"
            }
        }
    })

}

//delete account
const deletemyaccount = (acno) => {
    return db.User.deleteOne({
        acno
    }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: "Account Deleted Successfully"
            }
        }
        else {
            return {
                statusCode: 401,
                message: "Invalid Account"
            }
        }
    })

}


//export
module.exports = {
    register,
    login,
    getbalance,
    deposit,
    fundtransfer,
    getalltransaction,
    deletemyaccount

}