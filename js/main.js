// notification
var notification = new Audio('/sounds/fb.mp3');

// functions

function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

function encode(str) {
    return encodeURIComponent(escape(str));
}


function decode(str) {
    return unescape(decodeURIComponent(str))

}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function getRandomStr(n) {
    result = '';
    var words = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOP?ASDFGHJKLZXCVBNM+=-%^$#@!;:\|/><(*){}№.~`_';
        var max_position = words.length - 1;
            for( i = 0; i < n; ++i ) {
                position = Math.floor ( Math.random() * max_position );
                result = result + words.substring(position, position + 1);
            }
 return result;
}

// main
var PassPhrase;
var anotherPeerId;
var anotherId;
var PublicKeyString;
var RSAkey;
var Bits = 2048;


PassPhrase = getRandomStr(200);
RSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
PublicKeyString = cryptico.publicKeyString(RSAkey);    

$('#connect').click(function() {

	anotherId = $('#another_id').val().split(','); // split string to array to get real id and passphrase

  anotherPeerId = anotherId[0]; // real id 
  PassPhrase = anotherId[1]; 
	RSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
	PublicKeyString = cryptico.publicKeyString(RSAkey);
});  

// Connect to PeerJS, have server assign an ID instead of providing one
// Showing off some of the configs available with PeerJS :).
var peer = new Peer({
  // Set API key for cloud server (you don't need this if you're running your
  // own.
  key: 'x7fwx2kavpy6tj4i',
  // Set highest debug level (log everything!).
  debug: 3,
  // Set a logging function:
  logFunction: function() {
    var copy = Array.prototype.slice.call(arguments).join(' ');
  }
});
var connectedPeers = {};
// Show this peer's ID.
peer.on('open', function(id){
	if (typeof vars.id == 'undefined') {
  $('#own_id').val(id + ',' + PassPhrase);
}
});
// Await connections from others
peer.on('connection', connect);
peer.on('error', function(err) {
  console.log(err);
})
// Handle a connection object.
function connect(c) {
  startMessaging();

  // Handle a chat connection.
  if (c.label === 'chat') {
    var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
    var messages = $('<div><em class="notification">The conversation started. Start messaging!</em></div>').addClass('messages');
    chatbox.append(messages);
 
    // Select connection handler.
    chatbox.on('click', function() {
      if ($(this).attr('class').indexOf('active') === -1) {
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
    });
    $('.filler').hide();
    $('#connections').append(chatbox);
    c.on('data', function(data) {
    	// Decrypt data (message)
      decryptedMsg = cryptico.decrypt(data, RSAkey);
      decryptedMsg.plaintext = escapeHtml(decode(decryptedMsg.plaintext));

      messages.append('<div class="message_block partner"><span class="date">' + (new Date()).getHours() + ':' + addZero(new Date().getMinutes()) + '</span> <span class="peer">Partner:</span><div class="message">' + decryptedMsg.plaintext.replace(/([^>])\n/g, '$1<br/>') +
        '</div></div>');
         $("html, body").animate({ scrollTop: $(document).height() }, "slow");

      // play notification
      notification.play();
        });
        c.on('close', function() {
          alert('Partner has left the chat.');
          $('.chat').hide();
          if ($('.connection').length === 0) {
            $('.filler').show();
          }
          delete connectedPeers[c.peer];
        });
  } 
  connectedPeers[c.peer] = 1;
}
$(document).ready(function(PublicKeyString) {

  function doNothing(e){
    e.preventDefault();
    e.stopPropagation();
  }
  // Connect to a peer
  $('#connect').click(function() {
  if (vars.id != '') {
    var requestedPeer = anotherPeerId;
    if (!connectedPeers[requestedPeer]) {
      // Create connection
      var c = peer.connect(requestedPeer, {
        label: 'chat',
        serialization: 'none',
        metadata: {message: 'hi i want to chat with you!'}
      });
      c.on('open', function() {
        connect(c);
      });
      c.on('error', function(err) { alert(err); });
    connectedPeers[requestedPeer] = 1;
  }}});
  // Close a connection.
  /*$('#close').click(function() {
    eachActiveConnection(function(c) {
      c.close();
    });
  });*/
  // Send a chat message to all active connections.


  $('#send').submit(function(e) {
    e.preventDefault();    // For each active connection, send the message.
    var msg = $('#text').val();

    if (msg != '' && msg != ' ') {

    eachActiveConnection(function(c, $c) {
      if (c.label === 'chat') {
      	// Encrypt message 
      	var encryptedMsg = cryptico.encrypt(encode(msg), window.PublicKeyString);
       


        c.send(encryptedMsg.cipher);
        $c.find('.messages').append('<div class="message_block you"><span class="date">' + (new Date()).getHours() + ':' + addZero(new Date().getMinutes()) + '</span> <span class="me">Me:</span><div class="message">' + escapeHtml(msg).replace(/([^>])\n/g, '$1<br/>')
          + '</div></div>');
         $("html, body").animate({ scrollTop: $(document).height() }, "slow");
        
      }
    
    
    });
  }
    $('#text').val('');
    $('#text').focus();
  });
  // Goes through each active peer and calls FN on its connections.
  function eachActiveConnection(fn) {
    var actives = $('.active');
    var checkedIds = {};
    actives.each(function() {
      var peerId = $(this).attr('id');
      if (!checkedIds[peerId]) {
        var conns = peer.connections[peerId];
        for (var i = 0, ii = conns.length; i < ii; i += 1) {
          var conn = conns[i];
          fn(conn, $(this));
        }
      }
      checkedIds[peerId] = 1;
    });
  }
});
// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    console.log('peer destroy');
    peer.destroy();
  }
};
