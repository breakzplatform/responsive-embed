# &lt;responsive-embed&gt;

A [Polymer](http://polymer-project.org) element for responsive embeds

> Maintained by [Joselito Júnior](https://github.com/joselitojunior1).

## Demo

> [Check it live](https://joselito.ninja/responsive-embed/).

## Installation

Install using [Bower](http://bower.io):

```shell
$ bower i responsive-embed -S
```

## Usage

1. Import Web Components' polyfill (webcomponents.js)

    ```html
    <script src="bower_components/webcomponentsjs/webcomponents.js"></script>
    ```

2. Import Custom Element:

    ```html
    <link rel="import" href="responsive-embed.html">
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
`ratio`      | `1:1`, `4:3`,`16:9`, `21:9`                  | `16:9`                  | Aspect ratio of the internal content

## Example:

```html
<responsive-embed ratio="16:9">
  <iframe src="https://www.youtube.com/embed/fCLMI5TCcqg" frameborder="0" allowfullscreen></iframe>
</responsive-embed>
```

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
