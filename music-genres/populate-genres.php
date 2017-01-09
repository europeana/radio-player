<?php
// query for Wikidata
$query = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=PREFIX%20wp%3A%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2F%3E%20%0APREFIX%20we%3A%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2F%3E%20%0ASELECT%20DISTINCT%20%3Fgenre%20%3Flabel%20%20WHERE%20%7B%0A%20%20%7B%20%3Fgenre%20wp%3AP31%20%7C%20wp%3AP279%20we%3AQ862597%20%7D%20UNION%20%7B%20%3Fgenre%20wp%3AP31%20%7C%20wp%3AP279%20we%3AQ188451%20%7D%20%20.%0A%20%20OPTIONAL%20%7B%20%3Fgenre%20rdfs%3Alabel%20%3Flabel%20.%20FILTER%20%28lang%28%3Flabel%29%20%3D%20%27en%27%29%20%7D%0A%7D';

// create stream
$opts = array(
    'http' => array(
        'method' => "GET",
        'header' => "Accept: application/sparql-results+json"
    )
);

$context = stream_context_create($opts);

// request
$response = file_get_contents($query, false, $context);

$genreList = array();

// iterate through Wiki data
$genres = json_decode($response);
foreach ($genres as $genre) {
    if (isset($genre->bindings)) {
        foreach ($genre->bindings as $genreEntity) {
            // make sure we only use genres with an English label
            if (isset($genreEntity->label)) {
                $genreList[] = array('value' => $genreEntity->genre->value, 'label' => ucfirst($genreEntity->label->value));
            }
        }
    }
}

// build json file
file_put_contents(dirname(__FILE__).'/genres.json', json_encode($genreList));