// Starting NodeJS
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// const { MongoClient } = require('mongodb');
// const uri = pass; // replace
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function insertIntoMongoCollection(obj) {
//     client.connect(err => {
//         const collection = client.db("sergiu_test").collection("drip_picture");

//         collection.insertOne(obj, function(err, res) {
//             if (err) {
//             console.log("error inserting object :(");
//             throw err;
//             }
//             console.log(obj, " sucessfully inserted!");
//             client.close();
//         });
//     });
// }

// File System Module
const fs = require("fs");

// Utilities for working with file and directory paths
const path = require("path");

// Middleware Multer to upload the photo to the server in a folder called `uploads` so we can process it
const multer = require("multer");

const app = express();
const apiPort = 3000;

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

// Create connection to database
mongoose.connect(
  "mongodb+srv://sergiu:123@cluster0.dfh1s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);

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

app.get("/", (req, res) => {
  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("imagesPage", { items: items });
    }
  });
});

const { promisify } = require("util");

const unlinkAsync = promisify(fs.unlink);

app.post("/", upload.single("image"), (req, res, next) => {
  var obj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  };
  imgModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      // item.save();
      res.redirect("/");
    }
  });
  unlinkAsync(req.file.path);
});

/// Template Stuff
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set EJS as templating engine
app.set("view engine", "ejs");

// app.get('/like/:pic_id', (req, res) => {
//     pic_uri = req.params.pic_id

//     client.connect(err => {
//         const collection = client.db("sergiu_test").collection("drip_picture");

//         // First retrieve the current number of like
//         var mongo = require('mongodb');
//         var oid = new mongo.ObjectID(pic_uri);
//         collection.findOne({ _id: oid }, { "likes" : 1, _id: 0 }, (err, like_res) => {
//             if (err) {
//                 console.log("Error finding object :( ");
//                 throw err;
//             }
//             console.log(">>> ", like_res);
//             updated_num_likes = like_res['likes'] + 1; // Now we have a new number of likes...

//             collection.updateOne({ _id : oid }, {$set: {"likes": updated_num_likes}})
//             .then((obj) => {
//                 console.log("Updated the likes count!");
//                 client.close();
//             })
//             .catch((reason) => [
//                 console.log("Update failed :(", reason)
//             ]);

//             res.send(updated_num_likes.toString());
//         }); // Select the likes from matching object
//     });

// })
