const Coupon = require('../../models/Tickets/model.coupon.model');
const redisClient = require('../../utils/redisClient');

exports.addCoupon = async (req, res) => {
    try {
        const savedCoupon = await new Coupon(req.body).save();

        redisClient.connect();
        let cachedCoupons = await redisClient.get('coupons');
        cachedCoupons = cachedCoupons ? JSON.parse(cachedCoupons) : [];

        if (!Array.isArray(cachedCoupons)) {
            cachedCoupons = [];
        }
        cachedCoupons.push(savedCoupon);
        await redisClient.setEx('coupons', 5400, JSON.stringify(cachedCoupons));

        res.status(201).json(savedCoupon);
    } catch (error) {
        console.error('Error adding coupon:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
}



exports.updateCoupon = async (req, res) => {
    try {
        const foundCoupon = await Coupon.findById(req.params.id);

        if (!foundCoupon) return res.status(404).json({ error: "Coupon not found" });

        redisClient.connect();

        Object.assign(foundCoupon, req.body);

        const updatedCoupon = await foundCoupon.save();

        if(updatedCoupon) {
            const coupons = await redisClient.get('coupons');
            let updatedCoupons = coupons ? JSON.parse(coupons) : [];

            updatedCoupons = updatedCoupons.filter(coupon => coupon._id !== req.params.id);

            await redisClient.setEx('tickets', 5400, JSON.stringify(updatedCoupons));

            res.json({ updatedCoupon });
        }

    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }
}

exports.getOneCoupon = async (req, res) => {
    try {
        const couponId = req.params.id;

        let cachedCoupons;
        try {
            await redisClient.connect();
            cachedCoupons = await redisClient.get('coupons');
        } catch (error) {
            console.error('Error connecting to Redis:', error);
        }

        cachedCoupons = cachedCoupons ? JSON.parse(cachedCoupons) : [];

        const coupon = cachedCoupons.find(coupon => coupon._id.toString() === couponId)
            ?? (await Coupon.findById(couponId)); 

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        res.json(coupon);

    } catch (error) {
        console.error('Error getting coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        try {
            const pong = await redisClient.ping();
            if (pong === 'PONG') {
                await redisClient.quit();
            }
        } catch (error) {
            console.error('Redis client is not connected');
        }
    }
};


exports.getAllCoupons = async (req, res) => {
    try {
        redisClient.connect();
        let cachedCoupons = await redisClient.get('coupons');
        if(cachedCoupons.length === 0) {
            const coupons = await Coupon.find();
            res.json(coupons);
        }
        
        res.json(JSON.parse(cachedCoupons));
    } catch (error) {
        console.error('Error getting coupons:', error);
        res.status(400).json({ error });
    } finally {
        await redisClient.quit();
    }

}

exports.deleteCoupon = async (req, res) => {
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!deletedCoupon) return res.status(404).json({ error: "Coupon not found" });

        redisClient.connect();

        let cachedCoupons = await redisClient.get('coupons');
        cachedCoupons = cachedCoupons ? JSON.parse(cachedCoupons) : [];

        // Filter out the deleted coupon from the cached coupons
        cachedCoupons = cachedCoupons.filter(coupon => coupon._id !== req.params.id);

        // Store the updated list back in Redis
        await redisClient.setEx('coupons', 5400, JSON.stringify(cachedCoupons));

        res.json({ deletedCoupon });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(400).json({ error });
    } finally {
        try {
            const pong = await redisClient.ping();
            if (pong === 'PONG') {
                await redisClient.quit();
            }
        } catch (error) {
            console.error('Redis client is not connected');
        }
    }
}
