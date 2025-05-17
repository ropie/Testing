const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGODB_SRV: uri } = process.env;

let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.log(err);
        console.log(uri);
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
