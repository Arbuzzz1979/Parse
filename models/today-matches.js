const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const TodayMatchesSchema = new Schema({
  id: String,
  country: String,
  league: String,
  num: String,
  logo: String,
  matches: [{
    matchId: String,
    matchData: String,
    matchTime: String,
    timestamp: String,
    status: String,
    matchLogo: String,
    referee: String,
    venue: String,
    matchScore: {
      match: {
        scoreHT: String,
        scoreAT: String,
      },
      firstHalf: {
        scoreHT: String,
        scoreAT: String,
      },
      secondHalf: {
        scoreHT: String,
        scoreAT: String,
      },
  },
    odds: {
      w: String,
      d: String,
      l: String,
    },
    homeTeam: String,
    awayTeam: String,
    homeTeamIco: String,
    awayTeamIco: String,
    homeTeamShortName: String,
    awayTeamShortName: String,   
    }]
});

//Create champCountry from the champName
TodayMatchesSchema.pre('save', function(next){
  this.country = this.country.toLowerCase()
  this.league = this.league.split(": ")[1]
  next()
})

module.exports =
    mongoose.models.TodayMatches || mongoose.model('TodayMatches', TodayMatchesSchema);