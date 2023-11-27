const router = require('express').Router()
const PetController = require('../controllers/PetController')
const {imageUpload} = require('../helpers/image-upload')

//middlewares
const verifyToken = require('../helpers/verify-token')

router.post('/create',verifyToken,imageUpload.array('images'),PetController.createPet)
router.get('/',PetController.getAll)
router.get('/mypets',verifyToken,PetController.getUserPets)
router.get('/myadoptions',verifyToken,PetController.getAllUserAdoptions)
router.get('/:id',PetController.getPetById)
router.delete('/:id',verifyToken,PetController.deletePetById)
router.patch('/:id',verifyToken,imageUpload.array('images'),PetController.updatePet)
router.patch('/schedule/:id',verifyToken,PetController.schedule)
router.patch('/conclude/:id',verifyToken,PetController.concludeAdoption)
module.exports = router