let CronJob = require('cron').CronJob;

const cronTime = {
  j1:{h: 1, m: 29, s: 15}, // Schedule
  j2:{h: 1, m: 33, s: 55}, // Standings
  j3:{h: 1, m: 42, s: 35}, // Results
  j4:{h: 13, m: 8, s: 25}, // Matches
  j5:{h: 1, m: 55, s: 23}, // Referees
  j6:{h: 1, m: 52, s: 55}, // Fouls
}

const { parseTopChampExtraData } = require("./parse/locals");

const { 
  parsing_schedule, 
  parsing_standing,
  parsing_results,
  parsing_matches,
  parsing_referees,
  parsing_fouls
} = require("./parse/start");

// Schedule tasks to be run on the server.
exports.jobs_parsing = ()=>{

// Data parsing - all modules
let job_all_parsing = new CronJob(`55 14 13 * * *`, async function() {
  console.log("Run all parse modules...");
  try {
    await parseTopChampExtraData()
    await parsing_schedule()
    await parsing_standing(),
    await parsing_results(),
    await parsing_matches(),
    await parsing_referees(),
    await parsing_fouls()
  }
  catch (e) {
    console.log(e);
  }
  finally{
    console.log("done");
  }
  
}, null, true, 'Europe/London');
job_all_parsing.start();

// 1st Data parsing - Today matches, Fixtures and Latest scores
let job_parsing_schedule = new CronJob(`${cronTime.j1.s} ${cronTime.j1.m} ${cronTime.j1.h} * * *`, function() {
  console.log("Run parsing schedule...");
  parsing_schedule()
}, null, true, 'Europe/London');
job_parsing_schedule.start();

// 2nd Data parsing - Standings
let job_parsing_standing = new CronJob(`${cronTime.j2.s} ${cronTime.j2.m} ${cronTime.j2.h} * * *`, function() {
  console.log("Run parsing standings ...");
  parsing_standing();
}, null, true, 'Europe/London');
job_parsing_standing.start();

// 3rd Data parsing - Results and Champs summary
let job_parsing_results = new CronJob(`${cronTime.j3.s} ${cronTime.j3.m } ${cronTime.j3.h} * * *`, function() {
  console.log("Run parsing results...");
   parsing_results()
}, null, true, 'Europe/London');
job_parsing_results.start();

// 4th Data parsing - Matches Statistics
let job_parsing_matches = new CronJob(`${cronTime.j4.s} ${cronTime.j4.m } ${cronTime.j4.h} * * *`, function() {
  console.log("Run parsing matches ...");
   parsing_matches()
}, null, true, 'Europe/London');
job_parsing_matches.start();

// 5th Data parsing - Referees Statistics
let job_parsing_referees = new CronJob(`${cronTime.j5.s} ${cronTime.j5.m } ${cronTime.j5.h} * * *`, function() {
  console.log("Run parsing referees statistics ...");
  parsing_referees()
}, null, true, 'Europe/London');
job_parsing_referees.start();

// 6th Data parsing - Fouls Statistics
let job_parsing_fouls = new CronJob(`${cronTime.j6.s} ${cronTime.j6.m } ${cronTime.j6.h} * * *`, function() {
  console.log("Run parsing fouls statistics...");
  parsing_fouls()
}, null, true, 'Europe/London');
job_parsing_fouls.start();

}