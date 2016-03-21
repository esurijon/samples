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

var videoStream;
var videoElement = document.querySelector('#preview');
var transmitterPeerConnection;

var transmitterCandidatesTextarea  = document.querySelector('#transmitterCandidates');
var receiverCandidatesTextarea  = document.querySelector('#receiverCandidates');
var offerSdpTextarea  = document.querySelector('#offer');
var answerSdpTextarea = document.querySelector('#answer');

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
  offerSdpTextarea.value = offer.sdp;
  transmitterPeerConnection.setLocalDescription(offer, successCallback, errorCallback);
}

function setAnswer() {
  var sdp = maybeAddLineBreakToEnd(answerSdpTextarea.value).replace(/\n/g, '\r\n');
  var answer = new RTCSessionDescription({
	  type: 'answer',
	  sdp: sdp});
  transmitterPeerConnection.setRemoteDescription(answer,
      successCallback,
      errorCallback);

  // check if receiver candidates must be set up in setRemoteDescription callback
  var receiverCandidates = parseCandidates(receiverCandidatesTextarea);
  for (var i = 0; i < receiverCandidates.length; i++) {
    transmitterPeerConnection.addIceCandidate(
   		new RTCIceCandidate(receiverCandidates[i]), 
		successCallback, 
		errorCallback
	);
  }
}

function transmitterIceCallback(event) {
	if (event.candidate) {
		transmitterCandidatesTextarea.value = transmitterCandidatesTextarea.value + JSON.stringify(event.candidate) + '\n';
	}
}

function hangup() {
  videoStream.getTracks().forEach(function(track) {
    track.stop();
  });
  transmitterPeerConnection.close();
  transmitterPeerConnection = null;
}
