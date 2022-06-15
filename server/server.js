// const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http,{
	cors: {
    origin: '*',
  }
});


// Set up Global configuration access
dotenv.config();
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.JWT_SECRET_KEY);

var ObjectId = require('mongodb').ObjectID;
/Port from environment variable or default - 4001/
const port = process.env.PORT || 4001;

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DATABASE_URI;


// const saltRounds = 10;



io.on("connection", (socket) => {
    socket
    .on("signup",(values,callback)=>{
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect((err, db)=> { 	
            if (err) throw err;
            var dbo = db.db("Deskala");
            dbo.collection("users").find({email:values.email}).toArray((err, res)=>{
                if(err) throw err;
                if(res.length <1){
                    // bcrypt.genSalt(saltRounds, function(err, salt) {
                    //     bcrypt.hash(values.password, salt, function(err, hash) {
                    //         if (err) throw err;
                    //         values.password = hash;
                    //         dbo.collection('users').insertOne(values, (err, res)=>{
                    //             if (err) throw err;
                    //             callback(true);
                    //             db.close();
                    //         });
                    //     });
                    // });
                    var secretkey =  cryptr.encrypt(values.password);
                    values.password = secretkey;
                    dbo.collection('users').insertOne(values, (err, res)=>{
                        if (err) throw err;
                        callback(true);
                        db.close();
                    });
                }
                else{
                    callback("User already exists");
                    db.close();
                }
            });
        });
    })
    .on("authentication", (values,callback)=>{
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect((err, db)=>{
            if (err) throw err;
            var dbo = db.db("Deskala");
            dbo.collection("users").find({email: values.email}).toArray((err, res)=>{
                if (err)throw err;
                if(res.length > 0){
                    let hash = res[0].password;
                    const secretkey = cryptr.decrypt(hash);
                    //bcrypt.compare(values.password, hash, function(err, result) {
                    if(secretkey == values.password){
                        let jwtSecretKey = process.env.JWT_SECRET_KEY;
                        let data = {
                            time: Date(),
                            email: values.email
                        }                      
                        const token = jwt.sign(data, jwtSecretKey,{
                            expiresIn:'1h' 
                        });
                        callback({success:true,token:token});
                        }
                    else
                        callback({success: false, message: "Invalid Email or Password"});
                    db.close();
                }
                else{
                    callback({success: false, message: "User does not exist.Please Create a new account."});
                }
            });
        })
    })
    .on("validateToken",(req,callback) => {
        // Tokens are generally passed in the header of the request
        // Due to security reasons.
      
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
      
        try {
            const token = req;
            const verified = jwt.verify(token, jwtSecretKey);
            if(verified){
                callback({success:true,message:"Successfully Verified"});
            }else{
                // Access Denied
                callback({success:false, message:"Access Denied"});
            }
        } catch (error) {
            // Access Denied
            callback({success:false, message:"Access Denied"});
        }
        
    })
    .on("getcandidateslist",callback=>{
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect((err, db)=> {
            if (err) throw err;
            var dbo = db.db("Deskala");
            dbo.collection("candidates").find({}).toArray((err, res)=>{
                if(err)throw err;
                callback(res);
                db.close();
            });
        });
    })
    .on("createcandidate",(values,callback)=>{
        values.result = 'shortlisted';
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect((err, db)=> {
            if (err) throw err;
            var dbo = db.db("Deskala");
            dbo.collection("candidates").insertOne(values,(err, res)=>{
                if(err)throw err;
                else
                    callback(true);
                db.close();
            });
        });
    })
    .on("deletecandidate",(id,callback)=>{
        id = new ObjectId(id);
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect((err, db)=> {
            if (err) throw err;
            var dbo = db.db("Deskala");
            dbo.collection("candidates").deleteOne({_id:id},(err, res)=>{
                if(err)throw err;
                callback(true);
                db.close();
            });
        });
    })
    .on("editcandidate", (values, id,callback) => {
        id = new ObjectId(id);
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect((err, db)=> {
            if (err) throw err;
            var dbo = db.db("Deskala");
            dbo.collection("candidates").updateOne({_id:id},{$set:values},(err, res)=>{
                if(err)throw err;
                callback(true);
                db.close();
            });
        });
    })
    .on("changeresult",(value,id,callback) => {
        id = new ObjectId(id);
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        client.connect((err, db)=> {
            if (err) throw err;
            var dbo = db.db("Deskala");
            dbo.collection("candidates").updateOne({_id:id},{$set:{result:value}},(err, res)=>{
                if(err)throw err;
                callback(true);
                db.close();
            });
        });
    })
    
    
});



http.listen(port, () => {
    console.log('listening on *:' + port);
  });