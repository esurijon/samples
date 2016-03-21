/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

function successCallback() {
  console.info(arguments);
}

function errorCallback(error) {
  console.error(error);
}

//Workaround for crbug/322756.
function maybeAddLineBreakToEnd(sdp) {
  var endWithLineBreak = new RegExp(/\n$/);
  if (!endWithLineBreak.test(sdp)) {
    return sdp + '\n';
  }
  return sdp;
}

function parseCandidates(textArea) {
	var candidates = [];
	var tokens = textArea.value.split('\n');
	for (var i = 0; i < tokens.length - 1; i++) {
		candidates.push(JSON.parse(tokens[i]));
	}
	return candidates;
}
