// =====================================
// DOM ELEMENTS
// =====================================

const searchInput =
    document.getElementById("searchInput");

const clearBtn =
    document.getElementById("clearBtn");

const categoryContainer =
    document.getElementById("categoryContainer");

const resultsGrid =
    document.getElementById("resultsGrid");

const resultCount =
    document.getElementById("resultCount");

const pagination =
    document.getElementById("pagination");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const resetBtn =
    document.getElementById("resetBtn");

const emptyReset =
    document.getElementById("emptyReset");

const limitSelect =
    document.getElementById("limitSelect");

const themeBtn =
    document.getElementById("themeBtn");


// CART

const cartBtn =
    document.getElementById("cartBtn");

const cartCount =
    document.getElementById("cartCount");

const cartModal =
    document.getElementById("cartModal");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartEmpty =
    document.getElementById("cartEmpty");

const cartSummary =
    document.getElementById("cartSummary");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");


// CHECKOUT

const checkoutModal =
    document.getElementById("checkoutModal");

const closeCheckout =
    document.getElementById("closeCheckout");

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutTotal =
    document.getElementById("checkoutTotal");


// SUCCESS

const successModal =
    document.getElementById("successModal");

const continueBtn =
    document.getElementById("continueBtn");


// =====================================
// STATE
// =====================================

let currentPage = 1;

let selectedCategories = [];

let searchTerm = "";

let limit = 6;

let favorites = JSON.parse(
    localStorage.getItem("favorites") || "[]"
);

let cart = JSON.parse(
    localStorage.getItem("cart") || "[]"
);


// =====================================
// LOAD ITEMS
// =====================================

async function loadItems() {

    showLoading();

    try {

        const params =
            new URLSearchParams();

        if (searchTerm) {

            params.append(
                "search",
                searchTerm
            );
        }

        if (selectedCategories.length > 0) {

            params.append(
                "category",
                selectedCategories.join(",")
            );
        }

        params.append(
            "page",
            currentPage
        );

        params.append(
            "limit",
            limit
        );

        const response =
            await fetch(
                `/api/items?${params.toString()}`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch items"
            );
        }

        const data =
            await response.json();

        renderCategories(
            data.categories || []
        );

        renderItems(
            data.items || []
        );

        renderPagination(
            data.currentPage,
            data.totalPages
        );

        resultCount.textContent =
            `${data.totalItems} result${data.totalItems !== 1 ? "s" : ""} found`;

    } catch (error) {

        console.error(error);

        resultsGrid.innerHTML = `
            <div class="error-message">

                <h3>
                    ⚠️ Something went wrong
                </h3>

                <p>
                    Please make sure the server is running.
                </p>

                <button onclick="loadItems()">
                    Try Again
                </button>

            </div>
        `;

        resultCount.textContent =
            "Unable to load results";

        pagination.innerHTML = "";

    } finally {

        hideLoading();
    }
}


// =====================================
// CATEGORIES
// =====================================

function renderCategories(categories) {

    categoryContainer.innerHTML = "";

    const icons = {

        Coffee: "☕",

        Tea: "🍵",

        Dessert: "🍰"

    };

    categories.forEach(category => {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "category";

        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.id =
            `category-${category}`;

        checkbox.value =
            category;

        checkbox.checked =
            selectedCategories.includes(
                category
            );

        const label =
            document.createElement("label");

        label.htmlFor =
            checkbox.id;

        label.textContent =
            `${icons[category] || "✨"} ${category}`;

        checkbox.addEventListener(
            "change",
            handleCategoryChange
        );

        wrapper.appendChild(
            checkbox
        );

        wrapper.appendChild(
            label
        );

        categoryContainer.appendChild(
            wrapper
        );

    });
}


// =====================================
// CATEGORY CHANGE
// =====================================

function handleCategoryChange(event) {

    const category =
        event.target.value;

    if (event.target.checked) {

        if (
            !selectedCategories.includes(
                category
            )
        ) {

            selectedCategories.push(
                category
            );
        }

    } else {

        selectedCategories =
            selectedCategories.filter(
                item => item !== category
            );
    }

    currentPage = 1;

    loadItems();
}


// =====================================
// RENDER PRODUCTS
// =====================================

function renderItems(items) {

    resultsGrid.innerHTML = "";

    if (items.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }

    emptyState.classList.add(
        "hidden"
    );


    items.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "card";


        const isFavorite =
            favorites.includes(item.id);


        card.innerHTML = `

            <div class="card-top">

                <div class="card-icon">
                    ${item.icon || "✨"}
                </div>

                <button
                    class="favorite"
                    type="button"
                    title="${
                        isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }"
                >
                    ${
                        isFavorite
                            ? "❤️"
                            : "🤍"
                    }
                </button>

            </div>


            <span class="category-badge">
                ${item.category}
            </span>


            <h3>
                ${item.name}
            </h3>


            <p>
                ${item.description}
            </p>


            <div class="rating">

                <span class="stars">
                    ${getStars(item.rating)}
                </span>

                <span class="rating-number">
                    ${Number(item.rating).toFixed(1)}
                </span>

            </div>


            <div class="product-bottom">

                <strong class="price">
                    ₹${item.price}
                </strong>

            </div>


            <div class="card-actions">

                <button
                    class="add-cart-btn"
                    type="button"
                >
                    🛒 Add to Cart
                </button>

                <button
                    class="buy-btn"
                    type="button"
                >
                    🛍️ Buy Now
                </button>

            </div>

        `;


        // FAVORITE

        const favoriteButton =
            card.querySelector(
                ".favorite"
            );

        favoriteButton.addEventListener(
            "click",
            () => toggleFavorite(item.id)
        );


        // ADD TO CART

        const addCartButton =
            card.querySelector(
                ".add-cart-btn"
            );

        addCartButton.addEventListener(
            "click",
            () => {

                addToCart(item);

                addCartButton.textContent =
                    "✓ Added to Cart";

                addCartButton.classList.add(
                    "added"
                );

                setTimeout(() => {

                    addCartButton.textContent =
                        "🛒 Add to Cart";

                    addCartButton.classList.remove(
                        "added"
                    );

                }, 1200);

            }
        );


        // BUY NOW

        const buyButton =
            card.querySelector(
                ".buy-btn"
            );

        buyButton.addEventListener(
            "click",
            () => {

                addToCart(item);

                openCart();

            }
        );


        resultsGrid.appendChild(
            card
        );

    });
}


// =====================================
// STAR RATING
// =====================================

function getStars(rating) {

    const number =
        Number(rating) || 0;

    const rounded =
        Math.round(number);

    return "⭐".repeat(
        Math.min(rounded, 5)
    );
}


// =====================================
// FAVORITES
// =====================================

function toggleFavorite(id) {

    if (
        favorites.includes(id)
    ) {

        favorites =
            favorites.filter(
                item => item !== id
            );

    } else {

        favorites.push(id);

    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadItems();
}


// =====================================
// CART
// =====================================

function addToCart(product) {

    const existing =
        cart.find(
            item => item.id === product.id
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            category: product.category,

            icon: product.icon,

            price: product.price,

            quantity: 1

        });

    }


    saveCart();

    updateCartCount();

    showCartNotification(
        `${product.name} added to your basket 🛒`
    );
}


// =====================================
// SAVE CART
// =====================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    updateCartCount();
}


// =====================================
// CART COUNT
// =====================================

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    cartCount.textContent =
        count;
}


// =====================================
// OPEN CART
// =====================================

function openCart() {

    renderCart();

    cartModal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );
}


// =====================================
// CLOSE CART
// =====================================

function closeCartModal() {

    cartModal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-open"
    );
}


// =====================================
// RENDER CART
// =====================================

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartEmpty.classList.remove(
            "hidden"
        );

        cartSummary.classList.add(
            "hidden"
        );

        return;
    }


    cartEmpty.classList.add(
        "hidden"
    );

    cartSummary.classList.remove(
        "hidden"
    );


    cart.forEach(item => {

        const cartItem =
            document.createElement("div");

        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div class="cart-product-icon">
                ${item.icon}
            </div>


            <div class="cart-product-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    ₹${item.price} each
                </p>

            </div>


            <div class="quantity-controls">

                <button
                    class="quantity-btn decrease"
                    type="button"
                >
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    class="quantity-btn increase"
                    type="button"
                >
                    +
                </button>

            </div>


            <strong class="cart-item-total">
                ₹${item.price * item.quantity}
            </strong>


            <button
                class="remove-item"
                type="button"
                title="Remove item"
            >
                🗑️
            </button>

        `;


        cartItem
            .querySelector(".decrease")
            .addEventListener(
                "click",
                () => changeQuantity(
                    item.id,
                    -1
                )
            );


        cartItem
            .querySelector(".increase")
            .addEventListener(
                "click",
                () => changeQuantity(
                    item.id,
                    1
                )
            );


        cartItem
            .querySelector(".remove-item")
            .addEventListener(
                "click",
                () => removeFromCart(
                    item.id
                )
            );


        cartItems.appendChild(
            cartItem
        );

    });


    updateCartTotals();
}


// =====================================
// CHANGE QUANTITY
// =====================================

function changeQuantity(
    id,
    change
) {

    const item =
        cart.find(
            item => item.id === id
        );

    if (!item) return;


    item.quantity += change;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item => item.id !== id
            );
    }


    saveCart();

    renderCart();
}


// =====================================
// REMOVE FROM CART
// =====================================

function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );

    saveCart();

    renderCart();
}


// =====================================
// CART TOTALS
// =====================================

function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            item.price *
            item.quantity,
        0
    );
}


function updateCartTotals() {

    const total =
        getCartTotal();

    cartSubtotal.textContent =
        `₹${total}`;

    cartTotal.textContent =
        `₹${total}`;

    checkoutTotal.textContent =
        `₹${total}`;
}


// =====================================
// CHECKOUT
// =====================================

function openCheckout() {

    if (cart.length === 0) {

        alert(
            "Your basket is empty. Add something first! 🛒"
        );

        return;
    }


    updateCartTotals();

    closeCartModal();

    checkoutModal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );
}


// =====================================
// CLOSE CHECKOUT
// =====================================

function closeCheckoutModal() {

    checkoutModal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-open"
    );
}


// =====================================
// PLACE ORDER
// =====================================

// =====================================
// PLACE ORDER
// =====================================

checkoutForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const name =
            document.getElementById(
                "customerName"
            ).value.trim();

        const phone =
            document.getElementById(
                "customerPhone"
            ).value.trim();

        const address =
            document.getElementById(
                "customerAddress"
            ).value.trim();

        if (
            !name ||
            !phone ||
            !address
        ) {
            alert(
                "Please fill in all delivery details."
            );
            return;
        }

        try {

            const response = await fetch(
                "/api/orders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        customerName: name,
                        phone: phone,
                        address: address,
                        paymentMethod: "Cash on Delivery",
                        items: cart,
                        total: getCartTotal()
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to place order"
                );
            }

            document.querySelector(
                ".success-modal h2"
            ).textContent =
                "🎉 Order Placed!";

            document.querySelector(
                ".success-modal p"
            ).textContent =
                `Your Order ID is ${data.order.orderId}`;

            cart = [];

            saveCart();

            checkoutForm.reset();

            closeCheckoutModal();

            successModal.classList.remove(
                "hidden"
            );

            document.body.classList.add(
                "modal-open"
            );

        } catch (error) {

            console.error(error);

            alert(
                "Unable to place your order. Please try again."
            );
        }
    }
);


// =====================================
// CONTINUE SHOPPING
// =====================================

continueBtn.addEventListener(
    "click",
    () => {

        successModal.classList.add(
            "hidden"
        );

        document.body.classList.remove(
            "modal-open"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// =====================================
// CART EVENTS
// =====================================

cartBtn.addEventListener(
    "click",
    openCart
);

closeCart.addEventListener(
    "click",
    closeCartModal
);

checkoutBtn.addEventListener(
    "click",
    openCheckout
);

closeCheckout.addEventListener(
    "click",
    closeCheckoutModal
);


// =====================================
// CLOSE MODALS BY CLICKING OUTSIDE
// =====================================

cartModal.addEventListener(
    "click",
    event => {

        if (
            event.target === cartModal
        ) {

            closeCartModal();

        }

    }
);


checkoutModal.addEventListener(
    "click",
    event => {

        if (
            event.target === checkoutModal
        ) {

            closeCheckoutModal();

        }

    }
);


// =====================================
// NOTIFICATION
// =====================================

function showCartNotification(
    message
) {

    const notification =
        document.createElement(
            "div"
        );

    notification.className =
        "cart-notification";

    notification.textContent =
        message;

    document.body.appendChild(
        notification
    );


    setTimeout(() => {

        notification.classList.add(
            "show"
        );

    }, 10);


    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 1800);
}


// =====================================
// PAGINATION
// =====================================

function renderPagination(
    current,
    total
) {

    pagination.innerHTML = "";

    if (
        !total ||
        total <= 1
    ) {

        return;
    }


    const previous =
        document.createElement(
            "button"
        );

    previous.className =
        "page-btn";

    previous.textContent =
        "‹";

    previous.disabled =
        current === 1;


    previous.addEventListener(
        "click",
        () => {

            if (current > 1) {

                currentPage =
                    current - 1;

                loadItems();

                scrollToResults();

            }

        }
    );


    pagination.appendChild(
        previous
    );


    for (
        let page = 1;
        page <= total;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "page-btn";

        button.textContent =
            page;


        if (
            page === current
        ) {

            button.classList.add(
                "active"
            );
        }


        button.addEventListener(
            "click",
            () => {

                currentPage =
                    page;

                loadItems();

                scrollToResults();

            }
        );


        pagination.appendChild(
            button
        );

    }


    const next =
        document.createElement(
            "button"
        );

    next.className =
        "page-btn";

    next.textContent =
        "›";

    next.disabled =
        current === total;


    next.addEventListener(
        "click",
        () => {

            if (
                current < total
            ) {

                currentPage =
                    current + 1;

                loadItems();

                scrollToResults();

            }

        }
    );


    pagination.appendChild(
        next
    );
}


// =====================================
// SCROLL
// =====================================

function scrollToResults() {

    const top =
        resultsGrid.getBoundingClientRect().top +
        window.scrollY -
        120;

    window.scrollTo({

        top: top,

        behavior: "smooth"

    });
}


// =====================================
// DEBOUNCED SEARCH
// =====================================

let debounceTimer;


searchInput.addEventListener(
    "input",
    () => {

        clearTimeout(
            debounceTimer
        );


        debounceTimer =
            setTimeout(
                () => {

                    searchTerm =
                        searchInput.value.trim();

                    currentPage = 1;

                    loadItems();

                },
                400
            );

    }
);


// =====================================
// CLEAR SEARCH
// =====================================

clearBtn.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        searchTerm = "";

        currentPage = 1;

        loadItems();

        searchInput.focus();

    }
);


// =====================================
// RESET FILTERS
// =====================================

function resetFilters() {

    searchInput.value = "";

    searchTerm = "";

    selectedCategories = [];

    currentPage = 1;

    loadItems();
}


resetBtn.addEventListener(
    "click",
    resetFilters
);


emptyReset.addEventListener(
    "click",
    resetFilters
);


// =====================================
// ITEMS PER PAGE
// =====================================

limitSelect.addEventListener(
    "change",
    () => {

        limit =
            Number(
                limitSelect.value
            );

        currentPage = 1;

        loadItems();

    }
);


// =====================================
// DARK MODE
// =====================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        themeBtn.textContent =
            dark
                ? "☀️"
                : "🌙";


        localStorage.setItem(
            "theme",
            dark
                ? "dark"
                : "light"
        );

    }
);


if (
    localStorage.getItem(
        "theme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    themeBtn.textContent =
        "☀️";
}


// =====================================
// LOADING
// =====================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

    resultsGrid.classList.add(
        "hidden"
    );
}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

    resultsGrid.classList.remove(
        "hidden"
    );
}


// =====================================
// START
// =====================================

updateCartCount();

loadItems();