const { addFeedback } = require("../controllers/feedbackController");
const router = require("express").Router();

router.post("/", addFeedback);

module.exports = router;
