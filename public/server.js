var senders=[]
let socket=io()
var localstream
var peer1
var peer2
var datachannel1
//var datachannel2
let username
var sender_to
const localVideo=document.getElementById("video_element")
const another_vedio=document.getElementById("video_element_another")
const container=document.getElementById("container")
var message=document.getElementById("message")
var s_button=document.getElementById("send_button")
var message_container=document.getElementById("message_container")
var screen_share_btn=document.getElementById("share_screen")
var chat_header=document.getElementById("message_header")
var record_btn=document.getElementById("record")
var stop_record=document.getElementById("stop_record")
var muteRemoteAudio=document.getElementById("remoteaudio")
var dropDown=document.getElementById("dropDown")
var count=0
var recordmedia,clips=[]
var constraints={
    audio:true,
    video:true
}
var displayOptions={
    video:{
        cursor:"always"
    },
    audio:false
}
var recordOptons={
    audio:true,
    video:true
}
const configuration={
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
// wrong spelling of   getUserMedia
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream)=>{
        localstream=stream
        localVideo.autoplay=true;
        localVideo.muted=true
        localVideo.srcObject=localstream;
        socket.emit("e",{
            ans:"already in"
        })
         //sender_to=stream.getTracks()
  //      localstream.getTracks().forEach(track=>senders.push(peer1.addTrack(track,localstream)))
})
    .catch((err)=>{
        console.log(err)
    })
    //console.log(localstream)
    username=prompt("enter your username")
    socket.on("connect_to_user",(e)=>{
        console.log(e.socketid)
        // {
            console.log(e.count)
            document.getElementById("on_vlick").addEventListener("click",()=>{
            console.log("entered")
            
            if(e.count==1)
            alert("WAIT FOR SOMEONE TO JOIN")
            
            if(e.count>1)
            {
                //username=prompt("enter your username")
                peer1 = new RTCPeerConnection(configuration);
               // senders.push(peer1.addTrack(sender_to[0]))
                // data channel
                datachannel1=peer1.createDataChannel("mydatachannel",{
        ordered:true,
        maxPacketLifeTime:3000
    })
    localstream.getTracks().forEach((track)=>{
        senders.push(peer1.addTrack(track,localstream))
    })
    console.log(senders)
  //console.log(senders[0])
      peer1.onicecandidate=(e)=>{
          //alert("candidates of peer 1 send")
          console.log("candidates of peer 1");
          socket.emit("peer1_candidates",{
              data:e.candidate
          })
      }
      peer1.createOffer()
      .then((offer)=>{
          peer1.setLocalDescription(offer);
          socket.emit("offer",{
              data:offer
          })
      })
      .catch((err)=>{
          console.log(err)
      })
    }

    // add here
    datachannel1.onmessage=(e)=>{
        var recieve=JSON.parse(e.data)
        console.log("message recieved")
        console.log(recieve.username+" : "+recieve.message)
        var para=document.createElement("p")
        para.innerHTML=recieve.message
        para.setAttribute("class","inner_message")
        var remote_side=document.createElement("div")
        remote_side.appendChild(para)
        remote_side.setAttribute("class","remote_message")
        message_container.appendChild(remote_side);

        if(recieve.c==1){
        var chat_header_para=document.createElement("p")
        chat_header_para.innerHTML=recieve.username
        chat_header_para.setAttribute("class","setName")
        chat_header.appendChild(chat_header_para)
        chat_header.style.backgroundColor="lightgreen"
        }
    }
    })
    socket.on("web_answer",(e)=>{
        console.log("peer1")
       // alert("answer recieved")
        peer1.setRemoteDescription(new RTCSessionDescription(e.data))
        peer1.ontrack=add_remote_stream
        console.log(peer1)
    })

    socket.on("web_offer",(e)=>{        
      peer2=new RTCPeerConnection(configuration)
      // data channel start
      peer2.addEventListener("datachannel",(e)=>{
        console.log("channel connected")
        datachannel1=e.channel
        //datachannel2=datachannel1
        datachannel1.onmessage=(e)=>{
            var recieve=JSON.parse(e.data)
            console.log("message recieved")
            console.log(recieve.username+" : "+recieve.message)
            var para=document.createElement("p")
            para.innerHTML=recieve.message
            para.setAttribute("class","inner_message")
            var remote_side=document.createElement("div")
            remote_side.appendChild(para)
            remote_side.setAttribute("class","remote_message")
            message_container.appendChild(remote_side);
            if(recieve.c==1){
            var chat_header_para=document.createElement("p")
            chat_header_para.innerHTML=recieve.username
            chat_header_para.setAttribute("class","setName")
            chat_header.appendChild(chat_header_para)
            chat_header.style.backgroundColor="lightgreen"
            }
        }
    })
    
    localstream.getTracks().forEach((track)=>{
        senders.push(peer2.addTrack(track,localstream))
    })
    console.log(senders)
      peer2.onicecandidate=(e)=>{
          console.log("candidates of peer2");
          socket.emit("peer2_candidate",{
              data:e.candidate
            })
        }
        peer2.setRemoteDescription(new RTCSessionDescription(e.data))
        peer2.ontrack=add_remote_stream
        
      peer2.createAnswer()
      .then((answer)=>{
          peer2.setLocalDescription(answer)
          socket.emit("answer",{
              data:answer
          })
          console.log("peer2")
          console.log(peer2)
      })
     
  })
  
  s_button.addEventListener("click",()=>{
      var message_to_send=message.value
      if(message_to_send==" ")
      {
          alert("enter some message")
          return
      }
      count++;
      let data={
          username:username,
          message:message_to_send,
          c:count
      }
      datachannel1.send(JSON.stringify(data))
      var para=document.createElement("p")
      para.innerHTML=message_to_send
      para.setAttribute("class","inner_message")
      var my_side=document.createElement("div")
      my_side.appendChild(para)
      my_side.setAttribute("class","local_message")
      message_container.appendChild(my_side);
      console.log("message send : "+message_to_send)
      message.value=" "
  })

  var options={
    mimeType: "video/webm; codecs=vp9"
  }
  record_btn.addEventListener("click",()=>{
      console.log("record button clicked ");
      navigator.mediaDevices.getDisplayMedia(recordOptons)
      .then((stream)=>{
        recordmedia=new MediaRecorder(stream,options)
        recordmedia.start(100)
        recordmedia.ondataavailable=(e)=>{ if(e.data) clips.push(e.data) }
    })
    .catch((err)=>{
        comsole.log(err)
    })
})
    stop_record.addEventListener("click",()=>{
        recordmedia.stop()
        console.log(clips)
        let blob=new Blob(clips,{
            type:"video/webm"
        })
        let vedioURL=URL.createObjectURL(blob);
        download(vedioURL)
        clips=[]
  })
  
  function download(vedioURL){
      let permission=confirm("want to download recoeding")
      if(!permission) return
      var d=document.createElement("a")
      d.href=vedioURL
      d.download="recorderVedio.webm"
      d.click()
      console.log(vedioURL)
      console.log("video downloaded ")
  }

  screen_share_btn.addEventListener("click",()=>{
      console.log("screen sharing is start")
      navigator.mediaDevices.getDisplayMedia(displayOptions)
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

  socket.on("make_big",(e)=>{
      console.log(e.status)
      another_vedio.style.width="800px";
      another_vedio.style.height="700px";
      another_vedio.style.marginTop="-300px";
      another_vedio.style.marginLeft="310px";

      localVideo.style.marginLeft="10px";
      localVideo.style.marginTop="-100px";
      localVideo.style.width="300px";
      localVideo.style.height="400px";
  })

  socket.on("make_small",(e)=>{
      console.log(e.status)
      another_vedio.style.width="450px";
      another_vedio.style.height="640px";
      another_vedio.style.marginLeft="50px";
      another_vedio.style.marginRight="25px";
      another_vedio.style.marginTop="0px";

      localVideo.style.width="450px";
      localVideo.style.height="640px";
      localVideo.style.marginLeft="50px";
      localVideo.style.marginRight="25px";
      localVideo.style.marginTop="0px";
  })
  let RemoteMuted=false
    muteRemoteAudio.addEventListener("click",()=>{
        RemoteMuted=!RemoteMuted
      another_vedio.muted=RemoteMuted
    })

  add_remote_stream=(e)=>{
      another_vedio.srcObject=e.streams[0]
  }
  socket.on("peer1_candidate_recieve",(e)=>{
      console.log("peer1 candidate recieved")
      peer2.addIceCandidate(e.data)
  })
  
  socket.on("peer2_candidate_recieve",(e)=>{
      console.log("peer2 candidate recieved")
      peer1.addIceCandidate(e.data)
  })
})

// VEDIO ON/OFF FUNCTION

let vflag=true;
function video_button()
{
    vflag=!vflag
    localstream.getVideoTracks()[0].enabled=vflag
}
// AUDIO ON OFF FUNCTION

let aflag=true;
function audio_button()
{
    aflag=!aflag
    localstream.getAudioTracks()[0].enabled=aflag
    //alert("button pressed")
}
