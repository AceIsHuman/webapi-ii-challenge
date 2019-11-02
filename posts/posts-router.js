const express = require("express");
const router = express.Router();
const db = require("../data/db");

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
        return res.status(500).json({ error: "There was an error while saving the post to the database" });
      });
    })
    .catch(err => {
      return res.status(500).json({ error: "There was an error while saving the post to the database" });
    });
});

module.exports = router;
