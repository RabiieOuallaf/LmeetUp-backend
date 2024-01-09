const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Sans titre",
    },
    description: {
      type: String,
      default: "Sans description",
    },
    tickets: [
      {
        type: String,
        ref: "Ticket",
      },
    ],
    totalTickets: {
      type: Number,
      default: 0,
    },
    totalTicketOnline: {
      type: Number,
      default: 0,
    },
    totalTicketOffline: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    turnOver: {
      // Chiffre d'affaire
      type: Number,
    },
    totalTickets: {
      type: Number,
    },
    imageUrl: {
      type: String,
    },
    miniatureUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    revendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Revendeur",
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    eventPlan: {
      type: String,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
