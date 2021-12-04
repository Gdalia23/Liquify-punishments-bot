const logger = require('../config/logger');
const mongo = require('../mongo')

// Event Emittion
module.exports = client => {

// mongoConnect function
const mongoConnect = async function() {
      await mongo().then((mongoose) => {
   try {
     console.log('Connected to mongo!')
   } finally {
     mongoose.connection.close()
   }
 })
}

mongoConnect();

// Credit Event
logger.info();

// warn command is loaded
console.log(` :: ⬜️ Command warn | Loaded version 1.0.0 from ("warn.js")`)

// mute command is loaded
console.log(` :: ⬜️ Command mute | Loaded version 1.0.0 from ("mute.js")`)

// ban command is loaded
console.log(` :: ⬜️ Command ban | Loaded version 1.0.0 from ("ban.js")`)

// punishmentlogs command is loaded
console.log(` :: ⬜️ Command punishmentlogs | Loaded version 1.0.0 from ("punishment-logs.js")`)
};
