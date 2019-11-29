// load frontend assets
require('imports-loader?this=>window,define=>false,exports=>false!typeahead.js/dist/bloodhound');
require('imports-loader?this=>window,define=>false,exports=>false!typeahead.js/dist/typeahead.jquery');
require('imports-loader?this=>window,define=>false,exports=>false!./scripts/layout');

// load styling
require('./index.scss');

// load ng app
require('./index.module');
