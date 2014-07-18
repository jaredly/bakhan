
build:
	browserify run.js -o www/bundle.js

watch:
	watchify run.js -o www/bundle.js

