const Event = require('../../models/Events/model.event');

exports.addEvent = async (req, res) => {
    const event = new Event(req.body);

    try {
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error });
    }
}

exports.updateEvent = async (req, res) => {
    Event.updateOne({ _id: req.params.id }, req.body, (err, UpdatedEvent) => {
        if(err) 
            res.status(400).json({ err });
        
        res.json({ UpdatedEvent });
    })
}

exports.getAllEvents = async (req, res) => {
    var events = await Event.find();

    events.exec((err, events) => {
        if(err)
            res.status(400).json({ err });

        res.json({ events });
    })
}

exports.getOneEvent = async (req, res) => {
    Event.findById(req.params.id, (err, event) => {
        if(err)
            res.status(400).json({ err });

        res.json({ event });
    })
}