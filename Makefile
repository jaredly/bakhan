
build:
	browserify run.js -o www/bundle.js -d

watch:
	watchify run.js -o www/bundle.js -d -v

