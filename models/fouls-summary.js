const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const FoulsSummarySchema = new Schema({
  id: String,
  country: String,
  league: String,
  foulsStats: [
    {
      teamName: String,
      allMatches: {
        match: String,
        team: String,
        opponent: String,
      },
      last10: {
        match: String,
        team: String,
        opponent: String,
      },
      last5: {
        match: String,
        team: String,
        opponent: String,
      },
      last3: {
        match: String,
        team: String,
        opponent: String,
      },            
    }      
  ]
});

module.exports =
    mongoose.models.FoulsSummary || mongoose.model('FoulsSummary', FoulsSummarySchema);