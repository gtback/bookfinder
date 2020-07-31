# bookfinder

Web Extension to add links to other bookstores on Amazon product pages.

Amazon is by far the most popular way people share links to books. This
extension makes it easy to go from books on Amazon to the same book on other sites. Currently supported sites are:

- Barnes and Noble
- IndieBound

NOTE: This only works for US domains for now.

**Screenshot**:

![Bookfinder on Amazon](bookfinder.png)

## Installation

Install from [addons.mozilla.org][amo].

[amo]: https://addons.mozilla.org/en-US/firefox/addon/bookfinder/

## Developing

Use the [`web-ext`](https://github.com/mozilla/web-ext) tool to develop, test,
and build this extension.

```sh
npm install -g web-ext

web-ext run

web-ext lint

web-ext build
```

For now I've been manually uploading the extension to addons.mozilla.org rather
than trying to set up `web-ext sign`.
