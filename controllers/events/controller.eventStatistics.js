const Event = require("../../models/Events/model.event");
const RevendeurModel = require("../../models/Users/model.revendeur");
const TicketModel = require("../../models/Tickets/model.ticket.model");
const BoughtTicketModel = require("../../models/Tickets/model.boughtTicket");
const mongoose = require('mongoose');

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

    const revendeursSoldTickets = [];

    for (const revendeur of foundRevendeurs) {
      const revendeurId = revendeur._id;

      const soldTickets = await BoughtTicketModel.find({
        revendeur: revendeurId,
        event: eventId,
      }).populate('ticket');
      
      const totalSoldTickets = soldTickets.length;
      const totalPrice = soldTickets.reduce((acc, ticket) => acc + ticket.ticket.price, 0);
      const pricePerUnit = totalSoldTickets ? totalPrice / totalSoldTickets : 0;

      revendeursSoldTickets.push({
        revendeurId: revendeurId,
        totalSoldTickets: totalSoldTickets,
        totalPrice: totalPrice,
        pricePerUnit: pricePerUnit,
      });
    }

    res.status(200).json({
      revendeursSoldTickets: revendeursSoldTickets,
    });
  } catch (error) {
    console.error("Error getting sold tickets sources table:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};