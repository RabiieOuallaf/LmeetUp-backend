const Category = require("../../models/Events/model.category")
const redisClient = require("../../utils/redisClient")

exports.addCategory = async (req,res) => {
    try {
        const category = await new Category(req.body).save();

        redisClient.connect();
        let categories = await redisClient.get('categories')
        categories = categories ? JSON.parse(categories) : []

        if(!Array.isArray(categories)) {
            categories = [];
        }
        categories.push(category);

        await redisClient.setEx('categories', 5400, JSON.stringify(categories));

        res.status(201).json(category)
    } catch (error) {
        console.error(error);
        res.status(400).json({error})
    } finally {
        await redisClient.quit();
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const foundCategory = await Category.findById(req.params.id);
        if (!foundCategory) {
            return res.status(404).json({ error: "Category not found" });
        }

        redisClient.connect();

        // Delete the old category from the list
        const categories = await redisClient.get('categories');
        let updatedCategories = categories ? JSON.parse(categories) : [];
        updatedCategories = updatedCategories.filter(category => category._id.toString() !== req.params.id);

        Object.assign(foundCategory, req.body);
        const updatedCategory = await foundCategory.save();

        // Add the updated category to the list
        updatedCategories.push(updatedCategory);

        await redisClient.setEx('categories', 5400, JSON.stringify(updatedCategories));
        return res.json({ updatedCategory });

    } catch (error) {
        console.error('Error in updateCategory:', error);
        return res.status(500).json({ error: 'Internal Server Error' });

    } finally {
        await redisClient.quit();
    }
};



exports.getAllCategories = async (req,res) => {
    try {
        redisClient.connect();
        const categories = await Category.find();

        const cachedCategories = await redisClient.get('categories')
        if(cachedCategories.length === categories.length) {
            res.json({categories : JSON.parse(cachedCategories)})
            return;
        }


        if(categories.length > 0) {
            res.json({categories});
            await redisClient.setEx('categories', 6000, JSON.stringify(categories))
        }else {
            res.status(400).json({error : "No events found"})
        }
    } catch(error) {
        console.error('Redis error in getAllCategories', error);
        res.status(500).json({error : 'Failed to retrieve categories'})
    } finally {
        await redisClient.quit()
    }
}

exports.getOneCategory = async (req,res) => {
    try {
        let categoryId = req.params.id;

        redisClient.connect();

        const cachedCategory = await redisClient.get(`categories:${categoryId}`)

        if(cachedCategory) {
            res.json({ category : JSON.parse(cachedCategory) })
            return;
        }

        const category = await Category.findById(categoryId);

        if(category) {
            res.status(200).json({ category })
            await redisClient.setEx(`Category:${categoryId}`, 5400, JSON.stringify(category))
        } else {
            res.status(400).json({error : "No category found"})
        }
    } catch (error) {
        console.error('Redis error in getOneCategory:', error);
        res.status(500).json({error : 'Failed to retrieve category'});
    } finally {
        await redisClient.quit();
    }  
}

exports.deleteCategory = async(req,res) => {
    let categoryId = req.params.id;
    try {
        const foundCategory = await Category.findById(categoryId);

        await redisClient.connect();
        if(foundCategory) {

            await foundCategory.deleteOne();
            await redisClient.del(`categories:${categoryId}`)

            res.status(204).json({ warning : 'Category is deleted' })
        } else {
            res.status(400).json({error : 'Category not found'})
        }
    } catch (error) {
        res.status(400).json({ error : error.message })
    } finally {
        await redisClient.quit();
    }
}