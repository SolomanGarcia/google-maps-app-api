const express = require("express");
const mongoose = require("mongoose");
const app = express();
const axios = require("axios");
const port = 3000;
const Store = require("./api/models/store");
const GoogleMapsService = require("./api/services/googleMapsService");
const googleMapsService = new GoogleMapsService();
require("dotenv").config();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

mongoose.connect(
  `mongodb+srv://Soloman:${process.env.MONGO_KEY}@cluster0.v31tf.mongodb.net/<dbname>?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
);

app.use(express.json({ limit: "50mb" }));

app.post("/api/stores", (req, res) => {
  let dbStores = [];
  let stores = req.body;
  stores.forEach((store) => {
    dbStores.push({
      storeName: store.name,
      phoneNumber: store.phoneNumber,
      address: store.address,
      openStatusText: store.openStatusText,
      addressLines: store.addressLines,
      location: {
        type: "Point",
        coordinates: [store.coordinates.longitude, store.coordinates.latitude]
      }
    });
  });

  Store.create(dbStores, (err, stores) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(stores);
    }
  });
});
//H7nV2JRxVfWKWonG
app.get("/api/stores", (req, res) => {
  const zipCode = req.query.zip_code;

  googleMapsService
    .getCoordinates(zipCode)
    .then((coordinates) => {
      Store.find(
        {
          location: {
            $near: {
              $maxDistance: 3218,
              $geometry: {
                type: "Point",
                coordinates: coordinates
              }
            }
          }
        },
        (err, stores) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send(stores);
          }
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
});

app.delete("/api/stores", (req, res) => {
  Store.deleteMany({}, (err) => {
    res.status(200).send(err);
  });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
