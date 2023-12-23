const { model } = require("mongoose")

const identityDocumentTypes = {
    CIN : 'CIN',
    PASSPORT : 'PASSPORT',
    RESIDENCE_CARD : 'RESIDENCE_CARD',
}

model.exports = identityDocumentTypes;