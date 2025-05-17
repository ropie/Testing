const express = require(`express`);
const { connectToDb, getDb } = require(`./db.js`);
const { ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const playerData = "PlayerData";

//init app and middlewear
const app = express();
app.use(express.json());

//db connection
let db;
connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("app lisening on port 3000");
    });
    db = getDb();
  }
});

//routes

//Get All Players
app.get(`/players/all`, (req, res) => {
  let playerlist = [];

  db.collection(playerData)
    .find()
    .sort({ implantid: 1 })
    .forEach((player) => playerlist.push(player))
    .then(() => {
      res.status(200).json(playerlist);
    })
    .catch(() => {
      res.status(500).json({ error: `Could not fetch the player list` });
    });
}); 

//Get All Players and only show EOS and Implant ID
app.get(`/players`, (req, res) => {
  let playerlist = [];

  let results = db
    .collection(playerData)
    .find()
    .sort({ eosid: 1 })
    .project({ eosid: 1, implantid: 1, _id: 0 })
    .forEach((player) => playerlist.push(player))
    .then(() => {
      res.status(200).json(playerlist);
      console.log(playerlist);
    })
    .catch(() => {
      res.status(500).json({ error: `Could not fetch the player list` });
    });
});

//Get player by EOS
app.get(`/players/:eos`, (req, res) => {
  console.log(`Get requested ${req.params.eos}`);

  db.collection(playerData)
    .findOne({ eosid: req.params.eos })
    .then((doc) => {
      res.status(200).json(doc);
      console.log(doc);
    })
    .catch((err) => {
      res.status(500).json({ error: `EOS ID not found` });
      console.log(err);
    });
});

//Adding new players when first joining server
app.post(`/players/add/:id`, (req, res) => {
  const updates = req.body;
  db.collection(playerData)
    .findOneAndUpdate(
      { implantid: req.params.id },
      {
        $set: updates,
      },
      { upsert: true, returnNewDocument: true }
    )
    .then((result) => {
      res.status(200).json(result);
      console.log(
        "Routing: players/add/:id -- New player Information added --"
      );
      console.log(updates);
    })
    .catch((err) => {
      res.status(500).json({ error: `Could not add player` });
      console.log("Error adding player information");
      //console.log(updates);
    });
});

// Testing adding each by itself
app.post(`/players/:id`, (req, res) => {
  const updates = req.body;

  console.log(`User not found.  Adding to database`);
  db.collection(playerData)
    .findOneAndUpdate(
      { implantid: req.params.id },
      {
        $set: {
          steamxboxpsn: req.body.eosid,
          eosid: req.body.steamxboxpsn,
          charactername: req.body.charactername,
          implantid: req.body.implantid,
          charLevel: req.body.charLevel,
          tribe: req.body.tribe,
          gender: req.body.gender,
          allnotes: req.body.allnotes,
          bttse: req.body.bttse,
          bttab: req.body.bttab,
          bttext: req.body.bttext,
          chibiLevel: req.body.chibiLevel,
          bosses: req.body.bosses,
          offline: req.body.offline,
        },
        $inc: { playTime: req.body.playTime },
      },
      { upsert: true, returnNewDocument: true }
    )
    .then((result) => {
      res.status(200).json(result);
      console.log("New player Information added");
      console.log(updates);
    })
    .catch((err) => {
      res.status(500).json({ error: `Could not add player` });
      console.log("Error adding player information");
      console.log(updates);
    });
});

//For adding tokens to Player Account
app.post(`/tokens/:eos`, (req, res) => {
  const updates = req.body;

  db.collection(playerData)
    .findOneAndUpdate(
      { eosid: req.params.eos },
      { $inc: updates },
      { upsert: true, returnNewDocument: true }
    )
    .then((result) => {
      res.status(200).json(result);
      console.log("Tokens added");
      console.log(updates);
    })
    .catch((err) => {
      res.status(500).json({ error: `Could not update player` });
      console.log("Error adding player information");
      console.log(updates);
    });
  /*
  db.collection("players")
    .findOneAndUpdate(
      { implantid: req.params.id },
      { $inc: { playTime: updates.playTime } },
      { upsert: true, returnNewDocument: true }
    ) 
    .then((result) => {
      res.status(204).json(result);
      console.log("Player Total Time updated");
    })  
    .catch((err) => {
      res.status(500).json({ error: `Could not update player` });
      console.log("Error updating player total time");
    }); */
});

app.delete(`/players/:id`, (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection(`players`)
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
        console.log("Success");
      })
      .catch((err) => {
        res.status(500).json({ error: `Could not delete player` });
        console.log("Error deleting");
      });
  } else {
    res.status(500).json({ error: `Not a vaild ID` });
    console.log("Not valid id");
  }
});

/*
app.patch(`/players/:id`, (req, res) => {
  const updates = req.body;

  if (ObjectId.isValid(req.params.id)) {
    db.collection(`players`)
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result);
        console.log("Player Information updated");
      })
      .catch((err) => {
        res.status(500).json({ error: `Could not update player` });
        console.log("Error updating player information");
      });
  } else {
    res.status(500).json({ error: `Not a vaild ID` });
    console.log("Not valid id to update");
  }
});
*/

app.patch(`/players/:id`, (req, res) => {
  const updates = req.body;

  //if (ObjectId.isValid(req.params.id)) {
  db.collection(`players`)
    //.findOneAndUpdate({implantid: new ObjectId(req.params.id) }, { $set: updates }, {upsert: true, returnNewDocument: true})
    .findOneAndUpdate(
      { implantid: req.params.id },
      { $inc: { playTime: updates.playTime } },
      { upsert: true, returnNewDocument: true }
    )
    .then((result) => {
      res.status(200).json(result);
      console.log("Player Total Time updated");
    })
    .catch((err) => {
      res.status(500).json({ error: `Could not update player` });
      console.log("Error updating player total time");
    });
  /*} else {
      res.status(500).json({ error: `Not a vaild ID` });
      console.log(`Not valid id to update ${req.params.id}`);
    }*/
});

function stringToHex(str) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    let hexString = charCode.toString(16);
    hex += hexString.padStart(2, "0"); // Pad with leading zeros if necessary
  }

  // Ensure the hex string is 24 characters long
  while (hex.length < 24) {
    hex += "00"; // Pad with "00" if it's shorter
  }

  return hex.substring(0, 24); // Truncate if it's longer
}
