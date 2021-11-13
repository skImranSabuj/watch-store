const express = require('express');
const cors = require('cors');
const axios = require('axios').default;
const ObjectId = require('mongodb').ObjectId;
// const { initializeApp } = require('firebase-admin/app');

const { MongoClient } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;
//furebase Admin initialization
var admin = require("firebase-admin");

// var serviceAccount = require('./extour-9aea2-firebase-adminsdk-7geoq-cd70b9f949.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

//midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0x1dg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function verifytoken(req, res, next) {
//     // console.log(req.headers.authorization);
//     if (req.headers?.authorization?.startsWith('Bearer ')) {
//         const idToken = req.headers.authorization.split('Bearer ')[1];
//         try {
//             const decodedUser = await admin.auth().verifyIdToken(idToken);
//             req.decodedUserEmail = decodedUser.email
//         }
//         catch {

//         }
//     }
//     next();
// }
async function run() {
    try {
        await client.connect();
        const database = client.db("watch_dorkar");
        const watchCollections = database.collection("watches");
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');
        const userCollection = database.collection('users');

        //GET API
        app.get('/watches', async (req, res) => {
            const cursor = watchCollections.find({});

            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No Watches found!");
            }
            const watches = await cursor.toArray();
            res.send(watches);
        });
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const type = req.query.type;
            console.log(email,'...',type);
            // if (req.decodedUserEmail === email) {
            if (email||type) {
                console.log('inside verified')
                // const ;
                type ? query = {} : query = { email: email };
                const cursor = orderCollection.find(query);

                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                res.status(401).json({ message: 'User not authorized' })
            }
        });

        // Get Single place
        app.get('/watches/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const place = await watchCollections.findOne(query);
            res.send(place)
            console.log(`Got place: ${id} result: ${place}`);
        })
        //POST API
        app.post('/watches', async (req, res) => {
            const newplace = req.body;
            const result = await watchCollections.insertOne(newplace);
            console.log('got new place', req.body);
            console.log('added place', result);
            res.json(result);
        });
        // Use POST to get data by keys
        app.post('/watches/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const watches = await watchCollections.find(query).toArray();
            res.send(watches);
        });
        // Add orders API:
        app.post('/orders', async (req, res) => {

            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log(result);
            res.json(result);
        });
        app.get('/reviews', async (req, res) => {
                const cursor = reviewCollection.find({});
                const reviews = await cursor.toArray();
                res.send(reviews);
        });
        // Add review API:
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });
        //User POST API
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            console.log('got new user:', req.body);
            console.log('added user:', result);
            res.json(result);
        });
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        // Use POST to get orders by id
        app.post('orders/byKeys', async (req, res) => {
            const keys = req.body;
            console.log('Hitted');
            console.log('body baba: ', keys)
            const query = { email: { $in: keys } }
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        });
        // Get Single place
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const order = await orderCollection.findOne(query);
            res.send(order)
            console.log(`Got place: ${id} result: ${order}`);
        })
        //DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            console.log(`place ${id}  deleted Successfully`, result);
            res.json(result)
        })
        //UPDATE API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: `Approved`
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    console.log('Watch Dorkar?!');
    res.send("Hello Watches! Lets Explore")
});

app.listen(port, () => {
    console.log('Watch-Dorkar Listening from port:', port)
})