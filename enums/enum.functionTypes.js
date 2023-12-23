const { model } = require("mongoose")

const functionTypes = {
    Restauration: 'Restauration',
    Communication: 'Communication',
    SellTicktes: 'SellTicktes',
    Accompaniment: 'Accompaniment',
    Logistics: 'Logistics',
    Animation: 'Animation',
}

model.exports = functionTypes;