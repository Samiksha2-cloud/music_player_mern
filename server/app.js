const express = require("express");//imports express framework in the project so we can use it//
const app = express();//initializes the framework and creates our"server application"object. this object is the "brain" that will listen to our music requests.

const cors = require("cors");//this is a package 
// Define a route for GET requests to the root URL
app.get("/",(req , res) =>{
    return res.json("hey there....")
})//after this we hit the command call developer(npm dev)in terminal.it will trigger the command called nodemon app.js .itss like a keyword 
// Start the server
app.listen(4000,() => console.log("listening to port 4000"));
//If your professor asks why you didn't use Firebase Storage, you have a very professional "Industry-style" answer ready:

//"I chose to store the media URLs in Firestore and host the assets externally to optimize the database footprint and avoid unnecessary cloud storage costs, while still maintaining a seamless streaming experience in the React frontend."
