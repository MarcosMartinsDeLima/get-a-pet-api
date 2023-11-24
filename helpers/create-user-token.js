const jwt = require('jsonwebtoken')

const createUserToken = async(user,req,resp)=>{
    //create the token
    const token = jwt.sign({
        name:user.name,
        id:user._id
    },'meusecret')

    resp.status(200).json({
        messsage:"você está autenticado!",
        token:token
    })
}

module.exports = createUserToken