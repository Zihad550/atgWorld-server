const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 8000;
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transport = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API,
    },
  })
);

// middle wares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

    // get a single user
    app.get("/user/register", async (req, res) => {
      const id = req.query.id;
      const result = await usersCollection.findOne({ _id: ObjectId(id) });

      res.json(result);
    });

    // check if the user is registered
    app.get("/user/login", async (req, res) => {
      const email = req.query.email;
      const password = req.query.password;
      const result = await usersCollection.findOne({ email, password });
      res.json(result);
    });

    // get all user
    app.get("/users/register", async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.json(result);
    });

    // check if the user is exists or not
    app.get("/forgotPassword", async (req, res) => {
      // check is the users exists
      const resetEmail = req.query.resetEmail;
      const result = await usersCollection
        .find({ email: resetEmail })
        .toArray();
      res.json(result);

      /* if (result === []) {
        res.json({ alert: "user not found please register" });
      } else { */
      /* transport.sendMail({
          to: resetEmail,
          from: "mr.zihad321@gmail.com",
          subject: "password reset",
          html: `
            <p> You requested for password reset </p>
            <h5> client in this link <a href="${resetEmail}/reset">Link</a> to reset password</h5>
            `,
        });
      } */
    });

    // update user password
    app.put("/resetPassword", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          password: user.password,
          confirmPassword: user.password,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
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
