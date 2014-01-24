
## bootstrap-bower-<%= module %>

This is the bower repository for the accordion <%= module %> component of of the [angular-ui/bootstrap project](https://github.com/angular-ui/bootstrap) project.

### Usage

Include the js file into your HTML with a `<script>` tag or your preferred tool.

Use `ui-<%= module %>-tpls.js` to use the default html templates (recommended). Alternatively, Use `ui-<%= module %>.js` if you wish to create your own html templates.

Then, be sure to include the module as a dependency for your app:
```js
angular.module('myApp', ['ui.bootstrap.<%= module %>']
```

<% if (config.templates.length) {
  var readmeHtmlModules = config.templates.map(function(templateUrl) {
    return "'" + templateUrl + "'";
  }); %>

And if you are using `ui-<%= module %>-tpls.js`, be sure to additionally include the bundled html templates as dependencies:
```js
angular.module('myApp', [
  'ui.bootstrap.<%= module %>',
  <%= readmeHtmlModules.join(',\n  ') %>
])
```
<% } %>
