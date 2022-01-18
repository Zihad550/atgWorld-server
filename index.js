const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 8000;

// middle wares
app.use(cors());
app.use(express.json());

// mongo Client
const client = new MongoClient(process.env.URI);

async function run() {
  try {
    await client.connect();

    const database = client.db("atgWorld");

    const postsCollection = database.collection("posts");
    const usersCollection = database.collection("users");

    // get all posts
    app.get("/posts", async (req, res) => {
      const result = await postsCollection.find({}).toArray();
      res.json(result);
    });

    // create new post
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollection.insertOne(post);
      res.json(result);
    });

    // delete a post
    app.delete("/posts", async (req, res) => {
      const id = req.query.id;
      const result = await postsCollection.deleteOne({ _id: ObjectId(id) });
      res.json(result);
    });

    // give like
    app.put("/posts/like", async (req, res) => {
      const post = req.body;
      const filter = { _id: ObjectId(post._id) };
      const options = { upsert: true };
      const updateDoc = { $set: { likesCount: parseInt(post.likesCount) + 1 } };
      const result = await postsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // give comment
    app.put("/posts/comment", async (req, res) => {
      const newPost = req.body;
      const filter = { _id: ObjectId(newPost._id) };
      const options = { upsert: true };
      const updateDoc = {
        $push: {
          comments: {
            comment: newPost.comment,
            userName: newPost.userName,
            userEmail: newPost.userEmail,
          },
        },
      };
      const result = await postsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // save user
    app.post("/user/register", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // get all user
    app.get("/user/register", async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.json(result);
    });

    // get a single user
    app.get("/user/register", async (req, res) => {
      const id = req.query.id;
      const result = await usersCollection
        .findOne({ _id: ObjectId(id) })
        .toArray();
      res.json(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to atg world server");
});

app.listen(port, () => {
  console.log("App running on port:", port);
});
