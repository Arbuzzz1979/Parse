const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const FoulsStatsSchema = new Schema({
  id: String,
  country: String,
  league: String,
  num: String, 
  logo: String,
  foulsStats: [
    {
      teamName: String,
      match: {
        min: String,
        max: String,
        matches: String,
        total: String,
        average: String,
        fouls: Array,
        last10: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },
        last5: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },   
        last3: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },             
      }, 
      team: {
        min: String,
        max: String,
        matches: String,
        total: String,
        average: String,
        fouls: Array,
        last10: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },
        last5: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },   
        last3: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },             
      }, 
      opponent: {
        min: String,
        max: String,
        matches: String,
        total: String,
        average: String,
        fouls: Array,
        last10: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },
        last5: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },   
        last3: {
          min: String,
          max: String,
          matches: String,
          total: String,
          average: String,
          fouls: Array,
        },             
      },             
    }      
  ]
});

module.exports =
    mongoose.models.FoulsStats || mongoose.model('FoulsStats', FoulsStatsSchema);
