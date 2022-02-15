const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const RefsStatsSchema = new Schema({
  id: String,
  country: String,
  league: String,
  num: String, 
  logo: String,
  refsStats: [
    {
      name: String,
      fullName: String,
      fotoUrl: String,
      birthDate: String,
      birthPlace: String,
      birthCountry: String,
      birthCountryFlag: String,
      country: String,
      countMatches: Number,
      average: {
        fouls: Number,
        yellowCards: Number,
        penalties: Number,
        redCards: Number,    
      },    
      matches: [{
        matchId: {
          type: String,
          unique: true,
        },
        season: String,
        homeTeam: String,
        awayTeam: String,
        score: String,
        winner: String,
        matchFullDate: String,
        matchData: String,
        matchTime: String,
        timestamp: String,
        round: String,
        homeTeamIco: String,
        awayTeamIco: String,
        homeTeamShortName: String,
        awayTeamShortName: String, 
        stats: {
          fouls: {
            match: Number,
            homeTeam: Number,
            awayTeam: Number,
          },
          yellowCards:  Number, 
          redCards:  String, 
          penalties:  String, 
        },    
          
      }],
      nextMatch: {
        matchId: String,
        country: String,
        champId: String,
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
        }
    }      
  ]
});

module.exports =
    mongoose.models.RefsStats || mongoose.model('RefsStats', RefsStatsSchema);
