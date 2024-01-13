const Event = require("../../models/Events/model.event");
const redisClient = require("../../utils/redisClient");
const fs = require("fs");
const path = require("path");
const RevendeurModel = require("../../models/Users/model.revendeur");


exports.addEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      imageUrl: req.files["image"] ? req.files["image"][0].path : "",
      miniatureUrl: req.files["miniature"]
        ? req.files["miniature"][0].path
        : "",
    };

    const event = await new Event(eventData).save();

    if (req.body.title || req.body.description || req.body.eventClass) {
      const additionalData = {
        title: req.body.title || "Sans titre",
        description: req.body.description || "Sans description",
        eventClass: req.body.eventClass || null,
      };

      Object.assign(event, additionalData);

      await event.save();
    }

    redisClient.connect();
    let events = await redisClient.get("events");
    events = events ? JSON.parse(events) : [];

    if (!Array.isArray(events)) {
      events = [];
    }
    events.push(event);

    await redisClient.set("events", JSON.stringify(events));

    res.status(201).json(event);
  } catch (error) {
    console.error("Error adding event:", error);
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
    foundEvent.ticket = req.body.ticket || foundEvent.ticket;

    const updatedEvent = await foundEvent.save();

    if (updatedEvent) {
      redisClient.connect();
      const events = await redisClient.get("events");
      let updatedEvents = events ? JSON.parse(events) : [];
      updatedEvents = updatedEvents.filter(
        (event) => event._id.toString() !== req.params.id
      );
      res.status(201).json({ updatedEvent });
    } else {
      return res.status(500).json({ error: "Failed to update event" });
    }
  } catch (error) {
    console.error("Error adding event:", error);
    next(error);
  } finally {
    await redisClient.quit();
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const foundEvent = await Event.findById(req.params.id);
    if (!foundEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    redisClient.connect();

    const events = await redisClient.get("events");
    let updatedEvents = events ? JSON.parse(events) : [];

    updatedEvents = updatedEvents.filter(
      (event) => event._id.toString() !== req.params.id
    );

    if (foundEvent.imageUrl && req.files["image"]) {
      const imagePath = path.join(__dirname, "..", "..", foundEvent.imageUrl);
      fs.unlinkSync(imagePath);
    }

    if (foundEvent.miniatureUrl && req.files["miniature"]) {
      const miniaturePath = path.join(
        __dirname,
        "..",
        "..",
        foundEvent.miniatureUrl
      );
      fs.unlinkSync(miniaturePath);
    }

    const eventData = {
      ...req.body,
      imageUrl: req.files["image"]
        ? req.files["image"][0].path
        : foundEvent.imageUrl,
      miniatureUrl: req.files["miniature"]
        ? req.files["miniature"][0].path
        : foundEvent.miniatureUrl,
    };

    Object.assign(foundEvent, eventData);
    const updatedEvent = await foundEvent.save();

    updatedEvents.push(updatedEvent);

    await redisClient.set("events", JSON.stringify(updatedEvents));
    return res.json({ updatedEvent });
  } catch (error) {
    console.error("Error in updateEvent:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await redisClient.quit();
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    redisClient.connect();

    const page = req.query.page || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const cacheKey = `events:${page}`;

    const cachedEvents = await redisClient.get(cacheKey);
    if (cachedEvents) {
      res.json({ events: JSON.parse(cachedEvents) });
      return;
    }

    const events = await Event.find()
      .populate("category")
      .populate("city")
      .populate("revendeur")
      .skip(skip)
      .limit(pageSize)
      .exec();
    if (events.length > 0) {
      res.json({ events });
      await redisClient.set("events", JSON.stringify(events)); // Cache the results
    } else {
      res.status(400).json({ error: "No events found" });
    }
  } catch (error) {
    console.error("Redis error in getAllEvents:", error);
    res.status(500).json({ error: "Failed to retrieve events" });
  } finally {
    await redisClient.quit();
  }
};

exports.getOneEvent = async (req, res) => {
  try {
    let eventId = req.params.id;

    redisClient.connect();

    const cachedEvents = await redisClient.get(`events:${eventId}`);
    if (cachedEvents) {
      res.json({ events: JSON.parse(cachedEvents) });
      return;
    }

    const event = await Event.findById(eventId)
      .populate("category")
      .populate("city")
      .populate("ticket")
      .exec();

    if (event) {
      res.json({ event });
      await redisClient.set(`event:${eventId}`, JSON.stringify(event));
    } else {
      res.status(400).json({ error: "No event found" });
    }
  } catch (error) {
    console.error("Redis error in getOneEvent:", error);
    res.status(500).json({ error: "Failed to retrieve event" });
  } finally {
    await redisClient.quit();
  }
};

exports.deleteEvent = async (req, res, next) => {
  let eventId = req.params.id;
  try {
    const foundEvent = await Event.findById(eventId);

    await redisClient.connect();
    if (foundEvent) {
      await foundEvent.deleteOne();
      await redisClient.del(`event:${eventId}`);

      if (foundEvent.imageUrl) {
        const imagePath = path.join(__dirname, "..", "..", foundEvent.imageUrl);

        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      if (foundEvent.miniatureUrl) {
        const miniaturePath = path.join(
          __dirname,
          "..",
          "..",
          foundEvent.miniatureUrl
        );

        if (fs.existsSync(miniaturePath)) fs.unlinkSync(miniaturePath);
      }
      res.status(204).json({ warning: "Event is deleted" });
    } else {
      res.status(400).json({ error: "Event not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    await redisClient.quit();
    next();
  }
};

exports.assignRevendeurToEvent = async (req, res, next) => {
  try {
    let eventId = req.body.eventId;
    let revendeurId = req.body.revendeurId;

    const foundEvent = await Event.findById(eventId);

    if (!foundEvent) {
      return res.status(404).json({
        error: "You're trying to assign revendeur to a non-existing event",
      });
    }

    const foundRevendeur = await RevendeurModel.findById(revendeurId);

    if (!foundRevendeur) {
      return res.status(404).json({
        error: "You're trying to assign event to a non-existing revendeur",
      });
    }

    // Check if revendeurId already exists in the event's revendeur array
    if (!foundEvent.revendeur.includes(revendeurId)) {
      foundEvent.revendeur.push(revendeurId);
      const updatedEvent = await foundEvent.save();

      // Additional logic for caching in Redis
      redisClient.connect();
      let cachedEvents = await redisClient.get("events");
      cachedEvents = cachedEvents ? JSON.parse(cachedEvents) : [];

      if (!Array.isArray(cachedEvents)) {
        cachedEvents = [];
      }

      cachedEvents.push(updatedEvent);

      redisClient.set("event", JSON.stringify(updatedEvent));

      // Check if eventId already exists in the revendeur's events array
      if (!foundRevendeur.events.includes(eventId)) {
        foundRevendeur.events.push(eventId);
        const updatedRevendeur = await foundRevendeur.save();

        return res.status(200).json({ updatedEvent, updatedRevendeur });
      } else {
        return res.status(400).json({ error: "Event already assigned to the revendeur" });
      }
    } else {
      return res.status(400).json({ error: "Revendeur already assigned to the event" });
    }
  } catch (error) {
    console.error("Error in revendeur assigning:", error);
    next(error);
  } finally {
    try {
      const pong = await redisClient.ping();
      if (pong === "PONG") {
        await redisClient.quit();
      }
    } catch (error) {
      console.error("Redis client is not connected");
    }
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