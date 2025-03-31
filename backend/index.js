const express = require('express')
const app = express()
const port = 3000
const cors = require("cors")


app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://rakib456:P21Hj14qvJI726YU@cluster0.umvg5wn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const user = client.db("web_main").collection("user")

    app.post('/register', async(req, res) => {
        const {name,email,password}=req.body
        const existingUser = await user.findOne({ email });
        if (existingUser) return res.status(400).json({ status: 400,message: "User already exists. Please go to the login page" });

        const newUser = {name,email,password}

        const result = await user.insertOne(newUser)
        res.status(201).json({status:201, message: "User registered successfully" });
        
      })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})