const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const colors = require("colors")
const dotenv = require("dotenv")
const connectDB = require('../config/db')
const champs = require("../constants/champ-list");
const dirStatsReferee = path.join(__dirname, '../data/stats/referee');
const utils = require("./utils");

// Load env vars
dotenv.config({ path: "../config/config.env" });

//Connect to database
connectDB();

// Load models
const Leagues = require('../models/leagues')
const RefsStats = require('../models/refs-stats')
const RefsSummary = require('../models/refs-summary')

// Save Referees Statistics Data into DB
const saveRefsStats = async () =>{
  let refsStats=[];

  for(const champ of champs) {
    if (!champ.top) continue 
    const champRefsStats = JSON.parse(
      fs.readFileSync(path.join(dirStatsReferee, `${champ.id}.json`), 'utf-8'))

    refsStats.push({
      id: champ.id,
      country: champ.country,
      league: champ.league,
      num: champ.num,
      refsStats: champRefsStats
    })
  }    

  const summary = utils.createRefsSummary(refsStats)

  try {
    await RefsStats.deleteMany()
    await RefsSummary.deleteMany()
    await RefsStats.create(refsStats)
    await RefsSummary.create(summary)
    console.log('Referees Statistics Data Saved'.green.inverse)
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

// Save Leagues Data into DB
const saveLeaguesData = async () => {
  const leagues = champs.map(champ=>{
    return {
      id: champ.id,
      country: champ.country,
      flag: champ.flag,
      league: champ.league,
      logo: champ.logo,
      title: champ.title,
      top: champ.top,
      num: parseInt(champ.num),
      season: parseInt(champ.season),
      year: parseInt(champ.year),
      standings: champ.standings, 
      standingsId: champ.standingsId,
    }
  })

  try {
    await Leagues.deleteMany()
    await Leagues.create(leagues)
    console.log('Leagues Data Exported'.green.inverse)
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

if (process.argv[2] === '-ref') {
  saveRefsStats()
}
else if (process.argv[2] === '-lea') {
  saveLeaguesData()  
} 