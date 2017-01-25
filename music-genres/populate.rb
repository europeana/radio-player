require 'faraday'
require 'json'

print 'Reading SPARQL query from wikidata-query.rq... '
query = File.read(File.expand_path('../wikidata-query.rq', __FILE__))
puts 'OK.'

print 'Querying Wikidata... '
response = Faraday.get('https://query.wikidata.org/bigdata/namespace/wdq/sparql',
  { query: query },
  { 'Accept' => 'application/sparql-results+json' }
)
puts 'OK.'

data = JSON.parse(response.body)
labelled_genre_bindings = data['results']['bindings'].select { |binding| binding.key?('label') }
genres = labelled_genre_bindings.map do |binding|
  { value: binding['genre']['value'], label: binding['label']['value'].capitalize }
end

puts "  (Received #{genres.length} labelled genres.)"

print 'Writing JSON to genres.json... '
File.open(File.expand_path('../genres.json', __FILE__), 'w') do |f|
  f.write JSON.pretty_generate(genres)
end
puts 'OK.'
