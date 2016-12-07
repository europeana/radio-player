var debug        = true;
var currentTrack = null;
var songToTag    = null;
var active       = false;
var randomise    = true;
var playAttempts = 0;

if(getURLParameter('random')=='false'){
  randomise = false;
  log('overridden randomise');
}

var external = 'https://www.europeana.eu';
var dataHost = 'https://radio.europeana.eu';

if(getURLParameter('hostname')){
  dataHost = decodeURIComponent(getURLParameter('hostname'));
  log('overridden default data host - will use ' + dataHost);
}

var urlInstitutions = dataHost + '/stations/institutions.json'
var urlGenres       = dataHost + '/stations/genres.json'
var urlStations     = dataHost + '/stations/genres.json'
var urlAnnotations  = null;

var channels        = {'institutions':[], 'genres':[]};
var channelType     = 'institutions';

var availableGenres = null;
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
    log('pick random station...');
    index = Math.floor(Math.random() * channels[channelType].length);
  }

  var selected = $('.station-select[data-index="' + index + '"]');
  selected.addClass('active');
  activeChannel = index;

  if(randomise){
    sequence = Math.floor(Math.random() * channels[channelType][activeChannel].totalResults);
  }

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

function submitGenres(genres, index){

  var data = '{"motivation": "tagging", "body": "' + genres[index] + '"}';

  $.ajax({
    contentType: "application/json",
    dataType: "json",
    type: 'POST',
    url: urlAnnotations,
    data: data,
    success: function(res){

      $('.existing-tags').append('<li class="tag is-active">' + availableGenres[genres[index]] + '</li>');

      // Find item to disable manually - jQuery selector not working: $('#sel_genres option[value="' + genres[index] + ']"');
      $('#sel_genres option').each(function(){
        if($(this).attr('value') == genres[index]){
          $(this).attr('disabled','disabled');
        }
      });

      if(genres.length > index+1){
        submitGenres(genres, index+1);
      }
      else{
        $('#sel_genres').val('').trigger("chosen:updated");
      }
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
  var val = $('#sel_genres').val();
  if(!val){
      log('ERROR  ' + $('.chosen-container').length  )
    $('.chosen-container').addClass('error');
    return;
  }
  submitGenres(val, 0);
});

$('#sel_genres').on('change', function() {
  $('.chosen-container').removeClass('error');
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

  $('.rights').hide();

  // Based on play count, see if we need to throw in a jingle..
  if (playCount == 0 || playCount % jingleInterval == 0) {

    $('.genre-selection').addClass('hidden');
    var jingleUrl = null;

    if(playCount == 0 && !welcomed){
      jingleUrl = '/audio/welcome.mp3';
      welcomed = true;
      $('.radio-container').addClass('welcomed');
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

      currentTrack   = song;
      urlAnnotations = track.annotations;

      getAnnotations(function(existing){
        genreTagging(existing);
      });

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
  $('.europeana-branding').addClass('dropped');
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

function getAnnotations(callback){
  $.ajax({
    url: urlAnnotations,
    dataType: "json",
    success: function (data) {
      if(callback){
        callback(data);
      }
    }
  });
}

// Music genre tagging
function genreTagging(disabledGenres) {

  function getSortedKeys(obj) {
    var keys = [];
    for(var key in obj){
      keys.push(key);
    }
    return keys.sort(function(a,b){
      if(obj[a] < obj[b]){
        return -1;
      }
      else if(obj[a] > obj[b]){
        return 1;
      }
      else{
        return 0;
      }
    });
  }

  function buildGenreElements(){

    $('#sel_genres').empty();
    $('.existing-tags').empty();

    var sortedKeys = getSortedKeys(availableGenres);

    $(sortedKeys).each(function(i, item) {
      disable = false;
      if(disabledGenres){
        $.each(disabledGenres, function(j, disabled){
          if(item == disabled.body){
            $('.existing-tags').append('<li class="tag">' + availableGenres[item] + '</li>');
            disable = true;
            return false;
          }
        });
      }
      $('#sel_genres').append($('<option' + (disable ? ' disabled' : '') + '>').attr('value', item).text(availableGenres[item]));
    });

    $('.genre-selection').removeClass('hidden');
    $('#sel_genres').chosen();
    $('#sel_genres').trigger("chosen:updated");
  }

  if(availableGenres == null){
    $.ajax({
      url: "music-genres/genres.json",
      dataType: "json",
      success: function (data) {
        availableGenres = {};
        $(data).each(function(i, item) {
          availableGenres[item.value] = item.label.toLowerCase();
        });
        buildGenreElements();
      }
    });
  }
  else{
    buildGenreElements();
  }
}
