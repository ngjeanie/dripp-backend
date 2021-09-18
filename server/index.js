// Starting NodeJS
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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
});

/// Template Stuff
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set EJS as templating engine
app.set("view engine", "ejs");
