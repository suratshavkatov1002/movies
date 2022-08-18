let elMoviesWrapper = document.querySelector(".movies_wrapper");
let elForm = document.querySelector(".form");
let elSearch = document.querySelector(".movie__search");
let elRating = document.querySelector(".movie__rating");
let elMovieYear = document.querySelector(".movie__year");
let elSelectCategories = document.querySelector(".movie__categories");
let elSelectSort = document.querySelector(".movie__select");
let elResult = document.querySelector(".result");
let elRenderResult = document.querySelector(".render__result");
let elModalTitle = document.querySelector(".m_title");
let elModalBody = document.querySelector(".m_body");
let elBookmarkedList = document.querySelector(".bookmarked");
let elPaginationList = document.querySelector(".pagination__list");

// Templates
let elMovieCardTemplate = document.querySelector("#movie_card").content;
let elBookmarkedTemplate = document.querySelector("#bookmarkedTemplate").content;
let elPaginationBtn = document.querySelector("#btnTemp").content;

let newMovies = movies.slice(0, 3000)

let perPages = 100;
let currentPage = 1;
let pages

let localStorageMovies = JSON.parse(localStorage.getItem("bookmarkedMovies"))

let bookmarkedMovies = localStorageMovies? localStorageMovies : [] 

// if (JSON.parse(localStorage.getItem("bookmarkedMovies"))) {
//     bookmarkedMovies = JSON.parse(localStorage.getItem("bookmarkedMovies"))
// }else {
//     bookmarkedMovies = []
// }

renderBookmarks(bookmarkedMovies, elBookmarkedList)


let normolizedArray = newMovies.map(function (item) {
    return {
        id: item.imdb_id,
        title: item.Title.toString(),
        movieYear: item.movie_year,
        categories: item.Categories.split("|"),
        rating: item.imdb_rating,
        summary: item.summary,
        img:  `https://i.ytimg.com/vi/${item.ytid}/mqdefault.jpg`,
        videoUrl:  `https://www.youtube.com/watch?v=${item.ytid}`
    }
});

let filteredMovies = normolizedArray
elResult.textContent = filteredMovies.length

function generateCategories(array) {
    let newCategoriesArray = []
    
    for (let item of array) {
        let itemCategoriesArray = item.categories;
        for (let categoryItem of itemCategoriesArray) {
            if (!newCategoriesArray.includes(categoryItem)) {
                newCategoriesArray.push(categoryItem)
            }
        }
    }
    
    return newCategoriesArray
}

let categoryList = generateCategories(normolizedArray);


function renderCategories(array, wrapper) {
    let newFragment = document.createDocumentFragment()
    for (const item of array) {
        let newOption = document.createElement("option");
        newOption.textContent = item;
        newOption.value = item;
        
        newFragment.appendChild(newOption);
    }
    
    wrapper.appendChild(newFragment);
}

renderCategories(categoryList.sort(), elSelectCategories)


function renderMovies(array) {
    elMoviesWrapper.innerHTML = null;
    
    let elFragment = document.createDocumentFragment();
    
    for (const item of array) {
        let movieCard = elMovieCardTemplate.cloneNode(true);
        
        movieCard.querySelector(".card-img-top").src = item.img;
        movieCard.querySelector(".card__heading").textContent = item.title;
        movieCard.querySelector(".movie__year").textContent = item.movieYear;
        movieCard.querySelector(".movie__rating").textContent = item.categories;
        movieCard.querySelector(".movie__link").href = item.videoUrl;
        movieCard.querySelector(".movie__link").setAttribute("target", "blank");
        movieCard.querySelector(".moreinfo_btn").dataset.movieId = item.id;
        movieCard.querySelector(".btn_bookmark").dataset.bookmarkId = item.id;
        
        elFragment.appendChild(movieCard);     
    }
    
    elMoviesWrapper.appendChild(elFragment);      
}

renderMovies(normolizedArray.slice(0, perPages));

if (filteredMovies.length <= perPages) {
    elRenderResult.textContent = filteredMovies.length
}else {
    elRenderResult.textContent = perPages
}

renderButtons(normolizedArray);

elForm.addEventListener("submit", (evt) => {
    evt.preventDefault()
    
    let inputSearch = elSearch.value.trim();
    let pattern = new RegExp(inputSearch, "gi");
    
    let inputRating = elRating.value.trim();
    let inputYear = elMovieYear.value.trim();
    let selectedCategory = elSelectCategories.value.trim();
    let selectedSort = elSelectSort.value.trim();
    
    filteredMovies = normolizedArray.filter(function (item) {      
        let select = selectedCategory == "all" ? true : item.categories.includes(selectedCategory)
        
        let validation = item.rating >= inputRating && item.movieYear >= inputYear && select && item.title.match(pattern)
        return validation
    });
    
    
    filteredMovies.sort((a, b) => {
        if (selectedSort == "rating-high-low") {
            return b.rating - a.rating
        } 
        
        if (selectedSort == "rating-low-high") {
            return a.rating - b.rating
        } 
        
        if (selectedSort == "year-high-low") {
            return b.movieYear - a.movieYear
        } 
        
        if (selectedSort == "year-low-high") {
            return a.movieYear - b.movieYear
        } 
        
        if (selectedSort == "a-z") {
            if (a.title > b.title) {
                return 1
            } else if (a.title < b.title) {
                return -1
            }else {
                return 0
            }
        } 
        
        if (selectedSort == "z-a") {
            if (a.title > b.title) {
                return -1
            } else if (a.title < b.title) {
                return 1
            }else {
                return 0
            }
        } 
        
        
    })
    
    renderMovies(filteredMovies.slice(0, perPages));       
    renderButtons(filteredMovies);
    elResult.textContent = filteredMovies.length
    if (filteredMovies.length <= perPages) {
        elRenderResult.textContent = filteredMovies.length
    }else {
        elRenderResult.textContent = perPages
    }
});


document.addEventListener("click", function(ok) {
    let currentId = ok.target.dataset.movieId
    if (currentId) {
        let foundMovie = normolizedArray.find(function(item) {
            return item.id == currentId
        })
        elModalTitle.textContent = foundMovie.title;
        elModalBody.textContent = foundMovie.summary;
    }
})

elMoviesWrapper.addEventListener("click", function(ok) {
    let currentId = ok.target.dataset.bookmarkId
    if (currentId) {
        let foundMovie = normolizedArray.find(function(item) {
            return item.id == currentId
        })
        
        if (bookmarkedMovies.length == 0) {
            bookmarkedMovies.unshift(foundMovie);
            localStorage.setItem("bookmarkedMovies", JSON.stringify(bookmarkedMovies)) 
        }else { 
            let isInArray = bookmarkedMovies.find(function(item) {
                return item.id == currentId
            })
            
            if (!isInArray) {
                bookmarkedMovies.unshift(foundMovie);
                localStorage.setItem("bookmarkedMovies", JSON.stringify(bookmarkedMovies))  
            }
        }
        
        renderBookmarks(bookmarkedMovies, elBookmarkedList)
    }
})


function renderBookmarks(array, wrapper = elBookmarkedList) {
    wrapper.innerHTML = null
    
    let fragment = document.createDocumentFragment()
    
    for (const item of array) {
        let newLi = elBookmarkedTemplate.cloneNode(true);
        newLi.querySelector(".bookmark__title").textContent = item.title;
        newLi.querySelector(".movie__link").href = item.videoUrl;
        newLi.querySelector(".movie__link").setAttribute("target", "blank");
        newLi.querySelector(".moreinfo_btn").dataset.movieId = item.id;
        newLi.querySelector(".bookmark__btn").dataset.bookmarkBtnId = item.id;
        
        fragment.append(newLi);
    }
    
    wrapper.append(fragment)
}


elBookmarkedList.addEventListener("click", function(evt) {
    let currentBtn = evt.target.dataset.bookmarkBtnId
    
    if (currentBtn) {
        let indexOfItem = bookmarkedMovies.findIndex(function(item) {
            return item.id == currentBtn
        })
        
        bookmarkedMovies.splice(indexOfItem, 1);
        
        renderBookmarks(bookmarkedMovies, elBookmarkedList)
        localStorage.setItem("bookmarkedMovies", JSON.stringify(bookmarkedMovies)) 
    }
})


function renderButtons(array) {
    elPaginationList.innerHTML = null;
    
    pages = Math.ceil(array.length / perPages)
    
    if (pages > 1 ) {
        let fragment = document.createDocumentFragment();
        
        for (let i = 1; i <= pages; i++) {
            let newLi = elPaginationBtn.cloneNode(true);
            newLi.querySelector(".btn__title").textContent = i;
            
            fragment.appendChild(newLi)
        }
        elPaginationList.appendChild(fragment)
    }
}


elPaginationList.addEventListener("click", function(evt) {
    let pageBtn = evt.target.closest(".btn__title");
    
    if (pageBtn) {
        let slicedArray = filteredMovies.slice((pageBtn.textContent - 1)*perPages, perPages * pageBtn.textContent);
        
        let allActiveBtns = elPaginationList.querySelectorAll(".btn__title");
        
        allActiveBtns.forEach(item => {
            item.classList.remove("active")
        });
        pageBtn.classList.add("active")
        
        console.log(allActiveBtns);
        renderMovies(slicedArray)
        
        if (pages == pageBtn.textContent) {
            elRenderResult.textContent = filteredMovies.length
        }else {
            elRenderResult.textContent = perPages * pageBtn.textContent
        }
        
        window.scrollTo(0, 0)
    }
    
})

let shtrafs = [
    {
        id: 1,
        title: "Tezlik oshilildi",
        summa: 280000
    },
    {
        id: 2,
        title: "Tezlik oshilildi 100ga oshgan",
        summa: 1500000
    },
    {
        id: 3,
        title: "Remen",
        summa: 500000
    },
    {
        id: 4,
        title: "Qizil chiroq",
        summa: 5000000
    }
]


let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// let result = numbers.reduce((total, current) => total + Math.pow(current, 2), 0)



// let result = numbers.filter(item => !(item % 2))

numbers.forEach(item => console.log(item));


// console.log(result);


























