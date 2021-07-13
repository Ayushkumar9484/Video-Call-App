let socket=io()         // Connection with socket
var senders=[]          // array for storing local Media Stream tracks
var localstream         // object for storing local Media Stream
var peer1               // User 1
var peer2               // User2
var datachannel         // Data Channel Object
let username            // Object for Username
var sender_to
const localVideo=document.getElementById("video_element")
const remote_video=document.getElementById("video_element_another")
const container=document.getElementById("container")
var message=document.getElementById("message")
var send_button=document.getElementById("send_button")
var message_container=document.getElementById("message_container")
var screen_share_button=document.getElementById("share_screen")
var chat_header=document.getElementById("message_header")
var record_btn=document.getElementById("record")
var stop_record=document.getElementById("stop_record")
var muteRemoteAudio=document.getElementById("remoteaudio")
var clear_chats=document.getElementById("clear_chats")
var count=0                     // count of users
var recordmedia                 // instance for initiating media Recorder
var clips=[]                    // array for storing recorded data

var constraints={               // configuration for GetUserMedia
    audio:true,
    video:true
}
var displayOptions={            // Configuration for Present Screen
    video:{
        cursor:"always"
    },
    audio:false
}
var recordOptons={              // Configuration for Recording
    audio:true,
    video:true
}
const configuration={           // Stun Servers List
    iceServers:[
        {urls:["stun:stun.voipstunt.com",
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
    "stun:stun2.l.google.com:19302",
    "stun:stun3.l.google.com:19302",
    "stun:stun4.l.google.com:19302"
]}
]
};
navigator.mediaDevices.getUserMedia(constraints)        // Getting Camera and Audio Access
    .then((stream)=>{
        localstream=stream
        localVideo.autoplay=true;
        localVideo.muted=true
        localVideo.srcObject=localstream;
})
    .catch((err)=>{
        console.log(err)
    })
    username=prompt("enter your username")              // Username Input
    socket.on("show_chats",(data)=>{
        if(data.length)
        {
            for(let i=0;i<data.length;i++)
            {
                var para=document.createElement("p")
                para.innerHTML=data[i].username+" : "+data[i].message
                para.setAttribute("class","inner_message")
                var remote_side=document.createElement("div")
                remote_side.appendChild(para)
                remote_side.setAttribute("class","remote_message")
                message_container.appendChild(remote_side);
            }
        }
        else message_container.innerHTML=" "
    })
    socket.on("message_sending_to_another",(recieve)=>{ 
        console.log("message recieved")
        console.log(recieve.username+" : "+recieve.message)
        var para=document.createElement("p")
        para.innerHTML=recieve.username+" : "+recieve.message
        para.setAttribute("class","inner_message")
        var remote_side=document.createElement("div")
        remote_side.appendChild(para)
        remote_side.setAttribute("class","remote_message")
        message_container.appendChild(remote_side);
      })
    socket.on("connect_to_user",(e)=>{                  // Socket Listening
            document.getElementById("join").addEventListener("click",()=>{
            console.log("entered")
            
            if(e.count==1)
            alert("WAIT FOR SOMEONE TO JOIN")
            
            if(e.count>1)
            {
                peer1 = new RTCPeerConnection(configuration);           // Creating Peer Connection of Peer1
                datachannel=peer1.createDataChannel("mydatachannel",{   // Creating Data Channel of Peer1
                ordered:true,
                maxPacketLifeTime:3000
                })
    localstream.getTracks().forEach((track)=>{                          // Pushing Media Tracks of Peer1 in senders array
        senders.push(peer1.addTrack(track,localstream))
    })
    console.log(senders)
      peer1.onicecandidate=(e)=>{                  // Getting Ice Candidates on Peer1
          console.log("candidates of peer 1");
          socket.emit("peer1_candidates",{
              data:e.candidate
          })
      }
      peer1.createOffer()                          // offer Gernerated by Peer1 for Peer2
      .then((offer)=>{
          peer1.setLocalDescription(offer);        // setting Local description of Peer1
          socket.emit("offer",{                    // Sending offer and Username to server
              data:offer,
              username:username
          })
      })
      .catch((err)=>{
          console.log(err)
      })

    }
    // datachannel.onmessage=(e)=>{ 
    //     socket.on                  // Recieving messages on DataChannel of Peer1
    //     var recieve=JSON.parse(e.data)
    // }
    })
    socket.on("web_answer",(e)=>{                  // Listenning to Server on web_answer call
        console.log("peer1")
        peer1.setRemoteDescription(new RTCSessionDescription(e.data))   // Setting Remote Description of peer1
        peer1.ontrack=add_remote_stream                                 // Setting Peer2 Media Stream on Peer1
        console.log(peer1)
        
        // Setting message Header of peer1
        // var chat_header_para=document.createElement("p")
        // chat_header_para.innerHTML=e.username
        // chat_header_para.setAttribute("class","setName")
        // chat_header.appendChild(chat_header_para)
        // chat_header.style.borderBottom="thin solid black"
    })

    socket.on("web_offer",(e)=>{                            // Listenning to Server on web_offer Call
      peer2=new RTCPeerConnection(configuration)            // Creating Peer Connection of Peer2
    //   peer2.addEventListener("datachannel",(e)=>{           // Recieving DataChannel Request
        console.log("channel connected")
        // datachannel=e.channel
            // socket.on("message_sending_to_another",(recieve)=>{
            //     //var recieve=JSON.parse(e.data)
            //     console.log("message recieved")
            //     console.log(recieve.username+" : "+recieve.message)
            //     var para=document.createElement("p")
            //     para.innerHTML=recieve.username+" : "+recieve.message
            //     para.setAttribute("class","inner_message")
            //     var remote_side=document.createElement("div")
            //     remote_side.appendChild(para)
            //     remote_side.setAttribute("class","remote_message")
            //     message_container.appendChild(remote_side);
            // })                        // Recieving messages on Data Channel of Peer2
        
    // })
    
    localstream.getTracks().forEach((track)=>{              // Pushing Media Tracks of Peer2 in senders array
        senders.push(peer2.addTrack(track,localstream))
    })
    console.log(senders)
      peer2.onicecandidate=(e)=>{                           // Getting Ice Candidates on Peer2
          console.log("candidates of peer2");
          socket.emit("peer2_candidate",{
              data:e.candidate
            })
        }
        peer2.setRemoteDescription(new RTCSessionDescription(e.data))       // Setting Remote Description of Peer2
        peer2.ontrack=add_remote_stream                                     // Setting Peer1 Media Stream on Peer2
        // Setting message Header of peer2
        // var chat_header_para=document.createElement("p")
        //     chat_header_para.innerHTML=e.username
        //     chat_header_para.setAttribute("class","setName")
        //     chat_header.appendChild(chat_header_para)
        //     chat_header.style.borderBottom="thin solid black"

      peer2.createAnswer()                                   // Answer generated by Peer2 for Peer1
      .then((answer)=>{
          peer2.setLocalDescription(answer)                  // Setting Local Description of Peer2
          socket.emit("answer",{                             // Sending Answer and Username to Server
              data:answer,
              username:username
          })
          console.log("peer2")
          console.log(peer2)
      })
     
  })
  
  send_button.addEventListener("click",()=>{                   // Event Handler for Sending Message    
      var message_to_send=message.value
      if(username==null) username=prompt("enter your username")
      if(username==null) return
      if(message_to_send==" ")
      {
          alert("enter some message")
          return
      }
      let data={
          username:username,
          message:message_to_send,
      }
    //   datachannel.send(JSON.stringify(data))                // Data Channel Send Function To Send Data TO Another Peer
    var para=document.createElement("p")
    para.innerHTML=username+" : "+message_to_send
    para.setAttribute("class","inner_message")
    var my_side=document.createElement("div")
    my_side.appendChild(para)
    my_side.setAttribute("class","local_message")
    message_container.appendChild(my_side);
    console.log("message send : "+message_to_send)
    message.value=" "
    socket.emit("input",data)
  })

  var options={
    mimeType: "video/webm; codecs=vp9"
  }
  record_btn.addEventListener("click",()=>{                     // Event Handler for Start Recording
      console.log("record button clicked ");
      navigator.mediaDevices.getDisplayMedia(recordOptons)      // Getting Display Media fro recording
      .then((stream)=>{
        recordmedia=new MediaRecorder(stream,options)
        recordmedia.start(100)
        recordmedia.ondataavailable=(e)=>{ if(e.data) clips.push(e.data) }
    })
    .catch((err)=>{
        comsole.log(err)
    })
})
    stop_record.addEventListener("click",()=>{                  // Event Handler for Stop recording
        recordmedia.stop()
        console.log(clips)
        let blob=new Blob(clips,{                               // Assembling clips data into one obejct using Blob Method
            type:"video/webm"
        })
        let vedioURL=URL.createObjectURL(blob);
        download(vedioURL)                                      // calling download function
        clips=[]
  })
  
  function download(vedioURL){                                  // Doenload function for downloading Recorded Video
      let permission=confirm("want to download recording")
      if(!permission) return
      var d=document.createElement("a")
      d.href=vedioURL
      d.download="recorderVedio.webm"
      d.click()
      console.log(vedioURL)
      console.log("video downloaded ")
  }

  screen_share_button.addEventListener("click",()=>{               // Event Handler for Screen Presenting 
      console.log("screen sharing is start")
      navigator.mediaDevices.getDisplayMedia(displayOptions)    // Getting Display Media for sharing
      .then((stream)=>{
          socket.emit("make_screen_big",{
              status:"make big"
          })
          let VedioTracks=stream.getTracks()[0]
          localVideo.srcObject=stream
          senders[1].replaceTrack(VedioTracks)
        VedioTracks.onended=()=>{
            console.log("screen sharing is off")
            console.log(localstream.getTracks()[0])
            senders[1].replaceTrack(localstream.getTracks()[1])
            localVideo.srcObject=localstream
            socket.emit("make_screen_small",{
                status:"make small"
            })
        }
      }).catch((err)=>{
          console.log(err)
      })
  })

  socket.on("make_big",(e)=>{                       // Listenning to server on make_big call
      console.log(e.status)
      remote_video.style.width="800px";
      remote_video.style.height="700px";
      remote_video.style.marginTop="-300px";
      remote_video.style.marginLeft="310px";

      localVideo.style.marginLeft="10px";
      localVideo.style.marginTop="-100px";
      localVideo.style.width="300px";
      localVideo.style.height="400px";
  })

  socket.on("make_small",(e)=>{                     // Listenning to server on make_small call
      console.log(e.status)
      remote_video.style.width="420px";
      remote_video.style.height="1000px";
      remote_video.style.marginLeft="40px";
      remote_video.style.marginRight="20px";
      remote_video.style.marginTop="-150px";

      localVideo.style.width="420px";
      localVideo.style.height="1000px";
      localVideo.style.marginLeft="40px";
      localVideo.style.marginRight="20px";
      localVideo.style.marginTop="-150px";
  })


  add_remote_stream=(e)=>{                          // add_remote_stream function Description
      remote_video.srcObject=e.streams[0]
  }
  socket.on("peer1_candidate_recieve",(e)=>{        
      console.log("peer1 candidate recieved")
      peer2.addIceCandidate(e.data)                 // Adding Ice Candidates of Peer1 in Peer2
  })
  
  socket.on("peer2_candidate_recieve",(e)=>{
      console.log("peer2 candidate recieved")
      peer1.addIceCandidate(e.data)                 // Adding Ice Candidates of Peer2 in Peer1
  })
})

document.getElementById("video_off").style.display="none"
let vflag=true;
function video_button()                             // Video ON/OFF function
{
    vflag=!vflag
    localstream.getVideoTracks()[0].enabled=vflag
    if(vflag)
    {
        document.getElementById("video_on").style.display="inline"
        document.getElementById("video_off").style.display="none"
    }
    else{
        document.getElementById("video_off").style.display="inline"
        document.getElementById("video_on").style.display="none"
    }
}

document.getElementById("mic_off").style.display="none"    
let aflag=true;
function audio_button()                             // Audio ON/OFF function
{
    aflag=!aflag
    localstream.getAudioTracks()[0].enabled=aflag
    if(aflag)
    {
        document.getElementById("mic_on").style.display="inline"
        document.getElementById("mic_off").style.display="none"
    }
    else{
        document.getElementById("mic_off").style.display="inline"
        document.getElementById("mic_on").style.display="none"
    }
    //alert("button pressed")
}
document.getElementById("remote_audio_off").style.display="none"
let RemoteMuted=false
  muteRemoteAudio.addEventListener("click",()=>{        // Event Handler for Mute Another Peer Audio
      RemoteMuted=!RemoteMuted
    remote_video.muted=RemoteMuted
    if(!RemoteMuted)
    {
        document.getElementById("remote_audio_on").style.display="inline"
        document.getElementById("remote_audio_off").style.display="none"
    }
    else{
        document.getElementById("remote_audio_off").style.display="inline"
        document.getElementById("remote_audio_on").style.display="none"
    }
  })

  clear_chats.addEventListener("click",()=>{
      let permission=confirm("you want to delete all chats ?")
      if(!permission) return
      socket.emit("clear_all_chats",{
          status:true
      })
  })
