const City = require('../../models/Events/model.city')
const redisClient = require('../../utils/redisClient')

exports.addCity = async (req, res) => {
    try {
        const savedCity = await new City(req.body).save();

        redisClient.connect();

        let cities = await redisClient.get('cities');
        cities = cities ? JSON.parse(cities) : [];

        if (!Array.isArray(cities)) {
            cities = [];
        }

        cities.push(savedCity);

        await redisClient.setEx('cities', 5400, JSON.stringify(cities));

        res.status(201).json(savedCity);
    } catch (error) {
        console.error('Error adding city:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
}


exports.updateCity = async (req, res) => {
    try {
        const foundCity = await City.findById(req.params.id);

        if (!foundCity) return res.status(404).json({ error: "City not found" });

        redisClient.connect();

        Object.assign(foundCity, req.body);

        const updatedCity = await foundCity.save();

        if(updatedCity) {
            const cities = await redisClient.get('cities');
            let updatedCities = cities ? JSON.parse(cities) : [];

            updatedCities = updatedCities.filter(city => city._id !== req.params.id);

            await redisClient.setEx('cities', 5400, JSON.stringify(updatedCities));

            res.json({ updatedCity });
        }

    } catch (error) {
        console.error('Error updating city:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
}

exports.getAllCities = async (req,res) => {
    try {
        redisClient.connect();

        let cachedCities = await redisClient.get('cities');

        if (cachedCities) {
            cachedCities = JSON.parse(cachedCities);
            return res.json({ cachedCities });
        }

        const cities = await City.find({});

        await redisClient.setEx('cities', 5400, JSON.stringify(cities));

        res.json({ cities });
    } catch (error) {
        console.error('Error getting cities:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
}

exports.getOneCity = async (req, res) => {
    try {
        const cityId = req.params.id;

        let cachedCities;
        try {
            await redisClient.connect();
            cachedCities = await redisClient.get('cities');
        } catch (error) {
            console.error('Error connecting to Redis:', error);
        }

        cachedCities = cachedCities ? JSON.parse(cachedCities) : [];

        const city = cachedCities.find(city => city._id.toString() === cityId)
            ?? (await City.findById(cityId)); 

        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        res.json(city);

    } catch (error) {
        console.error('Error getting city:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
}

exports.deleteCity = async (req, res) => {
    try {
        const deletedCity = await City.findByIdAndDelete(req.params.id);
        if (!deletedCity) {
            return res.status(404).json({ error: "City not found" });
        }

        redisClient.connect();
        const cachedCities = await redisClient.get('cities');
        let updatedCities = cachedCities ? JSON.parse(cachedCities) : [];
        
        updatedCities = updatedCities.filter(city => city._id.toString() !== req.params.id);
        
        await redisClient.setEx('cities', 5400, JSON.stringify(updatedCities));

        res.json({ deletedCity });
    } catch (error) {
        console.error('Error deleting city:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
}