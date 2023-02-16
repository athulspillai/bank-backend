//import dataservice
const dataservice = require('./services/dataservice')

// import express in index.js
const express = require('express')

//import jsonwebtoken
const jwt = require('jsonwebtoken')

//import cors in index.js
const cors = require('cors')

// create server app using express
const server = express()

//use cors to define origin
server.use(cors({
    origin: 'http://localhost:5200'
}))

//to parse json data
server.use(express.json())

// set up port number for server app
server.listen(3000, () => {
    console.log('server started at 3000');
})

//application specific middleware
const appMiddleware = (req,res,next)=>{
    console.log('inside application middleware ');
    next()
}
server.use(appMiddleware)

//token verify middleware
const jwtMiddleware =(req,res,next)=>{
    console.log('inside router middleware');
    //get token from req headers
    const token = req.headers['token']
    try{//verify token
     const data = jwt.verify(token,'supersecretkey123')
     console.log(data);
     req.fromacno = data.currentAcno
     console.log('Valid Token');
     next()
    }
    catch{
        console.log('Invalid Token');
        res.status(404).json({
            message:'Please Login!!'
        })

    }
     

}


// bank app front end request resolving
server.post('/register', (req, res) => {
    console.log('inside register function');
    console.log(req.body);
    dataservice.register(req.body.uname, req.body.acno, req.body.pswd)
        .then((result) => {
            res.status(result.statusCode).json(result)

        })

})

// login api call resolving
server.post('/login', (req, res) => {
    console.log('inside login function');
    console.log(req.body);
    dataservice.login(req.body.acno, req.body.pswd)
        .then((result) => {
            res.status(result.statusCode).json(result)

        })

})

//getbalance api
server.get('/getbalance/:acno',jwtMiddleware, (req, res) => {
    console.log('inside getbalance Api');
    console.log(req.params.acno);
    dataservice.getbalance(req.params.acno)
        .then((result) => {
            res.status(result.statusCode).json(result)

        })

})

//deposit api

server.post('/deposit',jwtMiddleware, (req, res) => {
    console.log('inside deposit Api');
    console.log(req.body);
    dataservice.deposit(req.body.acno,req.body.amount)
        .then((result) => {
            res.status(result.statusCode).json(result)

        })

})

//fundtransfer api

server.post('/fundtransfer',jwtMiddleware, (req, res) => {
    console.log('inside fundtransfer Api');
    console.log(req.body);
    dataservice.fundtransfer(req,req.body.toacno,req.body.pswd,req.body.amount)
        .then((result) => {
            res.status(result.statusCode).json(result)

        })

})

//get all transaction

server.get('/all-transaction',jwtMiddleware,(req,res)=>{
    console.log('inside getalltransaction api');
    dataservice.getalltransaction(req)
    .then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//delete account api

server.delete('/delete-account/:acno',jwtMiddleware, (req, res) => {
    console.log('inside delete account Api');
    console.log(req.params.acno);
    dataservice.deletemyaccount(req.params.acno)
        .then((result) => {
            res.status(result.statusCode).json(result)

        })

})




