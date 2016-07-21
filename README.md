# gulp-jst-util
compile template of underscore file in to javascript

>example 

```javascript
	
	gulp.task('template', function() {
		return gulp.src('development/tpl/**/*.html')
			.pipe(jst({
				base: 'tpl'
			}).on('error', function() {
				console.log(arguments);
			}))
			.pipe(beautify({}))
			.pipe(gulp.dest('development/scripts/view/'));
});
```

####options
* base:
releation folder name.
template name split at '.' if specifition this option.

