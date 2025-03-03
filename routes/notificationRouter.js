const { subscribeUser, sendNotification, removeSubscription } = require("../controllers/notificationController");
const router = require("express").Router();

router.post("/subscribeUser", subscribeUser);
router.post("/", sendNotification);
router.delete("/unsubscribeUser", removeSubscription);

module.exports = router;