const Event = require("../../models/Events/model.event");
const RevendeurModel = require("../../models/Users/model.revendeur");
const TicketModel = require("../../models/Tickets/model.ticket.model");
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


exports.getSoldTicketsSourcesTable = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID not provided" });
    }

    const foundEvent = await Event.findById(eventId).populate("revendeur");

    if (!foundEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    const foundRevendeurs = Array.isArray(foundEvent.revendeur) ? foundEvent.revendeur : [];

    if (!foundRevendeurs.length) {
      return res.status(404).json({ error: "No revendeurs found for the event" });
    }

    const eventTickets = await TicketModel.find({ event: eventId, code: { $exists: true, $lte: 9 } });

    const soldTicketsPromises = foundRevendeurs.map(async (revendeur) => {
      try {
        const revendeurWithSoldTickets = await RevendeurModel.findById(revendeur._id).populate("soldTickets");

        const revendeurWithSoldTicketsOfEvent = revendeurWithSoldTickets.soldTickets.filter(
          (soldTicket) => soldTicket.event == eventId
        );

        const soldTicketsWithPrice = revendeurWithSoldTicketsOfEvent.map(async (soldTicket) => {
          try {
            const ticket = await TicketModel.findById(soldTicket.ticket);

            return {
              ticketId: soldTicket.ticket,
              quantity: 1, 
              pricePerUnit: ticket.price, 
              totalPrice: ticket.price * 1, 
            };
          } catch (error) {
            console.error("Error getting ticket for soldTicket:", error);
            throw error;
          }
        });

        const totalPrice = (await Promise.all(soldTicketsWithPrice)).reduce((sum, ticket) => sum + ticket.totalPrice, 0);

        return {
          revendeurId: revendeur._id,
          revendeurFirstName: revendeur.firstName,
          revendeurLastName: revendeur.lastName,
          soldTickets: await Promise.all(soldTicketsWithPrice),
          totalPrice: totalPrice,
        };
      } catch (error) {
        console.error("Error getting sold tickets for revendeur:", error);
        throw error;
      }
    });

    const eventTicketsWithPrice = eventTickets.map((ticket) => ({
      ticketId: ticket._id,
      quantity: 1, 
      pricePerUnit: ticket.price, 
      totalPrice: ticket.price * 1, 
    }));

    const eventTotalPrice = eventTicketsWithPrice.reduce((sum, ticket) => sum + ticket.totalPrice, 0);

    const revendeursSoldTickets = await Promise.all(soldTicketsPromises);

    res.status(200).json({
      eventTickets: eventTicketsWithPrice,
      eventTotalPrice: eventTotalPrice,
      revendeursSoldTickets: revendeursSoldTickets,
    });
  } catch (error) {
    console.error("Error getting sold tickets sources table:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



