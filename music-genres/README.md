Europeana Radio Player: Music Genres Utility
============================================

The Europeana Radio Player has a feature whereby audio recordings as they are
played can be tagged by the listener from a list of known music genres obtained
from Wikidata.

In this directory are stored the files to support this genre tagging feature:
* [genres.json](genres.json): The generated list of genre URIs and labels in
  the JSON format expected by the radio player.
* [populate.rb](populate.rb): A Ruby script for regenerating genres.json when
  changes are made to wikidata-query.rq
* [wikidata-query.rq](wikidata-query.rq): The SPARQL query sent to Wikidata
  to retrieve music genres.

## Updating the music genres

To update the music genres from Wikidata:

1. Edit wikidata-query.rq and modify the query as needed
2. Run populate.rb which will write the genre list to genres.json
3. Commit genres.json, deploy and reload the player

## Running populate.rb

The script to update music genres from Wikidata requires:

* Ruby 2.4.0 (for capitalisation of Unicode labels)
* [Faraday](https://github.com/lostisland/faraday)

With these installed, run it with:
```
cd music-genres
ruby populate.rb
```
