# Meatwagon.js 🥩

A dead-simple templating engine with pug-like syntax.

```pug
header.blue
    - if (state.loggedIn)
        h2 Welcome, ${state.user}!
        a(href="/logout") Logout
    - else
        a(href="/login") Login
main
    h2#news News
    - for (let i = 0; i < state.news.length; i++)
        - let news = state.news[i];
        article(id="a${i}")
            h3 ${news.title}
            p ${news.body}
footer
    | © Necropolist ${(new Date()).getFullYear()}}
```
```js
meatwagon.render(input, {
    user: 'Arthas',
    loggedIn: true,
    news: [{
        title: 'New Yandex.Camera can fit 15 arrested men',
        body: 'And other jokes.'
    }, {
        title: 'Bears learned to fly',
        body: 'We\'re in danger.'
    }]
});
```
```html
<header class="blue">
    <h2>Welcome, Arthas!</h2><a href="/logout">Logout</a>
</header>
<main>
    <h2 id="news">News</h2>
    <article id="a0">
        <h3>New Yandex.Camera can fit 15 arrested men</h3>
        <p>And other jokes.</p>
    </article>
    <article id="a1">
        <h3>Bears learned to fly</h3>
        <p>We're in danger.</p>
    </article>
</main>
<footer>© Necropolist 2022}</footer>
```

## Syntax

* **Pug-like tags.**
  * Full syntax: `tag-name.classOne.classTwo#Id(attribute="value") Text`
  * If no tag name is specified, `div` is used. For example, `.aNotice You have mail!` renders into `<div class="aNotice">You have mail!</div>`.
  * ⚠ Classes and ID must go before the attributes, if there are any.
* **Text nodes.** Any line starting with `|` is output as text.
* **Plain text.** Put a dot at the end of a tag and write plain text inside it.
* **JS string templating.** Put `${state.yourProperty}` to output values inside text nodes or tags.
* **JS code.** Any line with `-` as its first symbol is treated as is, as a JavaScript code.
  * `if (condition)`, `while (condition)`, `for (whatever)`, and `else` automatically wrap nested markup with `{` `}`.
* **Comments:** `//` for those that don't get in the output HTML and `//-` for those that do.

## API

### `meatwagon.render(input, state)`

Immediately renders the input with a given state.

### `meatwagon.renderer(input)`

Bakes a function for the input code that can be used repeatedly with different state objects as their argument to render the template.

```js
const renderer = meatwagon.renderer('Hello ${state.user}!')
