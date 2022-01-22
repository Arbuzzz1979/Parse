const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const LeaguesSchema = new Schema({
  id: String,
  country: String,
  flag: String,
  league: String,
  logo: String,
  title: String,
  top: Boolean,
  num: Number,
  season: Number,
  year: Number,
  standings: String, 
  standingsId: String,
  display: {
    type: String,
    enum: ["On", "Off"],
    default: "On",
  },
});

module.exports =
    mongoose.models.Leagues || mongoose.model('Leagues', LeaguesSchema);