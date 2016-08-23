<?php
switch (rand(1,2)) {
    case 1:

        echo json_encode(array(
			"name" => "Primrose Vale",
			"artist" => "Tucker, Edmond, piano ; Killoran, Patrick, and his Pride of Erin Orchestra",
			"url" => "http://s3-eu-west-1.amazonaws.com/itma.dl.audio/europeana_78s/232168.mp3",
			"cover_art_url" => "http://s3-eu-west-1.amazonaws.com/itma.dl.images/78s/232168.jpg",
            "album" => "."
        ));

    break;
    case 2:

        echo json_encode(array(
            "name" => "Selection of hornpipes/ Peter Wyper",
            "artist" => "Wyper, Peter, Scotland, accordion",
            "url" => "http://s3-eu-west-1.amazonaws.com/itma.dl.audio/europeana_78s/232163.mp3",
            "cover_art_url" => "https://www.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&uri=http%3A%2F%2Fs3-eu-west-1.amazonaws.com%2Fitma.dl.images%2F78s%2F232163.jpg&type=SOUND",
            "album" => "."
        ));

    break;
}