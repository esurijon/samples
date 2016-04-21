/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

document.querySelector('button#acceptOffer').onclick = accpetOffer;

var transmitterDataTextarea  = document.querySelector('#transmitterData');

var receiverData = {
		sdp: null,
		candidates: []
	};
var receiverDataTextarea  = document.querySelector('#receiverData');

var remoteVideo = document.querySelector('#remote');

var servers = {
  iceServers : [{ urls: 'stun:stun.l.google.com:19302'}]	  
};
//var servers = null;

var receiverPeerConnection = new RTCPeerConnection(servers);
receiverPeerConnection.onicecandidate = receiverIceCallback;
receiverPeerConnection.onaddstream = gotTransmitterStream;

function accpetOffer() {
  var transmitterData = JSON.parse(transmitterDataTextarea.value);	
  var offer = new RTCSessionDescription({
	  type: 'offer',
	  sdp: transmitterData.sdp});

  receiverPeerConnection.setRemoteDescription(
	  offer,
      successCallback,
      errorCallback);

  receiverPeerConnection.createAnswer(
	gotReceiverDescription, 
	errorCallback,
	{ mandatory: { OfferToReceiveAudio: false, OfferToReceiveVideo: true }});

  // check if transmitter candidates must be set up in setRemoteDescription callback
  for (var i = 0; i < transmitterData.candidates.length; i++) {
    receiverPeerConnection.addIceCandidate(
   		new RTCIceCandidate(transmitterData.candidates[i]), 
		successCallback, 
		errorCallback
	);
  }

}

function gotReceiverDescription(answer) {
  receiverData.sdp = answer.sdp;
  receiverDataTextarea.value = JSON.stringify(receiverData);
  receiverPeerConnection.setLocalDescription(answer, successCallback, errorCallback);
}

function gotTransmitterStream(e) {
  remoteVideo.srcObject = e.stream;
}

function receiverIceCallback(event) {
	if (event.candidate) {
		receiverData.candidates.push(event.candidate)
		receiverDataTextarea.value = JSON.stringify(receiverData);
	}
}
