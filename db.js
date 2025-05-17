const { MongoClient } = require("mongodb");
/*const uri =
  "mongodb+srv://ropiemasta:06ZTDtucNPPfjo4y@ecobot.mx9rtvv.mongodb.net/Ark";
*/
const uri =
  "mongodb+srv://ropiemasta:06ZTDtucNPPfjo4y@ecobot.mx9rtvv.mongodb.net/Ark";

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
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
