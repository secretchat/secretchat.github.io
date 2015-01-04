function startMessaging() {
	$('#chat').show();
	$('#index').hide();
  $('body').css('background-color', '#F1F1F1');
}

$(window).load(function() {
    $('.loading').hide();
    $('.connection_box').show();
// copy own id 
var client = new ZeroClipboard($("#copy_own_id"), {
  moviePath: "js/ZeroClipboard/ZeroClipboard.swf"
});

client.on("load", function(client) {  
  client.on("complete", function(client, args) {
  });
});

// submit form by CTRL+ENTER
var t = document.getElementsByTagName('textarea');
var i = 0;
while(t[i]){
    if(/ctrlSubmit/.test(t[i].className)){
        t[i].onkeyup = function(e){
            e = window.event || e;
            if(e.keyCode == 13 && e.ctrlKey){
				 $('#send').trigger('submit');
            }
        }
    }
    ++i;
}

}); 



