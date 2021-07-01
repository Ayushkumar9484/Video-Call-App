const express=require("express");
const path=require("path");
const http=require("http");
const socketIO=require("socket.io")
const nodemailer=require("nodemailer")

const app=express();
// connect express app to http server
const server=http.createServer(app);
const static_path=path.join(__dirname,"../public")
let io=socketIO(server)

app.use(express.static(static_path))
console.log(static_path)
    
        io.on("connection",(socket)=>{
        console.log(socket.id)
        var c=io.sockets.server.engine.clientsCount
        // if(c>1)
        // {
        socket.emit("connect_to_user",{
            socketid:socket.id,
            count:c
        })
        // }
        socket.on("e",(e)=>{
            socket.broadcast.emit("en",e)
        })
        socket.on("user_name",(e)=>{
            console.log(e.username)
            socket.broadcast.emit("user_name_recieved",e)
        })
        socket.on("offer",(e)=>{
            //console.log(e.data)
            socket.broadcast.emit("web_offer",e)
        })

        socket.on("answer",(e)=>{
           // console.log(e.data)
            socket.broadcast.emit("web_answer",e)
        })

        socket.on("peer1_candidates",(e)=>{
 // console.log("candidates of peer 1 is recieved")
            //console.log(e.data)
            socket.broadcast.emit("peer1_candidate_recieve",e)
        })

        socket.on("peer2_candidate",(e)=>{
            //console.log("candidates of peer 2 recieved")
            //console.log(e.data)
            socket.broadcast.emit("peer2_candidate_recieve",e)
        })
        
     })

// listening to port

const port=process.env.PORT || 3000
server.listen(port,()=>{
    console.log("listenning")
})