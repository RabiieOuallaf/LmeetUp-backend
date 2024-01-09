const express = require('express');
const { formValidation } = require('../../middlewares/Validators/ticketFormValidators');

const router = express.Router();
const { addTicket, updateTicket, getAllTickets, getOneTicket, deleteTicket  } = require('../../controllers/tickets/controller.ticket');
const { buyTicket , getBoughtTicket , getAllBoughtTickets} = require('../../controllers/tickets/controller.boughtTicket')

router.post('/add', formValidation, addTicket);
router.put('/update/:id', formValidation, updateTicket);

router.get('/getAll', getAllTickets);
router.get('/get/:id', getOneTicket);
router.delete('/delete/:id', deleteTicket);

// Bought tickets routes 
router.post('/buyTicket', buyTicket)
router.get('/getBoughtTicket/:code', getBoughtTicket)
router.get('/getAllBoughtTickets', getAllBoughtTickets)

module.exports = router;