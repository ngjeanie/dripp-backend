const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require("mongoose");

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://sergiu:123@cluster0.dfh1s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// File System Module
const fs = require("fs");

// Utilities for working with file and directory paths
const path = require("path");

// Middleware Multer to upload the photo to the server in a folder called `uploads` so we can process it
const multer = require("multer");

async function insertIntoMongoCollection(obj) {
    client.connect(err => {
        const collection = client.db("sergiu_test").collection("drip_picture");

        collection.insertOne(obj, function(err, res) {
            if (err) {
                console.log("error inserting object :(");
                throw err;
            }
            console.log(obj, " sucessfully inserted!");
            client.close();
        });
    });
}

// Support incrementing either the like or dislike counts
function incrementReactionCount(pic_uri, reaction_column_name, callback) {
    client.connect(err => {
        const collection = client.db("sergiu_test").collection("drip_picture");

        // First retrieve the current number of like
        var mongo = require('mongodb');
        var oid = new mongo.ObjectID(pic_uri);
        collection.findOne({ _id: oid }, { _id: 0 }, (err, react_res) => {
            if (err) {
                console.log("Error finding object :( ");
                throw err;
            }
            console.log(">>> ", react_res);
            updated_num_reacts = react_res[reaction_column_name] + 1; // Now we have a new number of likes...

            var update_form = {$set: {"likes": updated_num_reacts}}
            if (reaction_column_name === "dislikes") {
                update_form = {$set: {"dislikes": updated_num_reacts}}
            }
            collection.updateOne({ _id : oid }, update_form)
            .then((obj) => {
                console.log(`Updated the ${reaction_column_name} count!`);
                client.close();
            })
            .catch((reason) => {
                console.log("Update failed :(", reason)
            });

            updated_num_reacts;
            callback(updated_num_reacts);
        }); // Select the likes from matching object
    });
}

const app = express()
const apiPort = (process.env.PORT || 5000)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/like/:pic_id', (req, res) => {
    pic_uri = req.params.pic_id

    updated_num_likes = incrementReactionCount(pic_uri, "likes", (updated_num_likes) => {
        res.send(updated_num_likes.toString());
    });
})

app.get('/dislike/:pic_id', (req, res) => {
    pic_uri = req.params.pic_id

    updated_num_likes = incrementReactionCount(pic_uri, "dislikes", (updated_num_likes) => {
        res.send(updated_num_likes.toString());
    });
})

app.post('/comment/:pic_id', (req, res) => {
    client.connect(err => {
        const collection = client.db("sergiu_test").collection("drip_picture");

        // First retrieve the current number of like
        var mongo = require('mongodb');
        var oid = new mongo.ObjectID(pic_uri);
        collection.findOne({ _id: oid }, { _id: 0 }, (err, react_res) => {
            if (err) {
                console.log("Error finding object :( ");
                throw err;
            }
            
            new_comment = req.body.new_comment;
            collection.updateOne({ _id : oid }, {$push : {
                comments : new_comment
            }});
        }); 
    });
})

app.post('/hash_tag/:pic_id', (req, res) => {
    client.connect(err => {
        const collection = client.db("sergiu_test").collection("drip_picture");

        // First retrieve the current number of like
        var mongo = require('mongodb');
        var oid = new mongo.ObjectID(pic_uri);
        collection.findOne({ _id: oid }, { _id: 0 }, (err, react_res) => {
            if (err) {
                console.log("Error finding object :( ");
                throw err;
            }
            
            new_tag = req.body.new_tag;
            collection.updateOne({ _id : oid }, {$push : {
                hash_tags : new_tag
            }});
        }); 
    });
})


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

app.get("/upload", (req, res) => {
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

app.post("/upload", upload.single("image"), (req, res, next) => {
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

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

