### Plugin: Algolia

This plugin allows you to use [Algolia DocSearch](https://community.algolia.com/docsearch/) for your site.

To enable it, add `algolia` to your site's plugins, and supply the required options via the `pluginsContext`.  

Name | Type | Default | Description
---- | ---- | ------- | ------
apiKey | `String` || The API key for your site's Algolia DocSearch setup
appId  | `String` || The application id for your site's Algolia DocSearch setup
indexName | `String` || The index name for your site's Algolia DocSearch setup
searchParameters | `Object` | `{}` | A JSON object specifying the [Algolia Search Parameters](https://www.algolia.com/doc/api-reference/search-api-parameters/)

```js {heading="site.json"}
{
  ...
  "plugins": [
    "algolia"
  ],
  "pluginsContext": {
    "algolia": {
      "apiKey": "25626fae796133dc1e734c6bcaaeac3c", // replace with your site's api key
      "appId": "R2IYF7ETH7", // replace with your site's application id
      "indexName": "docsearch", // replace with your site's index name
      "searchParameters": { "facetFilters": ["site:yoursite.com"] } // optional
    }
  }
}
```

To connect the `searchbar` component to Algolia DocSearch, add the `algolia` key.

```html
<searchbar placeholder="Search" algolia menu-align-right></searchbar>
```

Alternatively, if you are using a custom search bar, you can assign the input field the id `algolia-search-input` to connect it to Algolia DocSearch.

```html
<input id="algolia-search-input">
```

<box type="warning">

By default, Algolia DocSearch indexes all content on the page, including content in components that are hidden to the user during the initial render (e.g. Panels). To exclude these content from being indexed, you can add `.algolia-no-index` to the [`selectors_exclude`](https://community.algolia.com/docsearch/config-file.html#selectors_exclude-optional) attribute in your DocSearch configuration.

The `algolia-no-index` class is automatically added to content hidden by MarkBind's Vue components. You may also add the `algolia-no-index` class to content that you do not want to be indexed by Algolia DocSearch.

</box>