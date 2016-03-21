/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

document.querySelector('button#acceptOffer').onclick = accpetOffer;

var transmitterCandidatesTextarea  = document.querySelector('#transmitterCandidates');
var receiverCandidatesTextarea  = document.querySelector('#receiverCandidates');
var offerSdpTextarea = document.querySelector('#offer');
var answerSdpTextarea = document.querySelector('#answer');
var remoteVideo = document.querySelector('#remote');

var servers = {
  iceServers : [{ url: 'stun:stun.l.google.com:19302'}]	  
};
//var servers = null;

var receiverPeerConnection = new RTCPeerConnection(servers);
receiverPeerConnection.onicecandidate = receiverIceCallback;
receiverPeerConnection.onaddstream = gotTransmitterStream;

function accpetOffer() {
  var sdp = maybeAddLineBreakToEnd(offerSdpTextarea.value).replace(/\n/g, '\r\n');
  var offer = new RTCSessionDescription({
	  type: 'offer',
	  sdp: sdp});

  receiverPeerConnection.setRemoteDescription(
	  offer,
      successCallback,
      errorCallback);

  receiverPeerConnection.createAnswer(gotReceiverDescription, errorCallback);

  // check if transmitter candidates must be set up in setRemoteDescription callback
  var transmitterCandidates = parseCandidates(transmitterCandidatesTextarea);
  for (var i = 0; i < transmitterCandidates.length; i++) {
    receiverPeerConnection.addIceCandidate(
   		new RTCIceCandidate(transmitterCandidates[i]), 
		successCallback, 
		errorCallback
	);
  }

}

function gotReceiverDescription(answer) {
  answerSdpTextarea.value = answer.sdp;
  receiverPeerConnection.setLocalDescription(answer, successCallback, errorCallback);
}

function gotTransmitterStream(e) {
  remoteVideo.srcObject = e.stream;
}

function receiverIceCallback(event) {
	if (event.candidate) {
		receiverCandidatesTextarea.value = receiverCandidatesTextarea.value + JSON.stringify(event.candidate) + '\n';
	}
}
