const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { MongoClient } = require('mongodb');
const uri = pass; // replace
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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

const app = express()
const apiPort = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/like/:pic_id', (req, res) => {
    pic_uri = req.params.pic_id

    client.connect(err => {
        const collection = client.db("sergiu_test").collection("drip_picture");

        // First retrieve the current number of like
        var mongo = require('mongodb');
        var oid = new mongo.ObjectID(pic_uri);
        collection.findOne({ _id: oid }, { "likes" : 1, _id: 0 }, (err, like_res) => {
            if (err) {
                console.log("Error finding object :( ");
                throw err;
            }
            console.log(">>> ", like_res);
            updated_num_likes = like_res['likes'] + 1; // Now we have a new number of likes...

            collection.updateOne({ _id : oid }, {$set: {"likes": updated_num_likes}})
            .then((obj) => {
                console.log("Updated the likes count!");
                client.close();
            })
            .catch((reason) => [
                console.log("Update failed :(", reason)
            ]);

            res.send(updated_num_likes.toString());
        }); // Select the likes from matching object
    });

})

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))
