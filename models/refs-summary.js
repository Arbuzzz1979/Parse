const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const RefsSummarySchema = new Schema({
  id: String,
  country: String,
  league: String,
  refsStats: [
    {
      name: String,
      country: String,
      countMatches: Number,
      fouls: Number,
      yellowCards: Number,
      penalties: Number,
      redCards: Number,
      nextMatchId: String,
    }      
  ]
});

module.exports =
    mongoose.models.RefsSummary || mongoose.model('RefsSummary', RefsSummarySchema);
