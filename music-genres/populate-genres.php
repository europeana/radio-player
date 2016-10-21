<?php
// query for Wikidata
$query = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=SELECT%20DISTINCT%20%3Fgenre%20%3Flabel%0AWHERE%20%7B%0A%20%20%20%20%20%20%20%20%7B%20%3Fgenre%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2FP31%3E%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2FQ188451%3E%20%7D%0A%20%20UNION%20%7B%20%3Fgenre%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2FP31%3E%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2FQ862597%3E%20%7D%20.%0A%20%20OPTIONAL%20%7B%20%3Fgenre%20rdfs%3Alabel%20%3Flabel%20.%20FILTER%20%28lang%28%3Flabel%29%20%3D%20%27en%27%29%20%7D%0A%7D';

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
                $genreList[] = array('uri' => $genreEntity->genre->value, 'label' => $genreEntity->label->value);
            }
        }
    }
}

// build json file
file_put_contents(dirname(__FILE__).'/genres.json', json_encode($genreList));