# Adding routes
One of the key features of the toolkit is the ability to define new routes that can be accessed within your cluster, either directly or from the menu navigation. The [route config](config/routes.json) file defines these routes, and you can use this as a starting point for some examples. Additionally, we also provide a [schema](config/schemas/routes.json) that you can use to validate your routes.

## Route composition
A route consists of a few simple elements that can be combined in different ways depending on the desired result for the page. A simple example:
```json
"routes": [
  {
    "path": "/sample-path",
    "title": "My custom AIOps page"
  },
]
```

The path will define the path on which you can navigate to your page, and you can also use this if you chose to define a menu route (see menu routes..).

Along with these, you can then define your actual content for the page. There are 4 possible options at this stage:
1. Iframed content
2. An AIOps panel
3. A custom bundle panel
4. A combination

## Menu routes
As mentioned, there is a concept of menu routes that will allow you to create a menu route in AIOps to directly navigate to your page. The structure is as follows:
```json
"menuRoutes": [
  {
      "categoryTitle": "Example dashboards",
      "routes": [
          "/alerts-top-10",
          "/alerts-workflow",
          "/alerts-timeline",
          "/incidents-distribution",
          "/incidents-top-10",
          "/application-heatmap",
          "/monitor-boxes"
      ],
      "type": "category"
  }
],
```

The `categoryTitle` is the title of section as appears in the AIOps menu, e.g:

The `routes` match up to the routes you want to show under that category. These strings must be an exact match to a `path` in the `spec.routes` block
Currently the `type` can only be "category" and the icon shown cannot be customised.

## Iframed content
This content type provides a simple way to iframe in a page from elsewhere. It consists of 1 required part:
`url:` - This defines the source of the page you want to iframe in.

In many cases the iframed content will be hosted on an external source, such as Netcool Impact, and without additional configuration the browser will not allow the content to be rendered. On the AIOps side, you will need to add the following to the routes file:

`frameSrcUrls` - (NOTE - this is added to the top level `spec` in the routes file) This defines any that will be translated into a `frame-src` [directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-src). This should be a list of comma separate urls.

Additionally, many tools will also require specific configuration to allow their content to be iframed in elsewhere. Here are two such examples:

#### Grafana configuration to allow embedding: https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#allow_embedding.

#### SevOne configuration to allow embedding: https://sevonenms.mypepsico.com/manual/Cluster-Manager.html#:~:text=Force%20Same%20Origin%20Policy
(If not using Chrome, search for 'Force Same Origin Policy' manually in this page)

A simple example would be:
(In your routes file)
```json
{
  "spec": {
    "menuRoutes": [
      {
        "categoryTitle": "Example dashboards",
        "routes": [
          "/demo-iframe"
        ],
        "type": "category"
      }
    ],
    "routes": [
      {
        "path": "/demo-iframe",
        "title": "Iframed Impact Operview View",
        "url": "https://myimpact.com:16311/opview/displays/NCICLUSTER-mwms.html"
      }
    ],
    "frameSrcUrls": "https://myimpact.com:16311"
  }
}
```

## AIOps panels
It is possible to render an existing AIOps panel in a custom page, either in a region or as a full page widget. This is achieved by supplying the `aiopsPanel` key and then one of the following aiopsPanel values.

| Name            | aiopsPanel value |
| --------------- | ---------------- |
| Alert list      | `alertViewer`    |
| Incident list   | `incidentViewer` |
| Topology viewer | `topologyViewer` |

A simple example would be:
(In your routes file):
```json
{
  "spec": {
    "menuRoutes": [
      {
        "categoryTitle": "Example dashboards",
        "routes": [
          "/demo-aiops-panel"
        ],
        "type": "category"
      }
    ],
    "routes": [
      {
        "path": "/demo-aiops-panel",
        "title": "Full page alert viewer",
        "aiopsPanel": "alertViewer"
      }
    ]
  }
}
```

Note - it will soon be possible to provide additional state to components, such as selecting the Alert list filter/view. For any other requirements, please create an issue in the repository.

## Custom bundle panel
This allows you to render a custom panel that you have created using the toolkit. All the predefined routes in the example config are custom panels.

The bundlePath is the path to the bundle that contains the panel. When you deploy your bundle to AIOps, it will use the `bundleName` property of the (target.json)[#targetjson] file. You can swap out 'alerts-examples' as appropriate if you edit this name.
The panelId is the id of the panel within the bundle. When you register your panel in the (src/index.js)[#indexjs] file, the string you provide to the `window.registerCustomPanel(...);` function is the panelId. For example:
`window.registerCustomPanel('hello-world', HelloWorldPanel);`.

A simple example would be:
(In your routes file):
```json
{
  "spec": {
    "menuRoutes": [
      {
        "categoryTitle": "Example dashboards",
        "routes": [
          "/demo-aiops-custom-panel"
        ],
        "type": "category"
      }
    ],
    "routes": [
      {
        "path": "/demo-aiops-custom-panel",
        "title": "Full page custom panel",
        "bundlePath": "bundles/alerts-examples/files/alerts-examples-bundle.js",
        "panelId": "alerts-timeline"
      }
    ]
  }
}
```

## A combination (aka using Regions)
It is possible to combine panels using the regions key, such as a combination of an AIOps Alert list and a custom panel. The full set of examples provided shows multiple examples of this. Currently `regions` uses a simple grid system and supports the following combinations:
- Left, Right, Top, Bottom
- Left, Top, Bottom
- Right, Top, Bottom
- Left, Right
- Top, Bottom

Each region can contain any of the above types, so you can combine AIOps panels, custom panels, and Iframed content all into one page.

A simple example (using one of the provided examples from the repo) would be:
(In your routes file):
```json
{
  "path": "/alerts-timeline",
  "regions": {
    "bottom": {
      "aiopsPanel": "alertViewer"
    },
    "top": {
      "bundlePath": "bundles/alerts-examples/files/alerts-examples-bundle.js",
      "panelId": "alerts-timeline"
    }
},
"title": "Alerts timeline"
},
```

## Customizing the styling of a panel and/or region
CSS Styling can be provided to the overall route, but also to individual regions if using. The following example shows an example composed of a bottom and top region. The top region will take up 30% of the viewport height, and the bottom panel will automatically take up the remaining 70%. However, the entire panel is additionally styled with 20px padding:
```json
{
  "path": "/styled-route",
  "regions": {
    "bottom": {
      "aiopsPanel": "alertViewer"
    },
    "top": {
      "bundlePath": "bundles/alerts-examples/files/alerts-examples-bundle.js",
      "panelId": "styled-panel",
      "style": {
        "height": "30vw"
      }
    }
  },
  "title": "Styled route example",
  "style": {
    "padding": "20px"
  }
}
```
