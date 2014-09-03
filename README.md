# &lt;responsive-embed&gt;

A [Polymer](http://polymer-project.org) element for responsive embeds

> Maintained by [Joselito Júnior](https://github.com/joselitojunior).

## Demo

> [Check it live](http://www.joselitojunior.com/responsive-embed/index.html).

## Installation

Install using [Bower](http://bower.io):

```shell
$ bower install responsive-embed --save
```

## Usage

1. Import Web Components' polyfill (platform.js)

    ```html
    <script src="bower_components/platform/platform.js"></script>
    ```

2. Import Custom Element:

    ```html
    <link rel="import" href="elements/responsive-embed.html">
    ```

3. Start using it!

    ```html
    <responsive-embed>
        <!-- your media content -->
    </responsive-embed>
    ```

## Options

Attribute  | Options                   | Default             | Description
---        | ---                       | ---                 | ---
`ratio`      | `16:9`, `4:3`, `21:9`                  | `16:9`                  | Aspect ratio of the internal content

## Example:

```html
<responsive-embed ratio="16:9">
  <iframe src="//www.youtube.com/embed/UpuJS4LO_Ms" frameborder="0" allowfullscreen></iframe>  
</responsive-embed>
```

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)