const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5fab0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log('database connected');

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('drone-shop');
    const productsCollection = database.collection('products');
    const orderCollection = database.collection('orders');
    const adminCollection = database.collection('admins');

    //Add Products
    app.post('/addProducts', async (req, res) => {
      const products = req.body;
      console.log('hit the post api', products);
      const result = await productsCollection.insertOne(products);
      console.log(result);
      res.send(result);
    });

    //add admin
    app.post('/addAdmin', async (req, res) => {
      const admin = req.body;
      console.log('hit the post api', admin);
      const result = await adminCollection.insertOne(admin);
      console.log(result);
      res.send(result);
    });
    //get products
    app.get('/allProducts', async (req, res) => {
      const cursor = await productsCollection.find({});
      const products = await cursor.toArray();
      console.log(products);
      res.send(products);
    });
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);

      res.send(product);
    });

    //check admin
    app.get('/checkAdmin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { admin_email: email };
      const product = await adminCollection.findOne(query);
      console.log(product);

      res.send(product);
    });

    //post
    app.post('/placeOrder', async (req, res) => {
      const product = req.body;
      console.log('hit the post api', product);
      const result = await orderCollection.insertOne(product);
      console.log(result);
      res.send(result);
    });

    //update
    app.patch('/updateProduct/:id', async (req, res) => {
      const id = req.params.id;
      const { title, price, date, image, description } = req.body;
      console.log(req.body);
      console.log('getting specific package', id);
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.updateOne(query, {
        $set: {
          title,
          price,
          date,
          image,
          description,
        },
      });
      res.json(result);
    });

    app.patch('/updateStatus/:id', async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      console.log('getting specific product', id);
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.updateOne(query, {
        $set: {
          status: status,
        },
      });

      res.json(result);
    });

    //GET USER ORDERS
    app.get('/userOrders/:email', async (req, res) => {
      const email = req.params.email;
      if (email) {
        console.log('getting specific product', email);
        const query = { user: email };
        const cursor = await orderCollection.find(query);
        const product = await cursor.toArray();
        console.log(product);
        res.send(product);
      }
    });
    app.get('/allOrders', async (req, res) => {
      const cursor = await orderCollection.find({});
      const product = await cursor.toArray();
      res.send(product);
    });

    // DELETE API
    app.delete('/deleteProduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
    app.delete('/deleteOrders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await clint.close()
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running drone-shop-server');
});

app.listen(port, () => {
  console.log('Running drone-shop-server on port', port);
});
