// Init variables
var debug = true;
var active = false;
var playAttempts = 0;

// Initialise player
Amplitude.init({
    "dynamic_mode": true,
    "debug": debug,
    "visualization_backup": "album-art",
    "callbacks": {
        "before_next": "resetCover", // Smoothen the transition from one cover to the other
        "after_song_ended": "shuffleTrack" // Play the next track when the current one ends
    }
});

Amplitude.registerVisualization( MichaelBromleyVisualization, {
    width: '314',
    height: '314'
} );

// Debugging
function log(message) {
    if (debug) console.log(message);
}

// Start playing the radio
// @todo: Bind this to a different element, sort of the 'start radio'  button
$('.amplitude-paused').click(function() {
    if (!active) {
        shuffleTrack();
    }
})

// Shuffle
$('.amplitude-next').click(function() {
    log('Shuffling to a new track');
    shuffleTrack();
});

// Get a new track
function shuffleTrack() {
    if (!active) {
        log('Initialising radio');
        initPlayer();
        active = true;
    }

    // Get a track from radio
    $.get("radio.php", function (data) {
        log('New track: ' + data.name);
        try {
            Amplitude.playNow(data);
        } catch (e) {
            console.log('test');
        }
    }, 'json')

    // Failed, no radio for you mister
    .fail(function() {
        showPlayerError('An error has occurred, please try again later.', 'No response from the radio server.');
    });
}

// Init player
function initPlayer() {
    $('#top-header').show();
}

// Reset cover
// @todo: Change to default Europeana art instead
function resetCover() {
    $('#large-album-art').attr('src', '');
}

// Error handling
function showPlayerError(message, internal) {
    log('Error: ' + internal)
    $('#top-header').show();
    $('.now-playing-title').html('');
    $('.album-information span').html('');
    $('.error').html(message);
}