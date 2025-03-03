const { fetchToritai, addToritai } = require("../controllers/toritaiController");
const router = require("express").Router();

router.get("/", fetchToritai);
router.post("/", addToritai);

module.exports = router;
