const express=require("express");
const path=require("path");
const http=require("http");
const socketIO=require("socket.io")

const app=express();
// connect express app to http server
const server=http.createServer(app);
const static_path=path.join(__dirname,"../public")
let io=socketIO(server)                 // Connect Socket TO Server

app.use(express.static(static_path))    // Direct app to path of public
console.log(static_path)
    
        io.on("connection",(socket)=>{
        console.log(socket.id)
        var c=io.sockets.server.engine.clientsCount

        socket.emit("connect_to_user",{
            socketid:socket.id,
            count:c
        })
        // Socket Listenning on user_name call
        socket.on("user_name",(e)=>{
            console.log(e.username)
            // Socket emiting for user
            socket.broadcast.emit("user_name_recieved",e)       
        })

        // Socket Listenning for Offer
        socket.on("offer",(e)=>{
            // Socket emiting offer data to another user
            socket.broadcast.emit("web_offer",e)                
        })
        // Socket Listenning for Answer
        socket.on("answer",(e)=>{
            // Socket emitting answer data to another user
            socket.broadcast.emit("web_answer",e)
        })

        // Socket Listenning when peer1 ice candidates are sent through socket
        socket.on("peer1_candidates",(e)=>{
            socket.broadcast.emit("peer1_candidate_recieve",e)
        })

        // Socket Listenning when peer2 ice candidates are sent through socket
        socket.on("peer2_candidate",(e)=>{
            socket.broadcast.emit("peer2_candidate_recieve",e)
        })

        // Socket Listenning for making remote screen big when screen is presenting
        socket.on("make_screen_big",(e)=>{
            console.log(e.status)
            socket.broadcast.emit("make_big",e)
        })

        // Socket Listenning for making remote Screen back to its original place and dimensions
        socket.on("make_screen_small",(e)=>{
            console.log(e.status)
            socket.broadcast.emit("make_small",e)
        })
     })

// listening to port
const port=process.env.PORT || 3000
server.listen(port,()=>{
    console.log("listenning")
})