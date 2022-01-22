const mongoose = require("mongoose");

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const SummarySchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  num: String,
  country: String,
  league: String,
  champStats: {
    cornerKicks: Number,
    fouls: Number,
    throwIns: Number,
    offsides: Number,
    goals: Number,
    yellowCards: Number,
    redCards: Number,
    penalties: Number,
    goalAttempts: Number,
    shotsOnGoal: Number,
    bothToScore: Number,
    totalOver: Number,
    totalUnder: Number,
  }
});  

SummarySchema.pre('save', function(next){
  this.league = this.league.split(": ")[1]
  next()
})

module.exports =
    mongoose.models.Summary || mongoose.model('Summary', SummarySchema);
    
