// =====================================
// DOM ELEMENTS
// =====================================

const loading =
    document.getElementById("loading");

const ordersContainer =
    document.getElementById("ordersContainer");

const emptyOrders =
    document.getElementById("emptyOrders");

const detailsModal =
    document.getElementById("detailsModal");

const closeModal =
    document.getElementById("closeModal");

const orderDetails =
    document.getElementById("orderDetails");

const modalOrderId =
    document.getElementById("modalOrderId");


// =====================================
// LOAD ORDERS
// =====================================

async function loadOrders() {

    loading.classList.remove("hidden");

    ordersContainer.innerHTML = "";

    emptyOrders.classList.add("hidden");

    try {

        const response =
            await fetch("/api/orders");

        if (!response.ok) {
            throw new Error(
                "Failed to load orders"
            );
        }

        const orders =
            await response.json();

        loading.classList.add("hidden");

        if (
            !orders ||
            orders.length === 0
        ) {

            emptyOrders.classList.remove(
                "hidden"
            );

            return;
        }

        renderOrders(orders);

    } catch (error) {

        console.error(error);

        loading.classList.add("hidden");

        ordersContainer.innerHTML = `
            <div class="error-box">

                <div>
                    ⚠️
                </div>

                <h2>
                    Unable to load orders
                </h2>

                <p>
                    Please make sure the server is running.
                </p>

                <button
                    onclick="loadOrders()"
                    class="retry-btn"
                >
                    Try Again
                </button>

            </div>
        `;
    }
}


// =====================================
// RENDER ORDERS
// =====================================

function renderOrders(orders) {

    ordersContainer.innerHTML = "";

    orders.forEach(order => {

        const card =
            document.createElement("article");

        card.className =
            "order-card";

        const date =
            formatDate(order.createdAt);

        const itemCount =
            order.items.reduce(
                (total, item) =>
                    total + item.quantity,
                0
            );

        card.innerHTML = `

            <div class="order-top">

                <div>

                    <span class="order-label">
                        ORDER ID
                    </span>

                    <h3>
                        ${order.orderId}
                    </h3>

                </div>

                <span class="status-badge">
                    🟢 ${order.status}
                </span>

            </div>


            <div class="order-date">
                🕒 ${date}
            </div>


            <div class="order-items-preview">

                ${order.items
                    .map(item => `
                        <div class="mini-item">

                            <span class="mini-icon">
                                ${item.icon || "☕"}
                            </span>

                            <span>
                                ${item.name}
                            </span>

                            <strong>
                                × ${item.quantity}
                            </strong>

                        </div>
                    `)
                    .join("")
                }

            </div>


            <div class="order-bottom">

                <div>

                    <span class="items-count">
                        ${itemCount}
                        item${itemCount !== 1 ? "s" : ""}
                    </span>

                    <strong class="order-total">
                        ₹${order.total}
                    </strong>

                </div>

                <button
                    class="view-btn"
                    type="button"
                >
                    View Details →
                </button>

            </div>
        `;

        card
            .querySelector(".view-btn")
            .addEventListener(
                "click",
                () => showOrderDetails(order)
            );

        ordersContainer.appendChild(card);
    });
}


// =====================================
// SHOW ORDER DETAILS
// =====================================

function showOrderDetails(order) {

    modalOrderId.textContent =
        `Order ID: ${order.orderId}`;

    orderDetails.innerHTML = `

        <!-- STATUS -->

        <div class="detail-status">

            <span>
                Current Status
            </span>

            <strong>
                🟢 ${order.status}
            </strong>

        </div>


        <!-- CUSTOMER -->

        <div class="detail-section">

            <h3>
                👤 Customer Details
            </h3>

            <div class="customer-info">

                <p>
                    <strong>Name:</strong>
                    ${order.customerName}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${order.phone}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${order.address}
                </p>

            </div>

        </div>


        <!-- ITEMS -->

        <div class="detail-section">

            <h3>
                🛍️ Ordered Items
            </h3>

            <div class="detail-items">

                ${order.items
                    .map(item => `

                        <div class="detail-item">

                            <div class="detail-product">

                                <span class="detail-icon">
                                    ${item.icon || "☕"}
                                </span>

                                <div>

                                    <strong>
                                        ${item.name}
                                    </strong>

                                    <small>
                                        ₹${item.price} ×
                                        ${item.quantity}
                                    </small>

                                </div>

                            </div>

                            <strong>
                                ₹${item.price * item.quantity}
                            </strong>

                        </div>

                    `)
                    .join("")
                }

            </div>

        </div>


        <!-- PAYMENT -->

        <div class="detail-section">

            <h3>
                💵 Payment
            </h3>

            <div class="payment-info">

                <span>
                    Payment Method
                </span>

                <strong>
                    💵 Cash on Delivery
                </strong>

            </div>

        </div>


        <!-- TOTAL -->

        <div class="detail-total">

            <span>
                Order Total
            </span>

            <strong>
                ₹${order.total}
            </strong>

        </div>


        <!-- TRACKING -->

        <!-- TRACKING -->

<div class="tracking">

    <h3>
        🚚 Order Tracking
    </h3>

    ${getTrackingHTML(order.status)}

</div>

    `;

    detailsModal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );
}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(dateString) {

    if (!dateString) {
        return "Date unavailable";
    }

    const date =
        new Date(dateString);

    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


// =====================================
// CLOSE MODAL
// =====================================

function closeDetailsModal() {

    detailsModal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-open"
    );
}

closeModal.addEventListener(
    "click",
    closeDetailsModal
);

detailsModal.addEventListener(
    "click",
    event => {

        if (
            event.target === detailsModal
        ) {
            closeDetailsModal();
        }

    }
);


// =====================================
// START
// =====================================

loadOrders();
// =====================================
// TRACKING
// =====================================

function getTrackingHTML(status) {

    const statuses = [
        "Order Placed",
        "Preparing",
        "Out for Delivery",
        "Delivered"
    ];

    const currentIndex =
        statuses.indexOf(status);

    return statuses
        .map((item, index) => {

            const active =
                index <= currentIndex
                    ? "active"
                    : "";

            const completed =
                index < currentIndex
                    ? "✓"
                    : index + 1;

            const descriptions = {
                "Order Placed":
                    "Your order has been received",

                "Preparing":
                    "Your order is being prepared",

                "Out for Delivery":
                    "Your order is on the way",

                "Delivered":
                    "Enjoy your order!"
            };

            return `
                <div class="tracking-step ${active}">

                    <span>
                        ${completed}
                    </span>

                    <div>

                        <strong>
                            ${item}
                        </strong>

                        <small>
                            ${descriptions[item]}
                        </small>

                    </div>

                </div>

                ${
                    index <
                    statuses.length - 1
                        ? `<div class="tracking-line"></div>`
                        : ""
                }
            `;
        })
        .join("");
}