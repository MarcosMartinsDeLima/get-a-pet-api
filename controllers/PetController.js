const Pet = require('../models/Pet')
const objectId = require('mongoose').Types.ObjectId

const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class PetController{
    //create a pet
    static async createPet(req,resp){
        const {name,age,weight,color} =req.body
        const images = req.files

        const available = true

        //image upload

        //validations
        if(!name){
            resp.status(422).json({message:"O nome é obrigatório"})
            return
        }
        if(!age){
            resp.status(422).json({message:"A idade é obrigatória"})
            return
        }
        if(!weight){
            resp.status(422).json({message:"O peso é obrigatório"})
            return
        }
        if(!color){
            resp.status(422).json({message:"A cor é obrigatória"})
            return
        }
        if(images.length === 0){
            resp.status(422).json({message:"A imagem é obrigatória"})
            return
        }

        //get pet owner
        const token = getToken(req)
        const user = await getUserByToken(token)

        //creating a pet

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images:[],
            user:{
                _id:user.id,
                name:user.name,
                image:user.image,
                phone:user.phone
            }
        })

        images.map((image)=>{
            pet.images.push(image.filename)
        })

        try {
            const newPet = await pet.save()
            resp.status(201).json({
                message:"Pet cadastrado com sucesso!",
                newPet
            })
        } catch (error) {
            resp.status(500).json({message:error})
        }
    }

    static async getAll(req,resp){
        const pet = await Pet.find().sort('-createdAt')

        resp.status(200).json({pets:pet})
    }

    static async getUserPets(req,resp){
        const token = await getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'user._id':user.id}).sort('-createdAt')

        resp.status(200).json({pets:pets})
    }

    static async getAllUserAdoptions(req,resp){
        const token = await getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'adopter._id':user.id}).sort('-createdAt')
    }

    static async getPetById(req,resp){
        //check if id is valid
        const id = req.params.id

        if(!objectId.isValid(id)){
            resp.status(422).json({message:"id invalido"})
            return
        }

        //check if  pet exist
        const pet = await Pet.findOne({_id:id})

        if(!pet){
            resp.status(422).json({message:"Pet não encontrado"})
            return
        }

        resp.status(200).json({pet:pet})
    }

    static async deletePetById(req,resp){
        //check if id is valid
        const id = req.params.id

        if(!objectId.isValid(id)){
            resp.status(404).json({message:"id invalido"})
            return
        }

         //check if  pet exist
         const pet = await Pet.findOne({_id:id})

         if(!pet){
             resp.status(404).json({message:"Pet não encontrado"})
             return
         }
         
         //check if this user had reggistered the pet
         const token = getToken(req)
         const user = await getUserByToken(token)

         if(pet.user._id.toString() !== user.id.toString()){
            resp.status(422).json({message:"Houve um problema ao tentar processar sua solicitação,tente denovo mais tarde!"})
            return
         }

         await Pet.findOneAndDelete(id)
         resp.status(200).json({message:"Pet removido com sucesso!"})

    }

    static async updatePet(req,resp){
        const id = req.params.id
        const {name,age,weight,color,available} =req.body
        const images = req.files
        const updatedData = {}

        //check if pet exists
        const pet = await Pet.findOne({_id:id})

        if(!pet){
            resp.status(404).json({message:"Pet não encontrado"})
            return
        }

         
         //check if this user had reggistered the pet
         const token = getToken(req)
         const user = await getUserByToken(token)

         if(pet.user._id.toString() !== user.id.toString()){
            resp.status(422).json({message:"Houve um problema ao tentar processar sua solicitação,tente denovo mais tarde!"})
            return
         }

         //validations
         if(!name){
            resp.status(422).json({message:"O nome é obrigatório"})
            return
        }
        updatedData.name = name

        if(!age){
            resp.status(422).json({message:"A idade é obrigatória"})
            return
        }
        updatedData.age = age

        if(!weight){
            resp.status(422).json({message:"O peso é obrigatório"})
            return
        }
        updatedData.weight = weight

        if(!color){
            resp.status(422).json({message:"A cor é obrigatória"})
            return
        }
        updatedData.color = color

        if(images.length === 0){
            resp.status(422).json({message:"A imagem é obrigatória"})
            return
        }
        updatedData.images = []
        images.map((image)=>{
            updatedData.images.push(image.filename)
        })

        await Pet.findByIdAndUpdate(id,updatedData)
        resp.status(200).json({message:"pet atualizado com sucesso!"})
    }

    static async schedule(req,resp){
        const id = req.params.id


        if(!objectId.isValid(id)){
            resp.status(404).json({message:"id invalido"})
            return
        }


         //check if pet exists
        const pet = await Pet.findOne({_id:id})

        if(!pet){
            resp.status(404).json({message:"Pet não encontrado"})
            return
           }

        //check if user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() === user.id.toString()){
           resp.status(422).json({message:"Voce não pode agendar uma visita com seu próprio pet!"})
           return
        }

        //check if user has already scheduled a visit
        if(pet.adopter){
            if(pet.adopter._id == user.id){
                resp.status(422).json({message:"Voce já agendou com esse pet!"})
           return
            }
        }

        //add adopter to pet
        pet.adopter ={
            _id:user.id,
            name:user.name,
            image:user.image
        }

        await Pet.findByIdAndUpdate(id,pet)

        resp.status(200).json({message:`Visita agendada com sucesso,entre em contato com ${pet.user.name} pelo ${pet.user.phone}`})
    }

    static async concludeAdoption(req,resp){
        const id = req.params.id


        if(!objectId.isValid(id)){
            resp.status(404).json({message:"id invalido"})
            return
        }


         //check if pet exists
        const pet = await Pet.findOne({_id:id})

        if(!pet){
            resp.status(404).json({message:"Pet não encontrado"})
            return
           }

        //check if this user had reggistered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)
 
        if(pet.user._id.toString() !== user.id.toString()){
            resp.status(422).json({message:"Houve um problema ao tentar processar sua solicitação,tente denovo mais tarde!"})
            return
          }

          pet.available = false

          await Pet.findByIdAndUpdate(id,pet)
          resp.status(200).json({message:"Parabens o ciclo de adoção foi terminado com sucesso!"})
    }
}