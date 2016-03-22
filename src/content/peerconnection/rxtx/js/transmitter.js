/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

document.querySelector('button#hangup').onclick = hangup;
document.querySelector('button#setAnswer').onclick = setAnswer;
var videoElement = document.querySelector('#preview');
var transmitterDataTextarea  = document.querySelector('#transmitterData');
var receiverDataTextarea  = document.querySelector('#receiverData');

var videoStream;
var transmitterPeerConnection;

var transmitterData = {
	sdp: null,
	candidates: []
};

navigator.getUserMedia(
	{ audio: false, video: true },
	onVideoStream, 
	errorCallback);


function onVideoStream(stream) {
  videoElement.srcObject = stream;
  videoStream = stream;

var servers = {
	iceServers : [{ url: 'stun:stun.l.google.com:19302'}]	  
};
//var servers = null;

  transmitterPeerConnection = new RTCPeerConnection(servers);
  transmitterPeerConnection.addStream(videoStream);
  transmitterPeerConnection.onicecandidate = transmitterIceCallback;
  transmitterPeerConnection.createOffer(
	gotTransmitterDescription, 
	errorCallback, 
	{ offerToReceiveAudio: 0, offerToReceiveVideo: 1 });
}


function gotTransmitterDescription(offer) {
  transmitterData.sdp = offer.sdp;
  transmitterDataTextarea.value = JSON.stringify(transmitterData);
  transmitterPeerConnection.setLocalDescription(offer, successCallback, errorCallback);
}

function setAnswer() {
  var receiverData = JSON.parse(receiverDataTextarea.value);	
  console.log(receiverData);
  var answer = new RTCSessionDescription({
	  type: 'answer',
	  sdp: receiverData.sdp});
  transmitterPeerConnection.setRemoteDescription(answer,
      successCallback,
      errorCallback);

  // check if receiver candidates must be set up in setRemoteDescription callback
  for (var i = 0; i < receiverData.candidates.length; i++) {
    transmitterPeerConnection.addIceCandidate(
   		new RTCIceCandidate(receiverData.candidates[i]), 
		successCallback, 
		errorCallback
	);
  }
}

function transmitterIceCallback(event) {
	if (event.candidate) {
		transmitterData.candidates.push(event.candidate);
		transmitterDataTextarea.value = JSON.stringify(transmitterData);
	}
}

function hangup() {
  videoStream.getTracks().forEach(function(track) {
    track.stop();
  });
  transmitterPeerConnection.close();
  transmitterPeerConnection = null;
}
