getISBN = function () {
  isbnTag = null;
  for (elem of document.querySelectorAll(".a-list-item")) {
    // Generally, the ISBN-13 tag will be last, so we keep looping and return
    // the last one found.
    if (elem && elem.innerText && elem.innerText.startsWith("ISBN-")) {
      isbnTag = elem;
    }
  }
  if (isbnTag != null) {
    return isbnTag.lastElementChild.innerText.trim();
  }
};

getBNUrl = async function (isbn) {
  url = `https://www.barnesandnoble.com/s/${isbn}`;
  return window
    .fetch(url)
    .then((response) => {
      // This will redirect you to a page for this ISBN, or a URL containing
      // "noresults" if nothing was found.
      let result = response.url;
      if (result.includes("noresults")) {
        result = null;
      }
      return result;
    })
    .catch((error) => console.log(error));
};

getIBUrl = async function (isbn) {
  url = `https://www.indiebound.org/book/${isbn}`;
  return window
    .fetch(url)
    .then((response) => {
      /// This returns a 200 if the book exists, otherwise a 404.
      if (response.ok) {
        return response.url;
      }
      return null;
    })
    .catch((error) => console.log(error));
};

getBookshopUrl = async function (isbn) {
  // Bookshop requires the ISBN to not contain any hyphens.
  isbn = isbn.replace("-", "");
  // Bookshop uses the part of the URL path component with `fake-slug` to put a
  // human-readable slug of the book's title. We don't want to try to guess what
  // it is, but we can pull out the canonical URL from the response if it's a
  // 200 OK.
  url = `https://bookshop.org/books/fake-slug/${isbn}`;
  return window
    .fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      throw new Error("Bookshop returned a non-OK response")
    })
    .then((responseText) => {
      // Parse the HTML of the response in order to get the element with the
      // canonical link: `<link rel="canonical" ...`.
      var parser = new DOMParser();
      var doc = parser.parseFromString(responseText, "text/html");
      canonicalUrl = doc.querySelector("link[rel='canonical']").href;

      return canonicalUrl;
    })
    .catch(function (error) {
      // Usually, this error will be the one we threw above.
      // console.log(error)
      return null;
    });
}

getBooksioURL = async function (isbn) {
  // http https://www.booksio.com/search/ajax/suggest/?q=9781984881014 | jq '.[0].url'
  let cleanIsbn = isbn.replace("-", "");
  url = `https://www.booksio.com/search/ajax/suggest/?q=${cleanIsbn}`
  return window
    .fetch(url)
    .then((response) => {
      if (response.ok) {
        let data = response.json();
        return data
      }
    })
    .then((data) => {
      return data[0].url;
    })
    .catch((error) => console.log(error));
};

addMargin = function (node) {
  node.style.marginRight = "20px";
  return node;
};

getLink = function (url, store) {
  let link = null;
  if (url != null) {
    link = document.createElement("a");
    link.href = url;
    link.innerText = "Available at " + store;
  } else {
    link = document.createElement("span");
    link.innerText = "Not available at " + store;
  }
  return addMargin(link);
};

function removeExistingResults() {
  let existingResults = document.querySelectorAll(".bookFinderResults");
  existingResults.forEach((elem) => elem.parentElement.removeChild(elem));
}

function main() {
  removeExistingResults();

  isbn = getISBN();
  if (isbn == null) {
    // Not a book
    console.log("No book found");
    return;
  }

  let bookFinderBanner = document.createElement("div");
  bookFinderBanner.classList.add("a-container"); // Amazon class we want to mimic
  bookFinderBanner.classList.add("bookFinderResults"); // Our class so we can find it later
  bookFinderBanner.style.backgroundColor = "#d0d0d0";

  let bookFinder = document.createElement("span");
  bookFinder.innerHTML = "<b>BookFinder</b>";
  bookFinderBanner.insertBefore(addMargin(bookFinder), null);

  let loading = document.createElement("span");
  loading.innerText = "Loading...";
  bookFinderBanner.insertBefore(addMargin(loading), null);

  let mainContent = document.querySelector("#dp");
  mainContent.insertBefore(bookFinderBanner, mainContent.firstChild);

  bn = getBNUrl(isbn).then((url) => getLink(url, "Barnes and Noble"));
  ib = getIBUrl(isbn).then((url) => getLink(url, "IndieBound"));
  bookshop = getBookshopUrl(isbn).then((url) => getLink(url, "Bookshop.org"));
  booksio = getBooksioURL(isbn).then((url) => getLink(url, "Booksio"));

  Promise.all([bn, ib, bookshop, booksio]).then((values) => {
    bookFinderBanner.removeChild(loading);
    values.forEach((node) => bookFinderBanner.insertBefore(node, null));
  });
}
main();
