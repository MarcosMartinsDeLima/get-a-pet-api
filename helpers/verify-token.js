const jwt = require('jsonwebtoken')
const getToken = require('./get-token')

//middleware to validate token
const verifyToken = (req,resp,next)=>{
    if(!req.headers.authorization){
        return resp.status(401).json({message:"Acesso negado"})
    }
    const token = getToken(req)
    
    if(!token){
        return resp.status(401).json({message:"Acesso negado"})
    }

    try{
        const verified = jwt.verify(token,'meusecret')
        req.user = verified
        next()
    }catch{
        return resp.status(400).json({message:"Token invalido"})
    }
}


module.exports = verifyToken