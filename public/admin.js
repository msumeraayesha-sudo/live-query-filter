// =====================================
// DOM ELEMENTS
// =====================================

const loading =
    document.getElementById("loading");

const ordersTableWrapper =
    document.getElementById(
        "ordersTableWrapper"
    );

const ordersTable =
    document.getElementById(
        "ordersTable"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const totalOrders =
    document.getElementById(
        "totalOrders"
    );

const newOrders =
    document.getElementById(
        "newOrders"
    );

const deliveryOrders =
    document.getElementById(
        "deliveryOrders"
    );

const totalRevenue =
    document.getElementById(
        "totalRevenue"
    );

const toast =
    document.getElementById(
        "toast"
    );


// =====================================
// LOAD ORDERS
// =====================================

async function loadOrders() {

    loading.classList.remove(
        "hidden"
    );

    ordersTableWrapper.classList.add(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    try {

        const response =
            await fetch(
                "/api/orders"
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load orders"
            );
        }

        const orders =
            await response.json();

        loading.classList.add(
            "hidden"
        );

        updateStatistics(
            orders
        );

        if (
            !orders ||
            orders.length === 0
        ) {

            emptyState.classList.remove(
                "hidden"
            );

            return;
        }

        renderOrders(orders);

        ordersTableWrapper.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(error);

        loading.classList.add(
            "hidden"
        );

        ordersTable.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="error-message">
                        ⚠️ Unable to load orders.
                        Please try again.
                    </div>
                </td>
            </tr>
        `;

        ordersTableWrapper.classList.remove(
            "hidden"
        );
    }
}


// =====================================
// STATISTICS
// =====================================

function updateStatistics(orders) {

    totalOrders.textContent =
        orders.length;

    const newCount =
        orders.filter(
            order =>
                order.status ===
                "Order Placed"
        ).length;

    newOrders.textContent =
        newCount;

    const deliveryCount =
        orders.filter(
            order =>
                order.status ===
                "Out for Delivery"
        ).length;

    deliveryOrders.textContent =
        deliveryCount;

    const revenue =
        orders.reduce(
            (total, order) =>
                total +
                Number(order.total || 0),
            0
        );

    totalRevenue.textContent =
        `₹${revenue}`;
}


// =====================================
// RENDER ORDERS
// =====================================

function renderOrders(orders) {

    ordersTable.innerHTML = "";

    orders.forEach(order => {

        const row =
            document.createElement("tr");

        const itemCount =
            order.items.reduce(
                (total, item) =>
                    total + item.quantity,
                0
            );

        const itemsPreview =
            order.items
                .map(
                    item =>
                        `${item.icon || "☕"} ${item.name} ×${item.quantity}`
                )
                .join("<br>");

        row.innerHTML = `

            <td>

                <div class="order-id">
                    ${order.orderId}
                </div>

                <small>
                    ${formatDate(order.createdAt)}
                </small>

            </td>


            <td>

                <strong>
                    ${order.customerName}
                </strong>

                <small>
                    📞 ${order.phone}
                </small>

            </td>


            <td>

                <div class="items-preview">
                    ${itemsPreview}
                </div>

                <small>
                    ${itemCount}
                    item${itemCount !== 1 ? "s" : ""}
                </small>

            </td>


            <td>

                <strong class="price">
                    ₹${order.total}
                </strong>

            </td>


            <td>

                <span class="payment-badge">
                    💵 COD
                </span>

            </td>


            <td>

                <span
                    class="status-badge ${getStatusClass(order.status)}"
                >
                    ${getStatusIcon(order.status)}
                    ${order.status}
                </span>

            </td>


            <td>

                <select
                    class="status-select"
                    data-order-id="${order.orderId}"
                >

                    <option
                        value="Order Placed"
                        ${order.status === "Order Placed" ? "selected" : ""}
                    >
                        🟢 Order Placed
                    </option>

                    <option
                        value="Preparing"
                        ${order.status === "Preparing" ? "selected" : ""}
                    >
                        🟡 Preparing
                    </option>

                    <option
                        value="Out for Delivery"
                        ${order.status === "Out for Delivery" ? "selected" : ""}
                    >
                        🔵 Out for Delivery
                    </option>

                    <option
                        value="Delivered"
                        ${order.status === "Delivered" ? "selected" : ""}
                    >
                        🟣 Delivered
                    </option>

                </select>

            </td>

        `;

        const select =
            row.querySelector(
                ".status-select"
            );

        select.addEventListener(
            "change",
            () =>
                updateStatus(
                    order.orderId,
                    select.value
                )
        );

        ordersTable.appendChild(row);
    });
}


// =====================================
// UPDATE STATUS
// =====================================

async function updateStatus(
    orderId,
    status
) {

    try {

        const response =
            await fetch(
                `/api/orders/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to update status"
            );
        }

        showToast(
            `Order ${orderId} updated to ${status} ✓`
        );

        loadOrders();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to update order status.",
            true
        );

    }
}


// =====================================
// STATUS HELPERS
// =====================================

function getStatusIcon(status) {

    const icons = {
        "Order Placed": "🟢",
        "Preparing": "🟡",
        "Out for Delivery": "🔵",
        "Delivered": "🟣"
    };

    return icons[status] || "⚪";
}


function getStatusClass(status) {

    const classes = {
        "Order Placed": "placed",
        "Preparing": "preparing",
        "Out for Delivery": "delivery",
        "Delivered": "delivered"
    };

    return classes[status] || "";
}


// =====================================
// DATE
// =====================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    return new Date(
        dateString
    ).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


// =====================================
// TOAST
// =====================================

function showToast(
    message,
    isError = false
) {

    toast.textContent =
        message;

    toast.className =
        "toast show";

    if (isError) {
        toast.classList.add(
            "error"
        );
    }

    setTimeout(
        () => {
            toast.classList.remove(
                "show"
            );
        },
        2500
    );
}


// =====================================
// REFRESH
// =====================================

refreshBtn.addEventListener(
    "click",
    loadOrders
);


// =====================================
// START
// =====================================

loadOrders();