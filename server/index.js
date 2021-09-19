const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://sergiu:123@cluster0.dfh1s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// File System Module
const fs = require("fs");

// Utilities for working with file and directory paths
const path = require("path");

// Middleware Multer to upload the photo to the server in a folder called `uploads` so we can process it
const multer = require("multer");

// Is this called anywhere?
async function insertIntoMongoCollection(obj) {
  client.connect((err) => {
    const collection = client.db("sergiu_test").collection("drip_picture");

    collection.insertOne(obj, function (err, res) {
      if (err) {
        console.log("error inserting object :(");
        throw err;
      }
      console.log(obj, "sucessfully inserted!");
      client.close();
    });
  });
}

// Support incrementing either the like or dislike counts
function incrementReactionCount(id, reaction_column_name, callback) {
  client.connect((err) => {
    const collection = client.db("myFirstDatabase").collection("images");

    // First retrieve the current number of likes
    var mongo = require("mongodb");
    var oid = new mongo.ObjectId(id);
    console.log(oid);
    collection.findOne({ _id: oid }, { _id: 0 }, (err, react_res) => {
      if (err) {
        console.log("error finding object :(");
        throw err;
      }
      console.log(">>> ", react_res);
      updated_num_reacts = react_res[reaction_column_name] + 1; // Now we have a new number of likes...

      var update_form = { $set: { likes: updated_num_reacts } };
      if (reaction_column_name === "dislikes") {
        update_form = { $set: { dislikes: updated_num_reacts } };
      }
      collection
        .updateOne({ _id: oid }, update_form)
        .then((obj) => {
          console.log(`updated the ${reaction_column_name} count!`);
          client.close();
        })
        .catch((reason) => {
          console.log("update failed :(", reason);
        });
      updated_num_reacts;
      callback(updated_num_reacts);
    }); // Select the likes from matching object
  });
}

const app = express();
const apiPort = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/like/:id", (req, res) => {
  id = req.params.id;

  updated_num_likes = incrementReactionCount(
    id,
    "likes",
    (updated_num_likes) => {
      res.send(updated_num_likes.toString());
    }
  );
});

app.get("/dislike/:id", (req, res) => {
  id = req.params.id;

  updated_num_likes = incrementReactionCount(
    id,
    "dislikes",
    (updated_num_likes) => {
      res.send(updated_num_likes.toString());
    }
  );
});

app.post("/comment/:id", (req, res) => {
  var new_comment = req.body.new_comment;
  console.log(new_comment);

  client.connect((err) => {
    const collection = client.db("myFirstDatabase").collection("images");

    var mongo = require("mongodb");
    var oid = new mongo.ObjectId(req.params.id);

    collection.findOne({ _id: oid }, { _id: 0 }, (err, react_res) => {
      if (err) {
        console.log("error finding object :(");
        throw err;
      }

      collection.updateOne(
        { _id: oid },
        {
          $push: {
            comments: new_comment,
          },
        }
      );
    });
  });
  res.send(new_comment);
});

app.post("/hash_tag/:id", (req, res) => {
  var new_tag = req.body.new_tag;
  console.log(new_tag);

  client.connect((err) => {
    const collection = client.db("myFirstDatabase").collection("images");

    var mongo = require("mongodb");
    var oid = new mongo.ObjectId(req.params.id);
    collection.findOne({ _id: oid }, { _id: 0 }, (err, react_res) => {
      if (err) {
        console.log("error finding object :(");
        throw err;
      }

      var new_tag = req.body.new_tag;
      collection.updateOne(
        { _id: oid },
        {
          $push: {
            hash_tags: new_tag,
          },
        }
      );
    });
  });
  res.send(new_tag);
});

// Create connection to database
mongoose.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);

// Store image on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

// Load imageModel
var imgModel = require("../models/models.js");

// Retrieves all images from database
app.get("/images", (req, res) => {
  imgModel.find({}, (err, items) => {
    res.json(items);
  });
});

const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

// Upload an image
app.post("/upload/:user_id", upload.single("image"), (req, res, next) => {
  console.log(req.body);

  var obj = {
    user_id: req.params.user_id,
    img: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      contentType: "image/jpeg",
    },
    expires: req.body.expires,
    likes: 0,
    dislikes: 0,
    comments: [],
    hastags: [],
  };

  imgModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      res.json({ Response: "uploaded image :D" });
    }
  });

  // unlinkAsync(req.file.path);
});

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
