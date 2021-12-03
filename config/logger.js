const {createLogger, format, transports} = require('winston');
const {combine, timestamp, colorize, printf} = format;

// Winston Format
const infoFormat = combine(timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), colorize(), printf(({level, timestamp}) => `[${timestamp}] [${level}] Bot created by Gdalia`));

// Create Logger
module.exports = createLogger({
    transports: [
        new transports.Console({
            level: 'info',
            format: infoFormat
        })
    ],
    exitOnError: false
});