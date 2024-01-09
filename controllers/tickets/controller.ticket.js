const Ticket = require('../../models/Tickets/model.ticket.model');
const redisClient = require('../../utils/redisClient');


exports.addTicket = async (req, res) => {
    try {
        const ticket = {
            ...req.body,
        }
        const savedTicket = await new Ticket(ticket).save();

        redisClient.connect()
        let cachedTickets = await redisClient.get('tickets');
        cachedTickets = cachedTickets ? JSON.parse(cachedTickets) : [];

        if (!Array.isArray(cachedTickets)) {
            cachedTickets = [];
        }
        cachedTickets.push(savedTicket);

        await redisClient.set('tickets', JSON.stringify(cachedTickets));

        res.status(201).json(savedTicket);
    } catch (error) {
        console.error('Error adding ticket:', error);
        res.status(400).json({ error });
    } finally {
        const pong = await redisClient.ping();
        if (pong === 'PONG') await redisClient.quit();
    }
};




exports.updateTicket = async (req, res) => {
    try {
        let ticketId = req.params.id;
        const foundTicket = await Ticket.findById(ticketId);
        if (!foundTicket) return res.status(404).json({ error: "Ticket not found" });

        redisClient.connect();

        const tickets = await redisClient.get('tickets');
        let updatedTickets = tickets ? JSON.parse(tickets) : [];

        updatedTickets = updatedTickets.filter(ticket => ticket._id.toString() !== ticketId);

        const seatClasses = req.body.seatClasses || [];

        // Update seats based on seatClasses
        const seats = [];
        seatClasses.forEach(seatClass => {
            const { seatClassId, seatClassQuantity, onlineSeat, offlineSeat } = seatClass;
            const totalSeats = onlineSeat + offlineSeat;
            for (let i = 0; i < totalSeats; i++) {
                const seatId = `Seat-${i + 1}`;
                const seatSource = i < onlineSeat ? 'online' : 'offline';
                seats.push({
                    seatId,
                    seatSource,
                    seatAvailability: true,
                    seatClass: seatClassId,
                });
            }
        });

        const updatedTicketData = {
            ...req.body,
            seats,
        };

        Object.assign(foundTicket, updatedTicketData);
        const updatedTicket = await foundTicket.save();

        updatedTickets.push(updatedTicket);

        await redisClient.set('tickets', JSON.stringify(updatedTickets));

        res.json({ updatedTicket });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        redisClient.connect();
        let cachedTickets = await redisClient.get('cachedTickets');
        let tickets;
        if (!cachedTickets) {
            tickets = await Ticket.find().populate('event').populate('seatClasses.seatClassId');            
            await redisClient.set('tickets', JSON.stringify(tickets));
        } else {
            tickets = JSON.parse(tickets);
        }
        res.json({ tickets });
    } catch (error) {
        console.error('Error in getAllTickets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await redisClient.quit();
    }
};

exports.getOneTicket = async (req, res) => {
    try {
        let ticketId = req.params.id;
        redisClient.connect();
        let ticket = await redisClient.get(`ticket:${ticketId}`);
        if (!ticket) {
            ticket = await Ticket.findById(ticketId).populate('event').populate('seatClasses.seatClassId');
            await redisClient.set(`ticket:${req.params.id}`, JSON.stringify(ticket));
        } else {
            ticket = JSON.parse(ticket);
        }
        res.json({ ticket });
    } catch (error) {
        console.error('Error in getOneTicket:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await redisClient.quit();
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        let ticketId = req.params.id;
        const deletedTicket = await Ticket.findByIdAndDelete(ticketId);
        if (!deletedTicket) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        redisClient.connect();
        const cachedTickets = await redisClient.get('tickets');
        let updatedTickets = cachedTickets ? JSON.parse(cachedTickets) : [];
        
        updatedTickets = updatedTickets.filter(ticket => ticket._id.toString() !== ticketId);
        
        await redisClient.set('tickets', JSON.stringify(updatedTickets));

        return res.json({ deletedTicket });
    } catch (error) {
        console.error('Error in deleteTicket:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await redisClient.quit();
    }
};

