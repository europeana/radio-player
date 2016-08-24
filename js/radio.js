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

// Debugging
function log(message) {
    if (debug) console.log(message);
}

// Init page
$(document).ready(function() {
    resetCover();
});

// Start playing the radio
$('#large-album-art').click(function() {
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
    $.get("http://europeana-radio-test.cfapps.io/stations/classical.json?rows=1&start=1", function (data) {
        var track = data.station.playlist[0];
        log('New track: ' + track.title);

        // Init song info, map to Amplitude song object
        var song = [];
        song.title = track.title;
        song.album = '';
        song.artist = track.creator;
        song.cover = track.thumbnail;
        song.url = track.audio;

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
    $('img#large-album-art').css('cursor', 'default');
    $('.amplitude-play-pause').show();
}

// Reset cover
function resetCover() {
    $('#large-album-art').attr('src', 'images/cover.png');
}

// Error handling
function showPlayerError(message, internal) {
    log('Error: ' + internal)
    $('#top-header').show();
    $('.now-playing-title').html('');
    $('.album-information span').html('');
    $('.error').html(message);
}