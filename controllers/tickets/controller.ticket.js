const Ticket = require('../../models/Tickets/model.ticket.model');
const redisClient = require('../../utils/redisClient');


exports.addTicket = async (req, res) => {
    try {
        const { quantityTotal, quantityOnline, quantityOffline } = req.body;

        if (quantityTotal < quantityOnline + quantityOffline) {
            return res.status(400).json({ error: "Sum of quantityOnline and quantityOffline cannot exceed quantityTotal" });
        }

        const seats = Array.from({ length: quantityTotal }, (_, index) => {
            const seatNumber = index + 1;
            const seatId = `Seat-${seatNumber}`;
            const isOnline = seatNumber <= quantityOnline;
            const isOffline = seatNumber > quantityOnline && seatNumber <= quantityOnline + quantityOffline;
            const seatAvailability = isOnline || isOffline;

            return {
                seatId,
                seatSource: isOnline ? 'online' : 'offline',
                seatAvailability,
            };
        });

        const ticket = {
            ...req.body,
            seats,
        };


        const savedTicket = await new Ticket(ticket).save();

        redisClient.connect();
        let cachedTickets = await redisClient.get('tickets');
        cachedTickets = cachedTickets ? JSON.parse(cachedTickets) : [];

        if (!Array.isArray(cachedTickets)) {
            cachedTickets = [];
        }
        cachedTickets.push(savedTicket);

        await redisClient.setEx('tickets', 5400, JSON.stringify(cachedTickets));

        res.status(201).json(savedTicket);
    } catch (error) {
        console.error('Error adding ticket:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
};



exports.updateTicket = async (req, res) => {
    try {
        const foundTicket = await Ticket.findById(req.params.id);
        if (!foundTicket) return res.status(404).json({ error: "Ticket not found" });

        redisClient.connect();

        const tickets = await redisClient.get('tickets');
        let updatedTickets = tickets ? JSON.parse(tickets) : [];

        updatedTickets = updatedTickets.filter(ticket => ticket._id.toString() !== req.params.id);

        Object.assign(foundTicket, req.body);
        const updatedTicket = await foundTicket.save();

        updatedTickets.push(updatedTicket);

        await redisClient.setEx('tickets', 5400, JSON.stringify(updatedTickets));

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
        let tickets = await redisClient.get('tickets');
        if (!tickets) {
            tickets = await Ticket.find();
            await redisClient.setEx('tickets', 5400, JSON.stringify(tickets));
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
}

exports.getOneTicket = async (req, res) => {
    try {
        redisClient.connect();
        let ticket = await redisClient.get('ticket');
        if (!ticket) {
            ticket = await Ticket.findById(req.params.id);
            await redisClient.setEx('ticket', 5400, JSON.stringify(ticket));
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
}

exports.deleteTicket = async (req, res) => {
    try {
        const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);
        if (!deletedTicket) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        redisClient.connect();
        const cachedTickets = await redisClient.get('tickets');
        let updatedTickets = cachedTickets ? JSON.parse(cachedTickets) : [];
        
        updatedTickets = updatedTickets.filter(ticket => ticket._id.toString() !== req.params.id);
        
        await redisClient.setEx('tickets', 5400, JSON.stringify(updatedTickets));

        return res.json({ deletedTicket });
    } catch (error) {
        console.error('Error in deleteTicket:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await redisClient.quit();
    }
};
