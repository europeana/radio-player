// Init variables
var debug = true;
var active = false;
var playAttempts = 0;
var hostname = 'http://europeana-radio-test.cfapps.io';
var external = 'http://www.europeana.eu';
var channels = new Array('Classical Music', 'Traditional and Folk Music');
var channelsJson = new Array();
var sequence = new Array(1,1);
var channel = 0;

// Initialise player
Amplitude.init({
    "dynamic_mode": true,
    "debug": debug,
    "default_album_art": "images/cover.png",
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
    setRandomChannel();
    setRandomSequence();
});

// Reset channels
function resetChannels() {
    $('.radio-selector img').attr('src', 'images/icon-music.svg');
    $('.radio-selector img').removeClass('radio-icon-invert');
}

// Set random channel
function setRandomChannel() {
    var channelKey = Math.floor(Math.random()*channels.length);
    channel = channelKey;
    resetChannels();
    $('.radio-' + channelKey).addClass('radio-active');
    $('.radio-' + channelKey + ' img').addClass('radio-icon-invert');
    $('.radio-' + channelKey + ' img').attr('src', 'images/icon-play.svg');
    log('Setting start channel to #' + channelKey + ': ' + channels[channelKey]);
}

// Set ourselves a start track, as a prep before the player starts
function setRandomSequence() {
    $.get(hostname + '/stations.json', function (data) {
        $.each(data.stations, function( index, station ) {
            sequence[index] = Math.floor((Math.random() * station.totalResults) + 1);
            channelsJson[index] = station.link;
            log('Channel '  + station.name + ' has ' + station.totalResults + ' tunes, setting start sequence to: ' + sequence[index]);
        });
    });
}

// Start playing the radio
$('div.play-radio').click(function() {
    if (!active) {
        shuffleTrack();
    }
})

// Shuffle
$('.amplitude-next').click(function() {
    log('Shuffling to a new track');
    shuffleTrack();
});

// Switch station
$('.radio-selector div').click(function() {
    resetChannels();
    $('.radio-selector div').removeClass('radio-active');
    $(this).addClass('radio-active');
    $('img', this).attr('src', 'images/icon-play.svg');
    $('img', this).addClass('radio-icon-invert');
    var selectedStation = $(this).attr('id');
    var channelKey = selectedStation.slice(-1);
    channel = channelKey;
    log('Switching to station: ' + channels[channelKey]);
    shuffleTrack();
});

// Get a new track
function shuffleTrack() {
    if (!active) {
        log('Initialising radio');
        initPlayer();
        active = true;
    }

    sequence[channel]++;

    // Get a track from radio
    $.get(channelsJson[channel] + '?rows=1&start=' + sequence[channel], function (data) {
        var track = data.station.playlist[0];

        // Init song info, map to Amplitude song object
        var song = [];
        song['name'] = track.title;
        song['album'] = 'Europeana';
        song['artist'] = track.creator;
        song['cover_art_url'] = track.thumbnail;
        song['url'] = track.audio;
        song['copyright'] = track.copyright;
        song['songId'] = external + '/portal/record' + track.europeanaId + '.html';

        log('New track: ' + song.name);

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

// Hover fix for channels
$('.radio-selector div').hover(function () {
    $('img', this).addClass('radio-icon-invert');
});

// Init player
function initPlayer() {
    $('div.play-radio').hide();
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
    log('Error: ' + internal);
    $('#top-header').show();
    $('.now-playing-title').html('');
    $('.album-information span').html('');
    $('.error').html(message);
}