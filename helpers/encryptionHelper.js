const crypto = require('crypto')

const ENCRYPTION_METHOD = process.env.ENCRYPTION_METHOD
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const ENCRYPTION_IV = process.env.ENCRYPTION_IV

exports.encryptData = (data) => {
    const cipher = crypto.createCipheriv(ENCRYPTION_METHOD, ENCRYPTION_KEY, ENCRYPTION_IV)

    return Buffer.from(cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64')


}
exports.decryptData = (encryptedData) => {
    const buff = Buffer.from(encryptedData , 'base64')
    const decipher = crypto.createDecipheriv(ENCRYPTION_METHOD, ENCRYPTION_KEY, ENCRYPTION_IV)
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')   
    )
}