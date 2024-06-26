const Event = require("../../models/Events/model.event");
const BoughtTicketModel = require("../../models/Tickets/model.boughtTicket");

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

    const foundEvent = await Event.findById(eventId).populate("revendeur").populate({ path: "tickets", populate: { path: "ticket" } });

    if (!foundEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    const foundRevendeurs = Array.isArray(foundEvent.revendeur) ? foundEvent.revendeur : [];
    const foundEventSoldTickets = Array.isArray(foundEvent.tickets) ? foundEvent.tickets : [];

    if (!foundRevendeurs.length) {
      return res.status(404).json({ error: "No revendeurs found for the event" });
    }

    const revendeursSoldTickets = [];
    const onlineSoldTickets = [];

    for (const soldTicket of foundEventSoldTickets) {

      if (soldTicket.code && soldTicket.code.length <= 10) {

        const existingTicket = onlineSoldTickets.find(
          (t) => t.ticket._id.toString() === soldTicket.ticket.toString()
        );
        if (existingTicket) {
          existingTicket.totalSoldTickets += 1;
          existingTicket.totalPrice += soldTicket.ticket.price;
        } else {
          const ticketData = {
            ticket: {
              _id: soldTicket.ticket,
              code: soldTicket.code,
              class: soldTicket.class,
              event: soldTicket.event,
              coupon: soldTicket.coupon,
              price: soldTicket.price,
              createdAt: soldTicket.createdAt,
              updatedAt: soldTicket.updatedAt,
              __v: soldTicket.__v,
            },
            totalSoldTickets: 1,
            totalPrice: soldTicket.ticket.price,
            PricePerUnit: soldTicket.ticket.price,
          };
          onlineSoldTickets.push({ ...ticketData });
        }
      }
    }

    for (const revendeur of foundRevendeurs) {
      const revendeurId = revendeur._id;

      const soldTickets = await BoughtTicketModel.find({
        revendeur: revendeurId,
        event: eventId,
      }).populate("ticket");

      for (const soldTicket of soldTickets) {
        const existingTicket = revendeursSoldTickets.find(
          (t) =>
            t.ticket._id.toString() === soldTicket.ticket._id.toString() &&
            t.revendeurId.toString() === revendeurId.toString()
        );
        if (existingTicket) {
          existingTicket.totalSoldTickets += 1;
          existingTicket.totalPrice += soldTicket.ticket.price;
        } else {
          const ticketData = {
            revendeurId: revendeurId,
            ticket: {
              _id: soldTicket.ticket._id,
              code: soldTicket.code,
              class: soldTicket.ticket.class,
              event: soldTicket.ticket.event,
              coupon: soldTicket.ticket.coupon,
              price: soldTicket.ticket.price,
              createdAt: soldTicket.ticket.createdAt,
              updatedAt: soldTicket.ticket.updatedAt,
              __v: soldTicket.ticket.__v,
            },
            totalSoldTickets: 1,
            totalPrice: soldTicket.ticket.price,
            PricePerUnit: soldTicket.ticket.price,
          };

          revendeursSoldTickets.push({ ...ticketData });
        }
      }
    }

    const total = revendeursSoldTickets.concat(onlineSoldTickets).reduce(
      (acc, curr) => {
        acc.totalPrice += curr.totalPrice;
        acc.totalTickets += curr.totalSoldTickets;
        return acc;
      },
      { totalPrice: 0, totalTickets: 0 }
    );
    
    res.status(200).json({
      revendeursSoldTickets: revendeursSoldTickets,
      onlineSoldTickets: onlineSoldTickets,
      total: total
    });
  } catch (error) {
    console.error("Error getting sold tickets sources table:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSoldTicketsClassesTable = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID not provided" });
    }

    const foundEvent = await Event.findById(eventId).populate("revendeur").populate({ path: "tickets", populate: { path: "ticket", populate : {path: "class"} } });

    if (!foundEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    const foundEventSoldTickets = Array.isArray(foundEvent.tickets) ? foundEvent.tickets : [];

    const classSoldTickets = {};

    for (const soldTicket of foundEventSoldTickets) {
      if (soldTicket.ticket && soldTicket.ticket.class && soldTicket.ticket.class.name) {
        const classId = soldTicket.ticket.class._id.toString();

        if (!classSoldTickets[classId]) {
          classSoldTickets[classId] = {
            classId: classId,
            className: soldTicket.ticket.class.name, // Assuming you have a name property in your class schema
            totalSoldTickets: 1,
            PricePerUnit: soldTicket.ticket.price,
            totalPrice: soldTicket.ticket.price
          };
        } else {
          classSoldTickets[classId].totalSoldTickets += 1;
          classSoldTickets[classId].totalPrice += soldTicket.ticket.price;
        }
      }
    }

    const classSoldTicketsArray = Object.values(classSoldTickets);

    const total = classSoldTicketsArray.reduce(
      (acc, curr) => {
        acc.totalPrice += curr.totalPrice;
        acc.totalTickets += curr.totalSoldTickets;
        return acc;
      },
      { totalPrice: 0, totalTickets: 0 }
    );

    res.status(200).json({
      classSoldTickets: classSoldTicketsArray,
      total: total,
    });
  } catch (error) {
    console.error("Error getting sold tickets sources table:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
