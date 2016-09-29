Europeana Radio Player
======
Front-end radio player for Europeana Music Radio, works together with the [radio station](https://github.com/europeana/radio-station). Based on [Amplitude.js](https://github.com/521dimensions/amplitudejs).

Usage
------
Can be embedded via an iframe:
~~~~
<iframe class="iframe" src="https://radio.europeana.eu/" border="0" frameborder="0" width="635" height="390"></iframe>
~~~~

If you embed the player in this iframe, ensure to also include the following lines of CSS in your stylesheet to make the iframe adapt to a mobile viewport:
~~~~
<style type="text/css">
@media all and (max-width: 545px) {
   .iframe {
       height: 600px;
       width: 370px;
   }
</style>
~~~~

The player also accepts a "station" URL parameter to pre-set the player to a specific station (either classical or folk).
