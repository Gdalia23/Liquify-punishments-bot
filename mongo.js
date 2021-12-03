const mongoose = require('mongoose')
const { mongoPath } = require('./config.json')

// Connecting to MongoDB
module.exports = async () => {
  await mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  return mongoose
}