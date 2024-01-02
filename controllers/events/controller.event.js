const Event = require("../../models/Events/model.event")
const redisClient = require("../../utils/redisClient")
const fs = require('fs')
const path = require('path')

exports.addEvent = async (req, res) => {
    try {
  
      const eventData = {
        category: req.body.category,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        turnOver: req.body.turnOver,
        totalTickets: req.body.totalTickets,
        imageUrl: req.files['image'] ? req.files['image'][0].path : '', 
        miniatureUrl: req.files['miniature'] ? req.files['miniature'][0].path : '',
        videoUrl: req.body.videoUrl,
        city: req.body.city,
    };

    const event = await new Event(eventData).save();

    if (req.body.title || req.body.description || req.body.eventClass) {
        const additionalData = {
            title: req.body.title || 'Sans titre',
            description: req.body.description || 'Sans description',
            eventClass: req.body.eventClass || null,
        };

        Object.assign(event, additionalData);

        await event.save();
    }
  
      redisClient.connect();
      let events = await redisClient.get('events');
      events = events ? JSON.parse(events) : [];
  
      if (!Array.isArray(events)) {
        events = [];
      }
      events.push(event);
  
      await redisClient.setEx('events', 300, JSON.stringify(events));
  
      res.status(201).json(event);
    } catch (error) {
      console.error('Error adding event:', error);
      res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
  };



  exports.advancedAddEvent = async (req, res, next) => {
    try {
      const foundEvent = await Event.findById(req.params.id);

      if (!foundEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      foundEvent.title = req.body.title || foundEvent.title;
      foundEvent.description = req.body.description || foundEvent.description;
      foundEvent.eventClass = req.body.eventClass || foundEvent.eventClass;

      const updatedEvent = await foundEvent.save();

      if (updatedEvent) {
        redisClient.connect();
        const events = await redisClient.get('events');
        let updatedEvents = events ? JSON.parse(events) : [];
        updatedEvents = updatedEvents.filter(event => event._id.toString() !== req.params.id);
        res.status(201).json({updatedEvent});
        
      } else {
        return res.status(500).json({ error: "Failed to update event" });
      }


    } catch (error) {
      console.error('Error adding event:', error);
      next(error)
    } finally {
        await redisClient.quit();
    }

  }
  
  exports.updateEvent = async (req, res) => {
    try {
      const foundEvent = await Event.findById(req.params.id);
      if (!foundEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      redisClient.connect();
  
      const events = await redisClient.get('events');
      let updatedEvents = events ? JSON.parse(events) : [];

      updatedEvents = updatedEvents.filter(event => event._id.toString() !== req.params.id);
  
      if (foundEvent.imageUrl) {
        const imagePath = path.join(__dirname, '..', '..' , foundEvent.imageUrl);
        fs.unlinkSync(imagePath);
    }

      const eventData = {
        category: req.body.category || foundEvent.category,
        startTime: req.body.startTime || foundEvent.startTime,
        endTime: req.body.endTime || foundEvent.endTime,
        turnOver: req.body.turnOver || foundEvent.turnOver,
        totalTickets: req.body.totalTickets || foundEvent.totalTickets,
        imageUrl: req.files['image'] ? req.files['image'][0].path : foundEvent.imageUrl,
        miniatureUrl : req.files['miniature'] ? req.files['miniature'][0].path : foundEvent.miniatureUrl,
        videoUrl : req.body.videoUrl || foundEvent.videoUrl,
        city: req.body.city || foundEvent.city,
        title : req.body.title || foundEvent.title,
        description : req.body.description || foundEvent.description,
        eventClass : req.body.eventClass || foundEvent.eventClass
      };

    
      Object.assign(foundEvent, eventData);
      const updatedEvent = await foundEvent.save();
  
      updatedEvents.push(updatedEvent);
  
      await redisClient.setEx('events', 300, JSON.stringify(updatedEvents));
      return res.json({ updatedEvent });
  
    } catch (error) {
      console.error('Error in updateEvent:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  
    } finally {
      await redisClient.quit();
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
  
      const events = await Event.find().populate('category')
      .exec();
  
      if (events.length > 0) {
        res.json({ events });
        await redisClient.setEx('events', 300, JSON.stringify(events)); // Cache the results
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

        const event = await Event.findById(eventId).populate('category')
        .exec();

        if (event) {
            res.json({ event });
            await redisClient.setEx(`event:${eventId}`, 300, JSON.stringify(event)); 
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
    let eventId = req.params.id;
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
