let bnBaseUrl = "https://www.barnesandnoble.com/s/";
let ibBaseUrl = "https://www.indiebound.org/book/";

getISBN = function () {
  isbnTag = null;
  for (elem of document.querySelectorAll(".detail-bullet-label")) {
    // If there is at least one of these, we'll be able to search by it.
    if (elem.innerText.startsWith("ISBN-")) {
      isbnTag = elem;
      break;
    }
  }
  if (isbnTag != null) {
    return isbnTag.nextElementSibling.innerText.trim();
  }
};

getBNUrl = async function (isbn) {
  return window
    .fetch(bnBaseUrl + isbn)
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
  return window
    .fetch(ibBaseUrl + isbn)
    .then((response) => {
      /// This returns a 200 if the book exists, otherwise a 404.
      if (response.ok) {
        return response.url;
      }
      return null;
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

  Promise.all([bn, ib]).then((values) => {
    bookFinderBanner.removeChild(loading);
    values.forEach((node) => bookFinderBanner.insertBefore(node, null));
  });
}
main();
