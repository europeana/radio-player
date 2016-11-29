// Init variables
var debug        = true;
var currentTrack = null;
var songToTag    = null;
var active       = false;
var playAttempts = 0;


var external = 'https://www.europeana.eu';
var dataHost = 'https://radio.europeana.eu';

if(getURLParameter('hostname')){
  dataHost = decodeURIComponent(getURLParameter('hostname'));
  log('overridden default data host - will use ' + dataHost);
}

var urlInstitutions = dataHost + '/stations/institutions.json'
var urlGenres       = dataHost + '/stations/genres.json'
var urlStations     = dataHost + '/stations.json'

var activeChannel   = 0;
var channels        = [];
var sequence        = 0;
var playCount       = 0;
var jingleInterval  = 5;


function log(message) {
  if(debug){
    console.log(message);
  }
}

function getIndex(name){
  var $el = $('.station-select[data-name="' + decodeURIComponent(name) + '"]');
  return $el.data('index');
}

$(document).ready(function() {

  Amplitude.init({
    "dynamic_mode": true,
    "debug": debug,
    "default_album_art": '/images/cover.png',
    "visualization_backup": "album-art",
    "callbacks": {
      "before_next": "resetCover",       // Smoothen the transition from one cover to the other
      "after_song_ended": "shuffleTrack" // Play the next track when the current one ends
    }
  });

  resetCover();

  var paramGenre       = getURLParameter('genre');
  var paramInstitution = getURLParameter('institution');
  var paramStation     = getURLParameter('station');

  if(paramGenre){

    log('preset genre set: ' + paramGenre);

    if(paramGenre == 'classical'){
      paramGenre = 'Classical Music'
    }
    else if(paramGenre == 'folk'){
      paramGenre = 'Folk and Traditional Music'
    }
    else if(paramGenre == 'popular'){
      paramGenre = 'Popular Music'
    }

    loadChannels(urlGenres, function(){
      setChannel(getIndex(paramGenre), true);
    });
  }
  else if(paramInstitution){

    log('preset institution set: ' + paramInstitution);

    loadChannels(urlInstitutions, function(){
      setChannel(getIndex(paramInstitution), true);
    });
  }
  else if(paramStation){

    log('preset station set: ' + paramStation);

    if(paramStation == 'classical'){
      paramStation = 'Classical Music'
    }
    else if(paramStation == 'folk'){
      paramStation = 'Folk and Traditional Music'
    }
    else if(paramStation == 'popular'){
      paramStation = 'Popular Music'
    }
    loadChannels(urlStations, function(){
      setChannel(getIndex(paramStation), true);
    });
  }
  else{
    loadChannels(urlStations, function(){
      setChannel(null, true);
    });
  }

  $(document).on('click', '.station-select', function(e){
    e.preventDefault();

    var $tgt = $(e.target);
    $('.station-select').removeClass('active');

    $tgt.addClass('active');
    setChannel($tgt.data('index'));
  });

  genreTagging();
});


/* sets the active channel and begins playback */
function setChannel(index, holdPlay) {

  if(index == null){
    log('pick random station...')
    index = Math.floor(Math.random() * channels.length);
  }

  var selected = $('.station-select[data-index="' + index + '"]');
  selected.addClass('active');
  activeChannel = index;

  sequence = Math.floor(Math.random() * channels[activeChannel].totalResults);

  log('set active channel to [' + index + '] - ' + channels[activeChannel].name + ', random start set to ' + sequence);

  if(holdPlay){
    return;
  }
  shuffleTrack();
}

function addMenuItem(title, index){
  var count = $('.radio-selector li').length;
  $('.radio-selector').append('<li class="station-select" data-name="' + title + '" data-index="' + index + '">' + title + '</li>');
}

function loadChannels(url, callback) {
  $.get(url, function(data){

    $('.radio-selector').empty();

    $.each(data.stations, function(i, station) {
      channels.push(station);
      addMenuItem(station.name, i);
      log('Added channel '  + station.name + ' (' + station.totalResults + ' tunes)');
    });

    if(callback){
      callback();
    }
  });
}

// Event binding

$('.radio-selector div').on('mouseover', function () {
  $('img', this).addClass('radio-icon-invert');
});

$('div.play-radio').on('click', function() {
  if(!active){
    shuffleTrack();
  }
});


$('.amplitude-next').on('click', function() {
  shuffleTrack();
});


// Switch station
$('.radio-selector div').on('click', function() {
  $('.radio-selector div').removeClass('active');

  $(this).addClass('active');
  $('img', this).attr('src', 'images/icon-play.svg');
  $('img', this).addClass('radio-icon-invert');

  var selectedStation = $(this).attr('id');

  log('INITIAL SELECTED STATION IS ' + selectedStation + ', activeChannel IS ' + activeChannel);

  activeChannel = selectedStation.slice(-1);

  log('Switching to station: ' + channels[activeChannel].name);
  shuffleTrack();
});

function applyMarquee(){

  $('.now-playing-title').removeClass('marquee')
  $('.now-playing-title').removeAttr('style')

  var w1    = $('.now-playing-title').outerWidth();
  var w2    = $('.rights').outerWidth();
  var w3    = $('#top-header').outerWidth();

  if(w1 + w2 > w3){
    $('.now-playing-title').addClass('marquee')
    $('.now-playing-title').css('width', ((w3 - w2) - 24) + 'px');
  }
}

// Get a new track
function shuffleTrack() {
  if (!active) {
    log('Initialising radio');
    initPlayer();
    active = true;
  }

  sequence ++;
  sequence = sequence > channels[activeChannel].totalResults ? 0 : sequence;

  // Hide some elements..
  $('.rights').hide();

  // Based on play count, see if we need to throw in a jingle..
  if (playCount == 0 || playCount % jingleInterval == 0) {

    var jingleUrl = null;

    if(playCount == 0){
      jingleUrl = '/audio/welcome.mp3';
    }
    else if(channels[activeChannel].name == 'Folk and Traditional Music'){
      jingleUrl = '/audio/folk.mp3';
    }
    else if(channels[activeChannel].name == 'Classical Music'){
      jingleUrl = '/audio/classical.mp3';
    }
    else{
      jingleUrl = '/audio/generic.mp3';
    }

    var name = playCount == 0 ? 'Welcome to Europeana Radio!' : ('Europeana\'s ' + channels[activeChannel].name + ' Station!');

    // play jingle
    var song = {
      "album" : "Europeana",
      "artist" : "",
      'copyright': "",
      "cover_art_url" : null,
      "name" : name,
      "url" : jingleUrl,
      "song_id" : external + '/portal/'
    };

    log(JSON.stringify(song));
    Amplitude.playNow(song);
    playCount++;
  }
  else{
    $.get(channels[activeChannel].link + '?rows=1&start=' + sequence, function (data) {

      var track = data.station.playlist[0];
      var song = {
        "album" : "Europeana",
        "artist" : track.creator,
        'copyright': track.copyright,
        "cover_art_url" : track.thumbnail,
        "name" : track.title,
        "url" : track.audio,
        "song_id" : external + '/portal/record' + track.europeanaId + '.html'
      };

      currentTrack = song;
      log('New track: ' + song.name);

      $('.genre-selector').show();

      try {
        Amplitude.playNow(song);
        playCount++;

        setTimeout(function(){
          applyMarquee();
        }, 10);
      }
      catch (e) {
        log('Error ' + e);
      }
    }, 'json')
    .fail(function () {
      showPlayerError('An error has occurred, please try again later.', 'No response from the radio server.');
    });
  }
}

// Init player
function initPlayer() {
  $('div.play-radio').hide();
  $('#top-header').show();
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

function getURLParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

// Music genre tagging
function genreTagging() {

  $.ajax({
    url: "music-genres/genres.json",
    dataType: "json",
    success: function (data) {
      console.log("Loaded in " + data.length + " music genres for autocompletion");
      var genre_data = $.map(data, function (item) {
        return {
          label: item.label,
          value: item.value
        };
      });
      $("#genres").autocomplete({
        source: genre_data,
        minlength: 2,
        open: function () {
          songToTag = currentTrack;
          console.log("Starting music genre tagging for song " + currentTrack['name']);
        },
        select: function (event, ui) {
          $('div.genre-selection').hide();
          $('div.genre-selection-made').show();

          console.log("Selected music genre: " + ui.item.value + " aka " + ui.item.label);

          $('div.genre-selection-made').html('<h2>Refine the music genre</h2>' +
            '<p>Confirm <span class="genre-label">' + ui.item.label + '</span> as genre for <span class="genre-song-label">' + songToTag['name'] + '</span>:</p>' +
            '<p><a href="javascript:void(null);" onclick="submitGenreTagging(\'' + ui.item.value + '\', \'' + ui.item.label + '\');" class="genre-submit">Submit</a>' +
            '&nbsp; &nbsp; &nbsp; <a href="javascript:void(null);" onclick="cancelGenreTagging();" class="genre-cancel">Cancel</a></p>'
          );
        }
      });
    }
  });
}

// Music genre tagging cancellation
function cancelGenreTagging() {
  $('div.genre-selection-made').html('');
  $('div.genre-selection-made').hide();
  $('#genres').val('');
  $('div.genre-selection').show();
}

// Music genre tagging submitting
function submitGenreTagging(uri, label) {
  // @todo: post to Annotations API
  // songToTag
  // uri
  // label
  $('div.genre-selection-made').html('<h2>Thank you!</h2>'
  + '<p><a href="javascript:void(null);" onclick="cancelGenreTagging();" class="genre-submit">Go back</a></p>');
}