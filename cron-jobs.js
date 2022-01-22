let CronJob = require('cron').CronJob;

const cronTime = {
  j1:{h: 11, m: 51, s: 1}, // Schedule
  j2:{h: 11, m: 3, s: 1}, // Standings
  j3:{h: 11, m: 3, s: 21}, // Results
  j4:{h: 14, m: 2, s: 51}, // Matches
  j5:{h: 10, m: 24, s: 38}, // Referees
}

const { 
  parsing_schedule, 
  parsing_standing,
  parsing_results,
  parsing_matches,
  parsing_referees
} = require("./parse/start");

// Schedule tasks to be run on the server.
exports.jobs_parsing = ()=>{

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
  console.log("Run parsing matches ...");
  parsing_referees()
}, null, true, 'Europe/London');
job_parsing_referees.start();

}