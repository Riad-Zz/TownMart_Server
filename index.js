const express = require("express") ;
const cors = require("cors") ;
require('dotenv').config() ;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express() ;
const port = process.env.PORT || 3000 ;

//------------------MiddleWire----------------------------
app.use(cors()) ;
app.use(express.json()) ;


//----------------Test APi--------------------------------------
app.get('/' , (req,res)=>{
    res.send("Hello") ;
})

//------------------Connect to MOngoDB------------------------
const uri = process.env.MONGO_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();
    
    const dataBase = client.db("TownMart") ;
    const townMartProductCollction = dataBase.collection("product") ;

    //-------------------------Simple Post api to add Product-------------------------
    app.post('/product', async (req,res)=>{
        const newProduct = req.body ;
        const result = await townMartProductCollction.insertOne(newProduct) ;
        res.send(result) ;
    })

    //------------------------Simple Api to delete Product-----------------------
    app.delete('/product/:id',async (req,res)=>{
        const userID = req.params.id ;
        const query = {_id : new ObjectId(userID)} ;
        const result = await townMartProductCollction.deleteOne(query)
        res.send(result) ;
    })

    //-------------------------Simple Api to Update Product--------------------------
    app.patch('/product/:id',async(req,res)=>{
        const userId = req.params.id ;
        const currentProduct = req.body ;
        const query = {_id : new ObjectId(userId)} ;
        const update = {
            $set : currentProduct ,
        }
        const option = {} ;
        const result = await townMartProductCollction.updateOne(query,update,option) ;
        res.send(result) ;
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`Server is running on port :  ${port}`) ;
})

