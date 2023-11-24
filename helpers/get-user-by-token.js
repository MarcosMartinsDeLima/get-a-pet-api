const jwt = require('jsonwebtoken')
const User = require('../models/User')

const getUserByToken = async (token)=>{
    if(!token){
        resp.status(200).json({message:"Acesso negado"})
    }

    const decoded = jwt.verify(token,'meusecret')
    const userId = decoded.id
    const user = await User.findOne({_id:userId})
    return user
}

module.exports = getUserByToken