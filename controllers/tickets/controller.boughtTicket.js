const boughtTicket = require("../../models/Tickets/model.boughtTicket");
const Event = require("../../models/Events/model.event");
const User = require("../../models/Users/model.user");
const Ticket = require("../../models/Tickets/model.ticket.model");

const generateRandomCode = () => {
  const randomNumber = Math.floor(Math.random() * 90 + 10);
  const randomCode = Math.random().toString(36).substring(2, 9);

  return `${randomNumber}-${randomCode}`;
};

exports.buyTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.body.event);
    const user = await User.findById(req.body.user);
    const ticket = await Ticket.findById(req.body.ticket);

    if (!event || !user || !ticket)
      return res.status(404).json({ error: "Event, user or ticket not found" });
    
    
    if (event.tickets.length >= event.totalTickets) {
        return res.status(400).json({ error: 'No available tickets for this event' });
    }

    const boughtTicketData = {
      ...req.body,
      price: ticket.price,
      code: generateRandomCode(),
    };

    const savedBoughtTicket = await new boughtTicket(boughtTicketData).save();

    event.tickets.push(savedBoughtTicket._id);
    await event.save();
    
    res
      .status(201)
      .json(
        savedBoughtTicket
      );
  } catch (error) {
    console.error("Error buying ticket:", error);
    res.status(400).json({ error });
  }
};

exports.getBoughtTicket = async (req, res) => {
  try {
    const code = req.params.code;
    const foundBoughtTicket = await boughtTicket.findOne({code}).populate("event user ticket");
    if (!foundBoughtTicket)
      return res.status(404).json({ error: "Bought ticket not found" });

    const serializedBoughtTicket = foundBoughtTicket.toJSON();    
    res.json(serializedBoughtTicket);
  } catch (error) {
    console.error("Error getting bought ticket:", error);
    res.status(400).json({ error });
  }
}

exports.getAllBoughtTickets = async (req, res) => {
  try {
    const foundBoughtTickets = await boughtTicket.find().populate("event user ticket");
    if (!foundBoughtTickets)
      return res.status(404).json({ error: "Bought tickets not found" });

    const serializedBoughtTickets = foundBoughtTickets.map(boughtTicket => boughtTicket.toJSON());    
    res.json(serializedBoughtTickets);
  } catch (error) {
    console.error("Error getting bought tickets:", error);
    res.status(400).json({ error });
  }
}

