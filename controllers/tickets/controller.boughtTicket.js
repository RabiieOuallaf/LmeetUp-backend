const boughtTicket = require("../../models/Tickets/model.boughtTicket");
const Event = require("../../models/Events/model.event");
const User = require("../../models/Users/model.user");
const Ticket = require("../../models/Tickets/model.ticket");
const Coupon = require("../../models/Tickets/model.coupon");

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
    const coupon = await Coupon.findById(req.body.coupon);

    if (!event || !user || !ticket)
      return res.status(404).json({ error: "Event, user or ticket not found" });

    if (event.tickets.length >= event.totalTickets) {
      return res
        .status(400)
        .json({ error: "No available tickets for this event" });
    }
    if (coupon) {
      const couponUsage = await boughtTicket.find({ coupon: req.body.coupon });

      if (couponUsage.length >= coupon.usage)
        return res.status(400).json({ error: "Coupon usage limit reached" });
      if (coupon.expirationDate < Date.now())
        return res.status(400).json({ error: "Coupon expired" });
      if (coupon.event && coupon.event.toString() !== req.body.event)
        return res
          .status(400)
          .json({ error: "Coupon not valid for this event" });
      if (coupon.startDate > Date.now())
        return res.status(400).json({ error: "Coupon not valid yet" });

      if (coupon.type.toLowerCase() === "percentage") {

        if (coupon.discount >= 0 && coupon.discount <= 100) {
          ticket.price = ticket.price - (ticket.price * coupon.discount) / 100;
        }
      } else if (coupon.type.toLowerCase() === "amount") {

        if (coupon.discount > 0) {
          ticket.price = Math.max(0, ticket.price - coupon.discount);
        }
      }
    }

    const boughtTicketData = {
      ...req.body,
      price: ticket.price,
      code: generateRandomCode(),
    };

    const savedBoughtTicket = await new boughtTicket(boughtTicketData).save();

    event.tickets.push(savedBoughtTicket._id);
    await event.save();

    res.status(201).json(savedBoughtTicket);
  } catch (error) {
    console.error("Error buying ticket:", error);
    res.status(400).json({ error });
  }
};

exports.getBoughtTicket = async (req, res) => {
  try {
    const code = req.params.code;
    const foundBoughtTicket = await boughtTicket
      .findOne({ code })
      .populate("event user ticket");

    if (!foundBoughtTicket || foundBoughtTicket.status != "payed")
      return res.status(404).json({ error: "Bought ticket not found" });

    const serializedBoughtTicket = foundBoughtTicket.toJSON();
    res.json(serializedBoughtTicket);
  } catch (error) {
    console.error("Error getting bought ticket:", error);
    res.status(400).json({ error });
  }
};

exports.getBoughtTicketByEvent = async (req, res) => {
  try {
    const event = req.params.event;
    const foundBoughtTicket = await boughtTicket
      .find({ event, status: { $ne: "payed" }})
      .populate("event user ticket");
    if (!foundBoughtTicket )
      return res.status(404).json({ error: "Bought ticket not found" });

    res.json(foundBoughtTicket);
  } catch (error) {
    console.error("Error getting bought ticket:", error);
    res.status(400).json({ error });
  }
};



exports.getAllBoughtTickets = async (req, res) => {
  try {
    const foundBoughtTickets = await boughtTicket
      .find({ status: { $ne: "payed" } })
      .populate("event user ticket");
    if (!foundBoughtTickets)
      return res.status(404).json({ error: "Bought tickets not found" });

    const serializedBoughtTickets = foundBoughtTickets.map((boughtTicket) =>
      boughtTicket.toJSON()
    );
    res.json(serializedBoughtTickets);
  } catch (error) {
    console.error("Error getting bought tickets:", error);
    res.status(400).json({ error });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const foundReservations = await boughtTicket
      .find({ status: "onhold" })
      .populate("event user ticket");
    if (!foundReservations)
      return res.status(404).json({ error: "Reservations not found" });

    const serializedReservations = foundReservations.map((reservation) =>
      reservation.toJSON()
    );
    res.json(serializedReservations);
  } catch (error) {
    console.error("Error getting reservations:", error);
    res.status(400).json({ error });
  }
}


exports.getReservedTicket = async (req, res) => {
  try {
    const code = req.params.code;
    const foundReservedTicket = await boughtTicket
      .findOne({ code })
      .populate("event user ticket");

    if (!foundReservedTicket || foundReservedTicket.status != "onhold")
      return res.status(404).json({ error: "Reserved ticket not found" });

    const serializedReservedTicket = foundReservedTicket.toJSON();
    res.json(serializedReservedTicket);
  } catch (error) {
    console.error("Error getting reserved ticket:", error);
    res.status(400).json({ error });
  }
}

exports.getReservedTicketByEvent = async (req, res) => {
  try {
    const event = req.params.event;
    const foundReservedTicket = await boughtTicket
      .find({ event, status: "onhold" })
      .populate("event user ticket");
    if (!foundReservedTicket)
      return res.status(404).json({ error: "Reserved ticket not found" });

    res.json(foundReservedTicket);
  } catch (error) {
    console.error("Error getting reserved ticket:", error);
    res.status(400).json({ error });
  }
}

exports.getAllBoughtAndReservedTickets = async (req, res) => {
  try {
    const foundBoughtAndReservedTickets = await boughtTicket
      .find()
      .populate("event user ticket");
    if (!foundBoughtAndReservedTickets)
      return res.status(404).json({ error: "Bought tickets not found" });

    const serializedBoughtAndReservedTickets = foundBoughtAndReservedTickets.map((boughtTicket) =>
      boughtTicket.toJSON()
    );
    res.json(serializedBoughtAndReservedTickets);
  } catch (error) {
    console.error("Error getting bought tickets:", error);
    res.status(400).json({ error });
  }
}

exports.getAllBoughtAndReservedTicketsByEvent = async (req, res) => {
  try {
    const event = req.params.event;
    const foundBoughtAndReservedTickets = await boughtTicket
      .find({ event })
      .populate("event user ticket");
    if (!foundBoughtAndReservedTickets)
      return res.status(404).json({ error: "Bought tickets not found" });

    const serializedBoughtAndReservedTickets = foundBoughtAndReservedTickets.map((boughtTicket) =>
      boughtTicket.toJSON()
    );
    res.json(serializedBoughtAndReservedTickets);
  } catch (error) {
    console.error("Error getting bought tickets:", error);
    res.status(400).json({ error });
  }
}

exports.getAllReservedTicketsByEvent = async (req, res) => {
  try {
    const event = req.params.event;
    const foundBoughtAndReservedTickets = await boughtTicket
      .find({ event , status : "onhold"})
      .populate("event user ticket");
    if (!foundBoughtAndReservedTickets)
      return res.status(404).json({ error: "Bought tickets not found" });

    const serializedBoughtAndReservedTickets = foundBoughtAndReservedTickets.map((boughtTicket) =>
      boughtTicket.toJSON()
    );
    res.json(serializedBoughtAndReservedTickets);
  } catch {
    console.error("Error getting bought tickets:", error);
    res.status(400).json({ error });
  }
}

exports.filterBoughtTickets = async (req, res) => {
  try {
    const filter = {};

    if(req.query.code) {
      filter.code = req.query.code;
    }

    if(req.query.event) {
      filter.event = req.query.event;
    }

    if(req.query.user) {
      filter.user = req.query.user;
    }

    if(req.query.ticket) {
      filter.ticket = req.query.ticket;
    }

    if(req.query.status) {
      filter.status = req.query.status;
    }

    if(req.query.price) {
      filter.price = req.query.price;
    }

    if(req.query.coupon) {
      filter.coupon = req.query.coupon;
    }

    if(req.query.class) {
      filter.class = req.query.class;
    }

    if(req.query.revendeur) {
      filter.revendeur = req.query.revendeur;
    }
    


    const foundBoughtTickets = await boughtTicket
      .find(filter)
      .populate("event user ticket");

    if (!foundBoughtTickets || foundBoughtTickets.length === 0)
      return res.status(404).json({ error: "Filtered bought tickets not found" });

    const serializedBoughtTickets = foundBoughtTickets.map((boughtTicket) =>
      boughtTicket.toJSON()
    );
    res.json(serializedBoughtTickets);
  } catch (error) {
    console.error("Error filtering bought tickets:", error);
    res.status(400).json({ error });
  }
};
