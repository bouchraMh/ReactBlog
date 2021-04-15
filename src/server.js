import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';



const app = express();


app.use(express.static(path.join(__dirname, '/build')));


app.use(bodyParser.json());


const withDB =  async (operation, res) => {

   try{

    const client = await MongoClient.connect('mongodb://localhost:27017',{ useNewUrlParser : true})
    const db = client.db('ClusterReact');

    await operation(db);
    client.close();
   }

   catch(error){
        res.status(500).json({message : 'error connection', error })
   }


}


app.get('/api/articles/:name' , async (req,res) =>{
 

      withDB( async( db)=> {
        const articleName = req.params.name;
        const articlesInfo = await db.collection('articles').findOne({name : articleName});
        res.status(200).json(articlesInfo);
    },res);
})


app.post('/api/articles/:name/upvote' , async (req , res )=> {

    withDB( async (db) => {

        const articleName = req.params.name;
        const articlesInfo = await db.collection('articles').findOne({name : articleName});
    
         await db.collection('articles').updateOne({name : articleName } ,{
            '$set' : {
                upvotes : articlesInfo.upvotes+1,
            }, 
         });
    
    
         const updatedInfo  =  await db.collection('articles').findOne({name : articleName});
    
    
         res.status(200).json(updatedInfo);


    },res)
   
})

app.post('/api/articles/:name/add-comment' , (req , res) => {

    withDB(async (db) => {

        const { userName , text } = req.body;
        const articleName = req.params.name;

        const articlesInfo = await db.collection('articles').findOne({name : articleName});
    
         await db.collection('articles').updateOne({name : articleName } ,{
            '$set' : {
                comments : articlesInfo.comments.concat({userName , text}),
            }, 
         });
    
    
         const updatedInfo  =  await db.collection('articles').findOne({name : articleName});   
         res.status(200).json(updatedInfo);
    },res) 
});



app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(3000 , () => console.log('Listenning on port 30000'));