Europeana Radio Player
======
Front-end radio player for Europeana Music Radio, works together with the [radio station](https://github.com/europeana/radio-station). Based on [Amplitude.js](https://github.com/521dimensions/amplitudejs).

Usage
------
Can be embedded via an iframe:
~~~~
<iframe src="https://radio-player.europeana.eu/" border="0" frameborder="0" width="635" height="390"></iframe>
~~~~

If you embed the player in this iframe, ensure to also include the following lines of CSS in your stylesheet to make the iframe adapt to a mobile viewport:
~~~~
<style type="text/css">
@media all and (max-width: 545px) {
   .iframe {
       height: 600px;
       width: 370px;
   }
}
</style>
~~~~

Optional URL parameters
-----------------------

When embedding the radio player, a number of optional URL parameters are
available to customise the player's behaviour:

### genre

Set `genre` to the _identifier_ of a genre station ("classical", "folk to pre-select that station,
otherwise the player will select one at random.

Example:
~~~~
<iframe src="https://radio-player.europeana.eu/?genre=classical"></iframe>
~~~~

### hostname

Set `hostname` to the base URL of your radio station installation, otherwise
this will default to "https://radio.europeana.eu".

Example:
~~~~
<iframe src="https://radio-player.europeana.eu/?hostname=http://myradio.example.com"></iframe>
~~~~

### institution

Set `institution` to the _name_ of an institution station to pre-select that
station, otherwise the player will select a genre station at random.

Example:
~~~~
<iframe src="https://radio-player.europeana.eu/?institution=Internet Archive"></iframe>
~~~~

### random

Set `random` to "false" and the player will begin at the start of the current
playlist for the active station. Otherwise it will choose a random position
in the playlist to start from.

Example:
~~~~
<iframe src="https://radio-player.europeana.eu/?random=false"></iframe>
~~~~

### station

**Deprecated**

`station` has been replaced by `genre` and `institution`.
