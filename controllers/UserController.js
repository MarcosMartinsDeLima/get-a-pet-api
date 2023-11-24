const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = class UserController{
    static async register(req,resp){
        const {name,email,phone,password,confirmpassword} = req.body

        //validações
        if(!name){
            resp.status(422).json({message:'Nome é um campo obrigatório'})
            return
        }
        if(!email){
            resp.status(422).json({message:'e-mail é um campo obrigatório'})
            return
        }
        if(!phone){
            resp.status(422).json({message:'telefone é um campo obrigatório'})
            return
        }
        if(!password){
            resp.status(422).json({message:'senha é um campo obrigatório'})
            return
        }
        if(!confirmpassword){
            resp.status(422).json({message:'confirme sua senha'})
            return
        }

        if(password !== confirmpassword){
            resp.status(422).json({message:'A senha precisa ser exatamente igual a senha confirmada'})
            return
        }

        //verificar se email existe
        const  emailExist = await User.findOne({email:email})

        if(emailExist){
            resp.status(422).json({message:'Já existe um usuario cadastrado com esse email'})
            return
        }

        //create a hashed password
        const salt = await bcrypt.genSalt(12)
        const hasedPassword = await bcrypt.hash(password,salt)

        //create user
        const user = new User({
            name,
            email,
            password:hasedPassword,
            phone
            
        })

        try{
            const newUser = await user.save()
            await createUserToken(newUser,req,resp)
        }
        catch(error){
            resp.status(500).json({message:error,messages:"erro aqui"})
        }
    }

    static async login(req,resp){
        const {email,password} = req.body

        //validação se veio email e senha
        if(!email){
            resp.status(422).json({message:"Email é obrigatório"})
            return
        }
    
        
        if(!password){
            resp.status(422).json({message:"senha é obrigatório"})
            return
        }

        const user = await User.findOne({email:email})

        //validação se usuario existe
        if(!user){
            resp.status(422).json({message:"Usuario não encontrado"})
            return
        }

        //comparando a senha digitada com a senha no banco
        const checkPassword = await bcrypt.compare(password,user.password)
        if(!checkPassword){
            resp.status(422).json({message:"Senha invalida"})
        }

        await createUserToken(user,req,resp)
    }

    static async checkUser(req,resp){
        let currentUser 

        console.log(req.headers.authorization)
        if(req.headers.authorization){
            const token = getToken(req)
            const decoded = jwt.decode(token,'meusecret')
            console.log(token)

            currentUser = await User.findById(decoded.id)
            currentUser.password = undefined
        }else{
            currentUser = null
        }

        resp.status(200).send(currentUser)
    }

    static async getUserById(req,resp){
        const id = req.params.id
        const user = await User.findById(id).select('-password')

        if(!user){
            resp.status(422).json({message:"Usuario não encontrado"})
            return      
          }
        
          resp.status(200).json({user})

        }

    static async editUser(req,resp){

        const token = getToken(req)
        const user = await getUserByToken(token)

        if(!user){
            resp.status(422).json({message:"Usuario não encontrado"})
            return
            }

        const id = req.params.id
        const {name,email,phone,password,confirmpassword} = req.body
        let image = ''
        //validations
        if(!name){
            resp.status(422).json({message:'Nome é um campo obrigatório'})
            return
        }
        if(!email){
            resp.status(422).json({message:'e-mail é um campo obrigatório'})
            return
        }

        //verificar se o email já esta cadastrado com outro usuario
        const  emailExist = await User.findOne({email:email})
        if(user.email != email && emailExist){
            resp.status(422).json({message:'Usuario já cadastrado com esse email,por favor utilize outro'})
            return
        }

        user.email = email
        

        if(!phone){
            resp.status(422).json({message:'telefone é um campo obrigatório'})
            return
        }

        user.phone = phone

        if(password !== confirmpassword){
            resp.status(422).json({message:'A senha precisa ser exatamente igual a senha confirmada'})
            return
        }else if(password === confirmpassword && password !=null){
            const salt = await bcrypt.genSalt(12)
            const hasedPassword = await bcrypt.hash(password,salt)

            user.password = hasedPassword
        }

        try{
            await User.findOneAndUpdate(
                {_id:user.id},
                {$set:user},
                {new:true})
            resp.status(200).json({message:"Usuario atuallizado com sucesso!"})
        }catch(err){
            resp.status(500).json({message:err})
        }
        }

}