const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const FixturesSchema = new Schema({
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
    round: String,
    status: String,
    matchLogo: String,
    referee: String,
    venue: String,
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
FixturesSchema.pre('save', function(next){
  this.country = this.country.toLowerCase()
  this.league = this.league.split(": ")[1]
  next()
})

module.exports =
    mongoose.models.Fixtures || mongoose.model('Fixtures', FixturesSchema);