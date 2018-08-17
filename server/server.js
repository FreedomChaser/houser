require('dotenv').config()
const express = require('express')
const axios = require('axios')
const massive = require('massive')
const bodyParser = require('body-parser')
const session = require('express-session')
const bcrypt = require('bcrypt')

let {SERVER_PORT, SESSION_SECRET, CONNECTION_STRING} = process.env

const app = express()

app.use(bodyParser.json())
app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false
        // optional cookie{} like maxAge
    })
)

massive(CONNECTION_STRING).then(db => {
    app.set('db', db)
})

app.post('/api/newUser', async (req, res, next) => {
    const db = req.app.get('db')
    let {username, password} = req.body
    
    let salt = await bcrypt.genSalt(10)

    let hashedPassword = await bcrypt.hash(password, salt)

    let foundUser = await db.find_user(username)
    console.log('username', username)

    if(foundUser[0]){
        res.status(422).send('Username already exists, if you have previously registered with this site please use login')
    }else{
        let newUser = await db.create_user(username, hashedPassword)
        req.session.userid = newUser.userid

        console.log('newUser', newUser)

        res.sendStatus(200)
    }

})

//app.post login

app.post('/api/logout', (req, res) => {
    req.session.destroy()
    res.sendStatus(200)
})


app.listen(SERVER_PORT, () => {
    console.log(`spellbound on port ${SERVER_PORT}`)
})