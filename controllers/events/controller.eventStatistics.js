const Event = require("../../models/Events/model.event");
const RevendeurModel = require("../../models/Users/model.revendeur");

exports.getSoldTicketsProgressByEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const totalTickets = event.totalTickets;
    const soldTickets = event.tickets.length;

    const soldTicketsPercentage = (soldTickets / totalTickets) * 100;
    return res.json({ soldTicketsPercentage });
  } catch {
    console.error("Error getting sold tickets progress by event:", error);
    res.status(400).json({ error });
  }
};

exports.getEventRevendeurs = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const revendeurs = await RevendeurModel.find({ events: eventId });

    return res.json({ revendeurs });
  } catch (error) {
    console.error("Error getting event revendeurs:", error);
    res.status(400).json({ error });
  }
}

// exports.getEventTicketsTable = async (req, res) => {
//     try {
//         const eventId = req.params.id;

//         const tickets = await Ticket.find({ event: eventId }).populate('class');
//         const event = await Event.findById(eventId);
//         console.log(event)
//         const boughtTickets = await boughtTicket.find({ event: eventId }).populate({
//             path: 'ticket',
//             model: 'Ticket',
//             populate: {
//                 path: 'class',
//                 model: 'Class',
//             },
//         });
//         const classes = await Class.find({ ticket: tickets[0]._id });

//         const tables = [];

//         for (const classData of classes) {
//             const classTickets = tickets.filter(ticket => ticket.class && ticket.class._id === classData._id);
//             const classBoughtTickets = boughtTickets.filter(boughtTicket => boughtTicket.class && boughtTicket.class._id.toString() === classData._id.toString());

//             const tableData = {
//                 class: classData.name,
//                 soldTickets: classBoughtTickets.length,
//                 invitations: 0,  
//                 ticketOffline: event.totalTicketOffline,  
//                 ticketOnline: event.totalTicketOnline,   
//                 unitPrice: classTickets.length > 0 ? classTickets[0].price : 0,
//             };

//             // Calculate total price for this table
//             tableData.total = classBoughtTickets.reduce((total, boughtTicket) => total + tableData.unitPrice, 0);

//             tables.push(tableData);
//         }

//         return res.json({ tables });
//     } catch (error) {
//         console.error("Error getting event tickets tables:", error);
//         res.status(400).json({ error });
//     }
// };
