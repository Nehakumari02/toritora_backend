const webpush = require("../utils/webpushConfig")

const fs = require("fs");
const path = require("path");

const subscriptionsFile = path.join(__dirname, "../data/subscriptions.json");

const loadSubscriptions = () => {
  if (!fs.existsSync(subscriptionsFile)) {
    fs.writeFileSync(subscriptionsFile, "[]"); // Create an empty array if file doesn't exist
    return [];
  }

  try {
    const data = fs.readFileSync(subscriptionsFile, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ Error reading subscriptions file:", error);
    return []; // Return an empty array on error
  }
};

const saveSubscriptions = (subscriptions) => {
  try {
    fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2));
  } catch (error) {
    console.error("❌ Error writing to subscriptions file:", error);
  }
};

let subscriptions = []

const subscribeUser = (req, res) => {
    const subscription = req.body;
    console.log(req)
  
    let subscriptions = loadSubscriptions();

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription data" });
    }
  
    // Prevent duplicate subscriptions
    const isAlreadySubscribed = subscriptions.some((sub) => sub.endpoint === subscription.endpoint);
    if (!isAlreadySubscribed) {
      subscriptions.push(subscription);
      saveSubscriptions(subscriptions);
      console.log("✅ New subscription added:", subscription.endpoint);
    } else {
      console.log("🔄 User is already subscribed.");
    }
  
    res.status(201).json({ status: "success", message: "Subscribed successfully" });
  };
  

const sendNotification = async (req, res) => {
    const { title,body,icon,data } = req.body;
    if (!title || !body || !icon || !data) {
      return res.status(400).json({ message: "Missing required notification fields" });
    }

    const notificationPayloadData = {
        title,
        body,
        icon,
        data
    }
  
    const notificationPayload = JSON.stringify(notificationPayloadData);
  
    console.log("Sending Notification:", notificationPayload);
    subscriptions = loadSubscriptions();
    const newSubscriptions = [];
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload);
          newSubscriptions.push(subscription); // Keep valid subscriptions
        } catch (err) {
          console.error("❌ Error sending notification:", err.statusCode, err.body);
          if (err.statusCode === 410) {
            console.warn("⚠️ Subscription has expired or is invalid. Removing it.");
          } else {
            newSubscriptions.push(subscription); // Keep if error isn't related to expiration
          }
        }
      })
    );
  
    // Update the subscriptions list, removing expired ones
    subscriptions = newSubscriptions;
    saveSubscriptions(newSubscriptions);
  
    res.status(200).json({ message: "Notification sent successfully." });
  };

  const removeSubscription = (req, res) => {
    const { endpoint } = req.body;
  
    if (!endpoint) {
      return res.status(400).json({ message: "Missing subscription endpoint" });
    }
  
    let subscriptions = loadSubscriptions();
    const newSubscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);
  
    if (subscriptions.length === newSubscriptions.length) {
      return res.status(404).json({ message: "Subscription not found" });
    }
  
    saveSubscriptions(newSubscriptions);
    console.log("❌ Subscription removed:", endpoint);
    res.status(200).json({ status: "success", message: "Unsubscribed successfully" });
  };
  
  module.exports = { subscribeUser, sendNotification, removeSubscription };