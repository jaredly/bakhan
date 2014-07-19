
build:
	browserify run.js -t reactify -o www/bundle.js -d

watch:
	watchify run.js -t reactify -o www/bundle.js -d -v

serve:
	cd www && python -m SimpleHTTPServer 8003
