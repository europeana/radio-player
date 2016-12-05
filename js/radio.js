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
var urlStations     = dataHost + '/stations/genres.json'

var channels        = {"institutions":[], "genres":[]};
var channelType     = 'institutions';

var activeChannel   = 0;
var sequence        = 0;
var playCount       = 0;
var welcomed        = false;
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


function before_play(){
  $('.amplitude-song-slider').val(0);
  setTimeout(function(){
    $('.amplitude-song-slider').val(0);
  }, 10);
}

$(document).ready(function() {

  Amplitude.init({
    "dynamic_mode": true,
    "debug": debug,
    "default_album_art": '/images/cover.png',
    "visualization_backup": "album-art",
    "callbacks": {
      "before_next": "resetCover",        // Smoothen the transition from one cover to the other
      "after_song_ended": "shuffleTrack", // Play the next track when the current one ends
      "before_play" : "before_play"
    }
  });

  resetCover();

  var paramGenre       = getURLParameter('genre');
  var paramInstitution = getURLParameter('institution');
  var paramStation     = getURLParameter('station');

  if(paramGenre){

    log('preset genre set: ' + paramGenre);
    setChannelType('genres');

    if(paramGenre == 'classical'){
      paramGenre = 'Classical Music'
    }
    else if(paramGenre == 'folk'){
      paramGenre = 'Folk and Traditional Music'
    }
    else if(paramGenre == 'popular'){
      paramGenre = 'Popular Music'
    }

    loadChannels(urlGenres, channelType, function(){
      setChannel(getIndex(paramGenre), true);
    });
  }
  else if(paramInstitution){

    log('preset institution set: ' + paramInstitution);
    setChannelType('institutions');

    loadChannels(urlInstitutions, channelType, function(){
      setChannel(getIndex(paramInstitution), true);
    });
  }
  else if(paramStation){

    log('preset station set: ' + paramStation);
    setChannelType('genres');

    if(paramStation == 'classical'){
      paramStation = 'Classical Music';
    }
    else if(paramStation == 'folk'){
      paramStation = 'Folk and Traditional Music';
    }
    else if(paramStation == 'popular'){
      paramStation = 'Popular Music';
    }
    loadChannels(urlStations, channelType, function(){
      setChannel(getIndex(paramStation), true);
    });
  }
  else{
    setChannelType('genres');
    loadChannels(urlStations, channelType, function(){
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

});

function setChannelType(type){

  channelType = type;

  $('.channel-type-switch .tab').removeClass('active');
  $('.channel-type-switch .tab[data-type="' + channelType + '"]').addClass('active');

  $('.radio-selector').hide();
  $('.radio-selector.' + channelType).show();

  log('channelType set to ' + channelType);
}

/* sets the active channel and begins playback */
function setChannel(index, holdPlay) {

  if(index == null){
    log('pick random station...')
    index = Math.floor(Math.random() * channels[channelType].length);
  }

  var selected = $('.station-select[data-index="' + index + '"]');
  selected.addClass('active');
  activeChannel = index;

  sequence = Math.floor(Math.random() * channels[channelType][activeChannel].totalResults);

  if(holdPlay){
    return;
  }
  playCount = 0;
  shuffleTrack();
}

function addMenuItem(title, type, index){
  var count = $('.radio-selector li').length;
  $('.radio-selector' + '.' + type).append('<li class="station-select" data-name="' + title + '" data-index="' + index + '">' + title + '</li>');
}

function loadChannels(url, type, callback) {
  $.get(url, function(data){

    $('.radio-selector.' + type).empty();

    $.each(data.stations, function(i, station) {
      channels[type].push(station);
      addMenuItem(station.name, type, i);
      log('Added channel '  + station.name + ' (' + station.totalResults + ' tunes)');
    });

    if(callback){
      callback();
    }
  });
}

// Event binding

$('.play-radio').on('click', function() {
  if(!active){
    shuffleTrack();
  }
});

$('.channel-type-switch').on('click', function(e){
  var selType = $(e.target).data('type');

  setChannelType(selType)

  if($('.radio-selector.' + channelType + ' li').length == 0){
    loadChannels(channelType == 'genres' ? urlGenres : urlInstitutions, channelType);
  }
});

$('.amplitude-next').on('click', function() {
  shuffleTrack();
});

$('.submit-genre').on('click', function(){

  var data = {
    "genres": $('#sel_genres').val()
  }

  log('submit:\n\n' +  JSON.stringify(data, null, 8));

  $.ajax({
    type: 'POST',
    url: dataHost + '/submit',
    data: data,
    success: function(){
      alert('success = update the song tags...');
    }
  });

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

function doPlay(song, recordId){
  try {
    Amplitude.playNow(song);
    playCount++;

    setTimeout(function(){
      applyMarquee();
      $('.now-playing-title a').attr('href', recordId ? (external + '/portal/record' + recordId + '.html') : external);
    }, 10);
  }
  catch (e) {
    log('Error ' + e);
  }
}

// Get a new track
function shuffleTrack() {

  $('.error').empty();

  if (!active) {
    log('Initialising radio');
    initPlayer();
    active = true;
  }

  if(!channels[channelType][activeChannel]){
    showPlayerError('Channel unavailable');

    showGenres();
    return;
  }
  else{
    sequence ++;
    sequence = sequence > channels[channelType][activeChannel].totalResults ? 0 : sequence;
  }

  // Hide some elements..
  $('.rights').hide();

  // Based on play count, see if we need to throw in a jingle..
  if (playCount == 0 || playCount % jingleInterval == 0) {

    $('.genre-selector').hide();
    var jingleUrl = null;

    if(playCount == 0 && !welcomed){
      jingleUrl = '/audio/welcome.mp3';
      welcomed = true;
    }
    else if(channels[channelType][activeChannel].name == 'Folk and Traditional Music'){
      jingleUrl = '/audio/folk.mp3';
    }
    else if(channels[channelType][activeChannel].name == 'Classical Music'){
      jingleUrl = '/audio/classical.mp3';
    }
    else{
      jingleUrl = '/audio/generic.mp3';
    }

    var name = playCount == 0 ? 'Welcome to Europeana Radio!' : ('Europeana\'s ' + channels[channelType][activeChannel].name + ' Station!');

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
    doPlay(song);
  }
  else{
    $.get(channels[channelType][activeChannel].link + '?rows=1&start=' + sequence, function (data) {

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

      genreTagging(
        playCount % 2 == 0 ?
        [
           {
              "value": "http://www.wikidata.org/entity/Q83440", "label": "country music"
           },
           {
              "value": "http://www.wikidata.org/entity/Q85477", "label": "oratorio"
           }
        ]
        :
        [
         {
             "value": "http://www.wikidata.org/entity/Q131269", "label": "sonata"
         },
         {
             "value": "http://www.wikidata.org/entity/Q647653", "label": "divertimento"
         }
        ]
      );

      doPlay(song, track.europeanaId);
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
  $('.amplitude-song-slider').val(0);
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
function genreTagging(disabledGenres) {

  $.ajax({
    url: "music-genres/genres.json",
    dataType: "json",
    success: function (data) {

      $('#sel_genres').empty();

      $(data).each(function(i, item) {
        disable = false;

        if(disabledGenres){
          $.each(disabledGenres, function(i, disabled){
            if(item.value == disabled.value){
              disable = true;
            }
          });
        }

        $('#sel_genres').append($('<option' + (disable ? ' disabled' : '') + '>').attr('value', item.value).text(item.label));
      });

      $('.genre-selector').show();
      $('#sel_genres').chosen();
      $('#sel_genres').trigger("chosen:updated");
    }
  });
}


// Music genre tagging cancellation
function cancelGenreTagging() {
  $('div.genre-selection-made').html('');
  $('div.genre-selection-made').hide();
  $('#sel_genres').val('');
  $('div.genre-selection').show();
  genreTagging();
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