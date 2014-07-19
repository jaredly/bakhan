
build:
	browserify run.js -t reactify -o www/bundle.js -d

watch:
	watchify run.js -t reactify -o www/bundle.js -d -v

serve:
	cd www && python -m SimpleHTTPServer 8003

less:
	lessc less/index.less > www/bundle.css

.PHONY: less serve watch build

