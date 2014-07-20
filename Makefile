
build: less
	browserify run.js -t reactify -o www/bundle.js -d

watch:
	watchify run.js -t reactify -o www/bundle.js -d -v

serve:
	cd www && python -m SimpleHTTPServer 8003

less:
	lessc less/index.less > www/bundle.css

docs: build less
	rm -rf w && cp -r www w && git checkout gh-pages && rm -rf vendor images && mv w/* ./ && rm -rf w
	@echo
	@echo "-------- YOU'RE NOT DONE --------"
	@echo "Run git commit -am'update docs'"

.PHONY: less serve watch build

