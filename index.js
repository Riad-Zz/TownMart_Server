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
    const bidsCollection = dataBase.collection("bids") ;
    const userCollection = dataBase.collection("users") ;


    //****************************** Product Related APis **********************************************/

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

    //---------------------------Simple Api to get All Product--------------------------
    app.get('/product',async (req,res)=>{
        const email = req.query.email ;
        const query = {} ;
        if(email){
            query.email = email ;
        }
        const cursor = townMartProductCollction.find(query) ;
        const result = await cursor.toArray() ;
        res.send(result) ;
    })

    //-----------------------------Recent Product APi--------------------------------------
    app.get('/recentproduct',async (req,res)=>{
        const query = {} ;
        const totalLimit = 6 
        const sortType = {created_at : -1}
        const cursor =await townMartProductCollction.find(query).sort(sortType).limit(totalLimit) ;
        const result =await cursor.toArray() ;
        res.send(result) ;
    })

    //---------------------------Simple APi to get Single Product By ID--------------------
    app.get('/product/:id',async(req,res)=>{
        const userId = req.params.id ;
        const query = {_id : new ObjectId(userId)} ;
        const result = await townMartProductCollction.findOne(query) ;
        res.send(result) ;
    })


    //****************************** Bids Related APis **********************************************/

    //-------------------------Simple APi to get All the bids------------------------
    app.get('/bids',async(req,res)=>{
        const email = req.query.email ;
        // console.log(email) ;
        const query = {} ;
        if(email){
            query.buyer_email = email ;
        }
        const cursor = bidsCollection.find(query) ;
        const result =await cursor.toArray() ;
        res.send(result) ;
    })

    //---------------------------Simple Api to Post Bids------------------------------
    app.post('/bids',async(req,res)=>{
        const newBid = req.body ;
        const result =await bidsCollection.insertOne(newBid) ;
        res.send(result) ;
    }) 

    //-----------------------Simple APi to Delete Bids---------------------------------
    app.delete('/bids/:id',async(req,res)=>{
        const bidId = req.params.id ;
        const query = {_id : new ObjectId(bidId)} ;
        const result =await bidsCollection.deleteOne(query) ;
        res.send(result) ;
    })

    //-----------------------Simple Api to get 1 Bid-----------------------------
    app.get('/bids/:id' , async(req,res)=>{
        const bidId = req.params.id ;
        const query = {_id : new ObjectId(bidId)} ;
        const result =await bidsCollection.findOne(query) ;
        res.send(result) ;
    })

    //--------------------------Get all the bid for a product------------------------------
    app.get('/product/bid/:id',async(req,res)=>{
        const productId = req.params.id ;
        const query = {product : productId} ;
        const cursor =await bidsCollection.find(query)
        const result =await cursor.toArray() ;
        res.send(result) ;
    })

    //*********************************** User Related Apis*********************************************** */

    //---------------------------Post/Create a New User--------------------------------------------
    app.post('/user',async (req,res)=>{
        const user = req.body ;
        const email = req.body.email ;

        const query = {email : email} ;
        const existingEmail = await userCollection.findOne(query) ;
        if(existingEmail){
            res.send("User already Exist ! ") ;
        }else{
            const result =await userCollection.insertOne(user) ;
            res.send(result) ;
        }
    })
    
    //---------------------------Get all User--------------------------------------------
    app.get('/user',async(req,res)=>{
        const cursor = await userCollection.find() ;
        const result = await cursor.toArray() ;
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

