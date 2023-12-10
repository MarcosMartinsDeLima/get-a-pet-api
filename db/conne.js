const mongoose = require('mongoose')
require('dotenv').config()
const DbUri = process.env.DB_URI
async function main(){
    await mongoose.connect(`${DbUri}`)
    console.log('conectou ao mongoose')
}

main().catch((err)=>{
    console.log(err)
})

module.exports = mongoose