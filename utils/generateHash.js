const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const generateSaltedHash = async (password, saltVal=null, uuidVal=null) => {
    // Generate a random salt
    const saltValue = await bcrypt.genSalt(10);

    // Generate a UUID
    const uuidValue = uuid.v4();

    // Combine the UUID and salt
    const combinedValue = `${password}${uuidVal ? uuidVal : uuidValue}`;

    // Hash the combined value
    const hashedValue = await bcrypt.hash(combinedValue, saltVal ? saltVal : saltValue);

    // Return the hashed value
    return {
        hash: hashedValue,
        uuid: uuidValue,
        salt: saltValue
    };
};

module.exports = { generateSaltedHash }
