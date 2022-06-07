const startButton = document.getElementById("startButton");
startButton.addEventListener("click", createConnection);

var offerButton = document.getElementById("addOfferRemote");
offerButton.addEventListener("click", addRemoteOffer);

let peerConnection;

const config = {
  iceServers: [
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

async function createConnection() {
  console.log("Create RTCPeerConnection");
  peerConnection = new RTCPeerConnection(config);

  peerConnection.addEventListener("icecandidate", (e) =>
    onIceCandidate(peerConnection, e)
  );
  peerConnection.addEventListener("iceconnectionstatechange", (e) =>
    onIceStateChange(peerConnection, e)
  );

  const sendChannel = peerConnection.createDataChannel("sendChannel");
  sendChannel.onmessage = (e) => console.log("messsage received!!!" + e.data);
  sendChannel.onopen = (e) => console.log("open!!!!");
  sendChannel.onclose = (e) => console.log("closed!!!!!!");

  peerConnection.ondatachannel = (peerConnection, e) =>
    onDataChannel(peerConnection, e);

  try {
    const offer = await peerConnection.createOffer();
    await onCreateOfferSuccess(offer);
  } catch (e) {
    console.log(`Failed to create session description: ${e.toString()}`);
  }
}

function onDataChannel(pc, e) {
  const receiveChannel = e.channel;
  receiveChannel.onmessage = (e) =>
    console.log("messsage received!!!" + e.data);
  receiveChannel.onopen = (e) => console.log("open!!!!");
  receiveChannel.onclose = (e) => console.log("closed!!!!!!");
  pc.channel = receiveChannel;
}

async function onCreateOfferSuccess(desc) {
  try {
    await peerConnection.setLocalDescription(desc);
    clipboard = desc;
    document.getElementById("offerLocal").innerHTML = JSON.stringify(desc);
  } catch (e) {
    console.log("peerConnection setLocalDescription error", e);
  }

}

async function addRemoteOffer() {
  console.log("add remote offer");
  let offer = JSON.parse(document.getElementById("offerRemote").value);
  console.log(offer);

  try {
    await peerConnection.setRemoteDescription(offer);
    const ans = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(ans);
  } catch (e) {
    console.log("setRemoteDescription error", e);
  }
}

async function onIceCandidate(pc, event) {
  console.log("onIceCandidate"); //, pc, event.candidate);
  document.getElementById("sdps").innerHTML = JSON.stringify(
    peerConnection.localDescription
  );

}

function onIceStateChange(pc, event) {
  if (pc) {
    console.log("ICE state change event: ", event);
    printJSON(pc);
  }
}