const express = require("express");
const router = express.Router();
const db = require("../data/db");

// Add a Post

router.post("/", (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    return res.status(400).json({
      errorMessage: "Please provide title and contents for the post."
    });
  }
  db.insert(req.body)
    .then(({ id }) => {
      db.findById(id).then(post => {
        if (post) {
          return res.status(201).json(post);
        }
        return res.status(500).json({
          error: "There was an error while saving the post to the database"
        });
      });
    })
    .catch(err => {
      return res.status(500).json({
        error: "There was an error while saving the post to the database"
      });
    });
});

// Add a comment to a post

router.post("/:id/comments", (req, res) => {
  const id = req.params.id;
  const { text } = req.body;
  if (!text) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide text for the comment." });
  }
  db.insertComment({ ...req.body, post_id: id })
    .then(({ id }) => {
      db.findCommentById(id)
        .then(comment => {
          return res.status(201).json(comment);
        })
        .catch(err => {
          return res.status(500).json({
            error: "There was an error while saving the comment to the database"
          });
        });
    })
    .catch(err => {
      return res.status(404).json({
        message: `The post with the specified ID, ${id}, does not exist.`
      });
    });
});

// Get all posts

router.get("/", (req, res) => {
  db.find()
    .then(posts => {
      return res.status(200).json(posts);
    })
    .catch(err => {
      return res
        .status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

module.exports = router;
