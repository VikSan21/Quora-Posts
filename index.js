const express = require("express");
const app = express();
const mysql = require("mysql2");
const { v4: uuidv4 } = require('uuid');
const path = require("path");
const methodoverride = require("method-override");

const port = 3000;




app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"static_files/css")));
app.use(express.static(path.join(__dirname,"static_files/js")));
app.use(methodoverride("_method"));

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));



const connection = mysql.createConnection(
    {
        host : "localhost",
        user : "root",
        password : "",
        database : "quora" 
    }
);


app.get("/posts",(req, res) => {

    const query = `SELECT * FROM posts`;
    
    try{
        connection.query(query,(err, posts) => {
            if(err) throw err;

            // console.log(posts);
            res.render("index.ejs",{posts});
        });
    } catch(err){
        res.send("error");
        // console.log(err);
    }
});


app.get("/posts/add",(req, res) => {
    res.render("add.ejs");
});

app.post("/posts/add", (req,res) => {
    const {username, content} = req.body;
    
    const data = [username,uuidv4(),content];
    const query = "INSERT INTO posts(username, post_id, post_content) VALUES (?,?,?)";
    // console.log(username, content);

    try{
        connection.query(query,data,(err, result) =>{
            if (err) throw err;

            res.redirect("/posts");
        });
    }catch(err){
        res.send(err);
    }
});

app.get("/posts/:id",(req,res) => {
    const {id} = req.params;

    const query = `SELECT username, post_content FROM posts WHERE post_id = "${id}"`;
    
    try{
        connection.query(query,(err,post_data) => {
            if(err) throw err;
            post_data[0].id= id;
            res.render("view.ejs",{post_data})
        });
    }
    catch(err){
        res.send(err);
    }
});

app.get("/posts/update/:id",(req, res) => {

    const {id} = req.params;

    const query = `SELECT username, post_content FROM posts WHERE post_id = "${id}"`;
    
    try{
        connection.query(query,(err,post_data) => {
            if(err) throw err;
            post_data[0].id= id;
            res.render("update.ejs",{post_data})
        });
    }
    catch(err){
        res.send(err);
    }

});

app.patch("/posts/:id",(req, res) => {

    const {id} = req.params;

    const {content} = req.body;

    const query = `UPDATE posts SET post_content = "${content}" WHERE post_id = "${id}"`;
    
    try{
        connection.query(query,(err) => {
            if(err) throw err;
            res.redirect("/posts");
        });
    }
    catch(err){
        res.send(err);
    }

});

app.delete("/posts/:id",(req,res) =>{
    const {id} = req.params;
    const query = `DELETE from posts WHERE post_id = "${id}"`;

    try{
        connection.query(query,(err,response) =>{
            if (err) throw err;
            // console.log(response);
            res.redirect("/posts");
        });
    }catch (err){
        res.send("error");
    }
});


app.use("*",(req, res) => {
    res.send(
        {
            message : "page not found"
        }
    );
});

app.listen(port, () => {
    console.log(`Requests are being listen on port no ${port}.`);
});