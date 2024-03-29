const mongoose = require("mongoose");

// Image schema
const imageSchema = new mongoose.Schema({
  id: Number,
  user_id: Number,
  img: {
    data: Buffer,
    contentType: String,
  },
  expires: Date,
  caption: String,
  likes: Number,
  dislikes: Number,
  comments: Array,
  hastags: Array,
});

// Image is a model which has a schema imageSchema
module.exports = new mongoose.model("Image", imageSchema);
