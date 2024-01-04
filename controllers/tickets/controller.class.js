const Class = require('../../models/Tickets/model.class')
const redisClient = require('../../utils/redisClient')

exports.addClass = async (req, res) => {
    try {
        const savedClass = await new Class(req.body).save()

        redisClient.connect()
        let cachedClasses = await redisClient.get('classes')
        cachedClasses = cachedClasses ? JSON.parse(cachedClasses) : []

        if (!Array.isArray(cachedClasses)) {
            cachedClasses = []
        }
        cachedClasses.push(savedClass)
        await redisClient.setEx('classes', 5400, JSON.stringify(cachedClasses))

        res.status(201).json(savedClass)
    } catch (error) {
        console.error('Error adding class:', error)
        res.status(400).json({ error })
    } finally {
        await redisClient.quit()
    }
}

exports.updateClass = async (req, res) => {
    try {
        const foundClass = await Class.findById(req.params.id)

        if (!foundClass) return res.status(404).json({ error: 'Class not found' })

        redisClient.connect()

        Object.assign(foundClass, req.body)

        const updatedClass = await foundClass.save()

        if (updatedClass) {
            const classes = await redisClient.get('classes')
            let updatedClasses = classes ? JSON.parse(classes) : []

            updatedClasses = updatedClasses.filter(class_ => class_._id !== req.params.id)

            await redisClient.setEx('classes', 5400, JSON.stringify(updatedClasses))

            res.json({ updatedClass })
        }
    } catch (error) {
        console.error('Error updating class:', error)
        res.status(400).json({ error })
    } finally {
        await redisClient.quit()
    }
}

exports.getOneClass = async (req, res) => {
    try {
        let classId = req.params.id
        redisClient.connect()
        let cachedClass = await redisClient.get(`class:${classId}`)
        if (cachedClass) {
            cachedClass = JSON.parse(cachedClass)
            return res.json({ cachedClass })
        }

        const foundClass = await Class.findById(classId).populate('tickets')

        if (!foundClass) return res.status(404).json({ error: 'Class not found' })

        if (!foundClass) return res.status(404).json({ error: 'Class not found' })

        res.json({ foundClass })
    } catch (error) {
        console.error('Error getting class:', error)
        res.status(400).json({ error })
    } finally {
        try {
            const pong = await redisClient.ping()

            if(pong === 'PONG') {
                await redisClient.quit()
            }
        } catch {
            console.error('Error pinging redis:', error)
        }
        
    }
}

exports.getAllClasses = async (req, res) => {
    try {
        redisClient.connect()
        let cachedClasses = await redisClient.get('classes')
        if (cachedClasses) {
            cachedClasses = JSON.parse(cachedClasses)
            return res.json({ cachedClasses })
        }

        const classes = await Class.find().populate('tickets')

        if (!classes) return res.status(404).json({ error: 'Classes not found' })

        res.json({ classes })
    } catch (error) {
        console.error('Error getting classes:', error)
        res.status(400).json({ error })
    } finally {
        try {
            const pong = await redisClient.ping()

            if(pong === 'PONG') {
                await redisClient.quit()
            }
        } catch {
            console.error('Error pinging redis:', error)
        }
    
    }
}

exports.deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id)
        if (!deletedClass) return res.status(404).json({ error: 'Class not found' })

        redisClient.connect()
        const cachedClasses = await redisClient.get('classes')
        let updatedClasses = cachedClasses ? JSON.parse(cachedClasses) : []

        updatedClasses = updatedClasses.filter(class_ => class_._id.toString() !== req.params.id)

        await redisClient.setEx('classes', 5400, JSON.stringify(updatedClasses))

        res.json({ deletedClass })
    } catch (error) {
        console.error('Error deleting class:', error)
        res.status(400).json({ error })
    } finally {
        try {
            const pong = await redisClient.ping()

            if(pong === 'PONG') {
                await redisClient.quit()
            }
        } catch {
            console.error('Error pinging redis:', error)
        }
    }
}

exports.assignTicketToClass = async (ticketId, classId) => {
    try {
        const foundClass = await Class.findById(classId)

        if (!foundClass) {
            return {
                error: "You're trying to assign event to a non-existing class"
            }
        };

        if(ticketId && ticketId.length === 24) {
            foundClass.tickets.push(ticketId)
            const updatedClass = await foundClass.save()
            return { updatedClass }
        }

        return { error: "Select an event" }
    } catch (error) {
        console.error('Error assigning event to class:', error)
        throw error
    }
}