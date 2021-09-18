const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://sergiu:123@cluster0.dfh1s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
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

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))


test_obj = {"pic_url": "", "likes": 3, "dislikes": 2, "comments": []}
insertIntoMongoCollection(test_obj);
