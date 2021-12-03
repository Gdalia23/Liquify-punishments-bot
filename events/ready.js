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

const warn = {
  name: "warn",
  filename: "warn.js",
  version: "1.0.0"
}
// warn command is loaded
console.log(` :: ⬜️ Command ${warn.name} | Loaded version ${warn.version} from ("${warn.filename}")`)

const mute = {
  name: "mute",
  filename: "mute.js",
  version: "1.0.0"
}
// mute command is loaded
console.log(` :: ⬜️ Command ${mute.name} | Loaded version ${mute.version} from ("${mute.filename}")`)

const ban = {
  name: "ban",
  filename: "ban.js",
  version: "1.0.0"
}
// ban command is loaded
console.log(` :: ⬜️ Command ${ban.name} | Loaded version ${ban.version} from ("${ban.filename}")`)

const punishmentlogs = {
  name: "punishmentlogs",
  filename: "punishment-logs.js",
  version: "1.0.0"
}

// punishmentlogs command is loaded
console.log(` :: ⬜️ Command ${punishmentlogs.name} | Loaded version ${punishmentlogs.version} from ("${punishmentlogs.filename}")`)
};