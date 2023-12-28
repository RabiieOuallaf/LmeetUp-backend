const Event = require("../../models/Events/model.event");
const redisClient = require("../../utils/redisClient");

exports.addEvent = async (req, res) => {
    try {
      const event = await new Event(req.body).save();
  
      redisClient.connect();
      let events = await redisClient.get('events');
      events = events ? JSON.parse(events) : [];
  
      if (!Array.isArray(events)) {
        events = [];
      }
      events.push(event);
  
      await redisClient.setEx('events', 5400, JSON.stringify(events));
  
      res.status(201).json(event);
    } catch (error) {
      console.error('Error adding event:', error);
      res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
  };
  
exports.updateEvent = async (req, res) => {
    try {
        const foundEvent = await Event.findById(req.params.id);
        if (!foundEvent) res.status(400).json({ error: "Event not found" });
    
        Object.assign(foundEvent, req.body);
    
        const updatedEvent = await foundEvent.save();
        if (updatedEvent) {
          await client.setEx("events", 5400, JSON.stringify(updatedEvent));
          res.json({ updatedEvent });
        } else {
          res.status(400).json({ error: "An error occurred during event updation" });
        }
      } catch (error) {
        res.status(400).json({ error });
      }
};

exports.getAllEvents = async (req, res) => {
    try {
        redisClient.connect(); 
  
      const cachedEvents = await redisClient.get('events');
      if (cachedEvents) {
        res.json({ events: JSON.parse(cachedEvents) });
        return; 
      }
  
      const events = await Event.find();
  
      if (events.length > 0) {
        res.json({ events });
        await redisClient.set('events', 5400, JSON.stringify(events)); // Cache the results
      } else {
        res.status(400).json({ error: "No events found" });
      }
    } catch (error) {
      console.error('Redis error in getAllEvents:', error);
      res.status(500).json({ error: 'Failed to retrieve events' });
    } finally {
      await redisClient.quit();
    }
    
  };
  
exports.getOneEvent = async (req, res) => {
    try { 
        let eventId = req.params.id;

        redisClient.connect();

        const cachedEvents = await redisClient.get(`event:${eventId}`);
        if (cachedEvents) {
            res.json({ events: JSON.parse(cachedEvents) });
            return;
        }

        const event = await Event.findById(eventId);

        if (event) {
            res.json({ event });
            await redisClient.setEx(`event:${eventId}`, 5400, JSON.stringify(event)); 
        } else {
            res.status(400).json({ error: "No event found" });
        }
    } catch (error) {
        console.error('Redis error in getOneEvent:', error);
        res.status(500).json({ error: 'Failed to retrieve event' });
    } finally {
        await redisClient.quit();
    }
};

exports.deleteEvent = async (req, res) => {
    const eventId = req.params.id;
    try {
        const foundEvent = await Event.findById(eventId);
        
        await redisClient.connect();
        if (foundEvent) {

            await foundEvent.deleteOne();
            await redisClient.del(`event:${eventId}`);
    
            res.status(204).json({ warning: 'Event is deleted' });
        } else {
            res.status(400).json({ error: 'Event not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    } finally {
        await redisClient.quit();
    }
};
