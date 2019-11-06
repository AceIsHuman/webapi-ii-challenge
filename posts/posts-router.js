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

// Get post by id

router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.findById(id)
    .then(post => {
      if (post.length === 0) {
        return res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
      return res.status(200).json(post);
    })
    .catch(err => {
      return res
        .status(500)
        .json({ error: "The post information could not be retrieved." });
    });
});

// Get comments from single post

router.get("/:id/comments", async (req, res) => {
  try {
    const id = req.params.id;
    const post = await db.findById(id).first();
    if (!post) {
      return res
        .status(404)
        .json({ message: "The post with the specified ID does not exist." });
    }
    const comments = await db.findPostComments(id).first();
    return !comments
      ? res
          .status(200)
          .json({ message: "There are no comments on this post yet" })
      : res.status(200).json(comments);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "The comments information could not be retrieved" });
  }
});

// Delete a post

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.remove(id)
    .then(count => {
      console.log(count);
      if (count === 0) {
        return res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
      return res.status(200).json({ message: "The post has successfully been deleted."})
    })
    .catch(err => {
      return res.status(500).json({ error: "The post could not be removed." });
    });
});

// Update a post

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const {title, contents} = req.body;
  if (!title, !contents) {
    return res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
  }
  db.update(id, req.body)
    .then(count => {
      if (count === 0) {
        return res.status(404).json({ message: "The post with the specified ID does not exist." });
      }
      db.findById(id)
        .then(post => {
          return res.status(200).json(post)
        })
        .catch(err => {
          return res.status(500).json({ error: "The updated post information could not be retrived."});
        })
    })
    .catch(err => {
      return res.status(500).json({ error: "The post information could not be modified." });
    })
});

module.exports = router;
