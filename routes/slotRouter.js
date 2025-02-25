const { fetchSlots, addSlots, deleteSlot, updateSlot } = require("../controllers/slotController");
const router = require("express").Router();

router.get("/", fetchSlots);
router.post("/", addSlots);
router.delete("/", deleteSlot);
router.put("/", updateSlot);

module.exports = router;
