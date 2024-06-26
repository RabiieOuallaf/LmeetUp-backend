const express = require('express')
const router = express.Router()
const { 
    addInvitation, 
    updateInvitation, 
    getAllInvitations, 
    getInvitation,
    getInvitationByFirstAndLastName, 
    deleteInvitation,
    sendInvitationEmail,
    downloadInvitationPdf
} = require('../../controllers/tickets/controller.invitation')


router.post('/send-email/:id', sendInvitationEmail)
router.get('/download/:id', downloadInvitationPdf)

router.post('/add', addInvitation)
router.put('/update/:id', updateInvitation)

router.get('/getAll', getAllInvitations)
router.get('/get/:id', getInvitation)
router.get('/get/:firstName/:lastName', getInvitationByFirstAndLastName)

router.delete('/delete/:id', deleteInvitation)

module.exports = router;