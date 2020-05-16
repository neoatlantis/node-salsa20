all: salsa20.min.js

salsa20.min.js: salsa20.js
	minify salsa20.js > salsa20.min.js

salsa20.js: src/*.js
	browserify -s Salsa20 src/salsa20.js -o salsa20.js

test: salsa20.js
	node test.salsa20.js
