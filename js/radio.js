// Init variables
var debug = true;
var active = false;
var playAttempts = 0;
var sequence = 0;
var hostname = "http://europeana-radio-test.cfapps.io";

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
$('div.play-radio').click(function() {
    if (!active) {
        $(this).hide();
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

    sequence++;

    // Get a track from radio
    $.get(hostname + "/stations/classical.json?rows=1&start=" + sequence, function (data) {
        var track = data.station.playlist[0];

        // Init song info, map to Amplitude song object
        var song = [];
        song['name'] = track.title;
        song['album'] = '';
        song['artist'] = track.creator;
        song['cover_art_url'] = track.thumbnail;
        song['url'] = track.audio;

        log('New track: ' + song.title);

        try {
            Amplitude.playNow(song);
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
    $('div.play-radio').css('cursor', 'default');
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