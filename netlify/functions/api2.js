import axios from "axios";
import express, { Router } from "express";
import bodyParser from "body-parser";
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getFirestore,
} from "firebase/firestore";
import serverless from "serverless-http";
import Stripe from "stripe";

const app = express();

/* Initialize Firebase */
const firebaseConfig = {
  apiKey: process.env.GATSBY_FIREBASE_API_KEY,
  authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.GATSBY_FIREBASE_APP_ID,
  measurementId: process.env.GATSBY_FIREBASE_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);
const db = getFirestore();
/* End Initialize Firebase */

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Initialize routes
const router = Router();

app.use("/api2/", router);

router.get("/hello", (req, res) => res.send("Hello World!")); // Test API

router.post("/webhook", async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    appInfo: {
      name: "Pawtner",
    },
  });
  const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_KEY;

  let payload;
  let signature;
  if (process.env.NETLIFY_DEV === "true") {
    payload = JSON.stringify(req.body, null, 2);
    signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: endpointSecret,
    });
  } else {
    payload = req.rawBody;
    signature = req.headers["stripe-signature"];
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const data = event.data.object;

      const { client_reference_id: clientReferenceId } = data;
      if (!clientReferenceId) {
        return res
          .status(400)
          .send(`Webhook Error: client_reference_id is missing`);
      }

      let [animalId, userId] = clientReferenceId.split(/_(.+)/, 2);
      userId = userId.replace("_", "|"); // reformat back Auth0 user_id
      try {
        // Update puppy's status to "Reserved"
        const puppyRef = doc(db, "puppy", animalId);
        await updateDoc(puppyRef, {
          status: "Reserved",
        });

        // Add payment record
        await addDoc(collection(db, "payment"), {
          user_id: userId,
          animal_id: animalId,
          type: "reservation",
          amount: data.amount_total / 100,
          currency: data.currency,
          payment_id: data.payment_intent,
          payment_status: data.payment_status,
          created: data.created,
        });

        // Trigger a rebuild in gatsby via webhook
        axios.post(process.env.NETLIFY_BUILD_WEBHOOK);
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      break;
    default:
      return res.status(400).send(`Unhandled event type ${event.type}`);
  }

  return res.status(200).send(`Event "${event.type}" successfully processed`);
});

export const handler = serverless(app);
