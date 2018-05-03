# Gather Components `work in progress`
Generate components.json file for [Design Manual](https://github.com/EightMedia/design-manual) capturing HTML components from a website by queryselector.


## Usage
Setup a YAML file with a list of components to be gathered. Add a name, description, query selectors to find the components and additional example HTML.

```yaml
-
  name: foo
  description: foo description
  selectors: 
    - .foo
    - .body > .foo

-
  name: bar
  description: bar description
  selector: .bar
  examples: 
    - |
      <div class="beep">
        {{block}}
      </div>
    - |
      <div style="max-width: 300px">
        {{block}}
      </div>
```

---


### Output file
Output will look something like this.

```json
[
  {
		"meta": {
			"name": "foo",
			"description": "foo description"
		},
		"output": "<div class=\"foo\">this is my component</div>"
	},
	{
		"meta": {
			"name": "bar",
			"description": "bar description"
		},
		"output": "<div class=\"beep\"><div class=\"foo\">this is my component</div></div><div style=\"max-width: 300px\"><div class=\"foo\">this is my component</div></div>"
	}
]
```

---

## How to use
```
npm install gather-components
```

```js
var scraper = require('gather-components');

scraper({
    url: 'https://rawgit.com/EightMedia/gather-components/master/test/fixtures/',
    paths: ['test.html', 'test2.html'],
    components: 'components.yaml',
    output: 'components.json',
    complete: function(components){}
});
```
