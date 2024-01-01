// const BenevolentModel = require('../../models/Users/model.benevolent')
// const BenevolentErrors = require('../../errors/error.benevolent')
// const jwt = require('jsonwebtoken')
// const fs = require('fs')
// const { generateSaltedHash } = require('../../utils/generateHash')
// const {encryptData} = require('../../utils/encryptionUtil')

// exports.signup = async (req, res) => {
        
//         try {
    
//             if(req.body.confirmPassword !== req.body.password || !req.body.confirmPassword) {
//                 return res.status('400').json({error: BenevolentErrors.benevolentError.passwordAndConfirmPasswordIsMatch})
//             }
//             const createdBenevolentModel = new BenevolentModel(req.body)
//             await createdBenevolentModel.save()
    
//             res.json(createdBenevolentModel)
            
//         }
//         catch(error) {
//             res.status(400).json({error: error})
//         }
// }