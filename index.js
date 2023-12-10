const express = require('express')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT
const app = express()

//config response json
app.use(express.json())

//solve cors
app.use(cors({credentials:true,origin:'http://localhost:3000'}))

//public folder for images
app.use(express.static('public'))

//routes
const UserRoutes = require('./routes/UserRoutes')
const PetRoutes = require('./routes/PetRoutes')

app.use('/users',UserRoutes)
app.use('/pet',PetRoutes)

app.listen(process.env.PORT)