Amplitude.init({
    "dynamic_mode": true,
    "debug": true
});

$(document).ready(function() {
    $.get( "radio.php?option=start", function( data ) {
        Amplitude.playNow(data);
    }, 'json');
});

$('.amplitude-next').click(function() {
    $.get( "radio.php?option=next", function( data ) {
        Amplitude.playNow(data);
    }, 'json');
});