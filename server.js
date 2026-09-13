const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const ORDERS_FILE = path.join(__dirname, "orders.json");

function getOrders() {
    if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(
            ORDERS_FILE,
            JSON.stringify([], null, 2)
        );
    }

    return JSON.parse(
        fs.readFileSync(ORDERS_FILE, "utf8")
    );
}

function saveOrders(orders) {
    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(orders, null, 2)
    );
}
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =====================================
// PRODUCTS
// =====================================

const items = [
    {
        id: 1,
        name: "Espresso",
        category: "Coffee",
        description: "Rich and bold espresso with a smooth crema.",
        icon: "☕",
        rating: 4.8,
        price: 120
    },
    {
        id: 2,
        name: "Cappuccino",
        category: "Coffee",
        description: "Velvety espresso with steamed milk and foam.",
        icon: "☕",
        rating: 4.7,
        price: 160
    },
    {
        id: 3,
        name: "Latte",
        category: "Coffee",
        description: "Smooth espresso blended with creamy steamed milk.",
        icon: "☕",
        rating: 4.6,
        price: 180
    },
    {
        id: 4,
        name: "Americano",
        category: "Coffee",
        description: "Classic espresso balanced with hot water.",
        icon: "☕",
        rating: 4.4,
        price: 130
    },

    {
        id: 5,
        name: "Green Tea",
        category: "Tea",
        description: "Fresh and refreshing green tea with a delicate taste.",
        icon: "🍵",
        rating: 4.5,
        price: 100
    },
    {
        id: 6,
        name: "Masala Tea",
        category: "Tea",
        description: "Traditional Indian tea infused with aromatic spices.",
        icon: "🍵",
        rating: 4.9,
        price: 90
    },
    {
        id: 7,
        name: "Black Tea",
        category: "Tea",
        description: "Bold and comforting classic black tea.",
        icon: "🍵",
        rating: 4.3,
        price: 80
    },
    {
        id: 8,
        name: "Lemon Tea",
        category: "Tea",
        description: "Refreshing tea with a bright lemon twist.",
        icon: "🍋",
        rating: 4.5,
        price: 100
    },

    {
        id: 9,
        name: "Chocolate Cake",
        category: "Dessert",
        description: "Moist chocolate cake with a rich cocoa flavor.",
        icon: "🍰",
        rating: 4.8,
        price: 220
    },
    {
        id: 10,
        name: "Cheesecake",
        category: "Dessert",
        description: "Creamy cheesecake with a buttery biscuit base.",
        icon: "🍰",
        rating: 4.7,
        price: 240
    },
    {
        id: 11,
        name: "Brownie",
        category: "Dessert",
        description: "Warm and fudgy chocolate brownie.",
        icon: "🍫",
        rating: 4.9,
        price: 150
    },
    {
        id: 12,
        name: "Vanilla Ice Cream",
        category: "Dessert",
        description: "Cool, creamy and classic vanilla ice cream.",
        icon: "🍨",
        rating: 4.6,
        price: 140
    }
];

// =====================================
// SEARCH + FILTER + PAGINATION API
// =====================================

app.get("/api/items", (req, res) => {
    const search = req.query.search || "";
    const category = req.query.category || "";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    let filteredItems = [...items];

    // SEARCH
    if (search.trim()) {
        const searchTerm = search.toLowerCase();

        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm)
        );
    }

    // CATEGORY FILTER
    if (category) {
        const categories = category
            .split(",")
            .map(cat => cat.trim())
            .filter(Boolean);

        filteredItems = filteredItems.filter(item =>
            categories.includes(item.category)
        );
    }

    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / limit);

    const safePage = Math.min(
        Math.max(page, 1),
        Math.max(totalPages, 1)
    );

    const startIndex = (safePage - 1) * limit;

    const paginatedItems = filteredItems.slice(
        startIndex,
        startIndex + limit
    );

    const categories = [
        ...new Set(items.map(item => item.category))
    ];

    res.json({
        items: paginatedItems,
        currentPage: safePage,
        totalPages,
        totalItems,
        categories
    });
});
// =====================================
// CREATE ORDER
// =====================================

app.post("/api/orders", (req, res) => {

    const {
        customerName,
        phone,
        address,
        paymentMethod,
        items,
        total
    } = req.body;

    if (
        !customerName ||
        !phone ||
        !address ||
        !items ||
        items.length === 0
    ) {
        return res.status(400).json({
            message: "Please provide all order details."
        });
    }

    const orders = getOrders();

    const orderId =
        "BB" +
        Date.now().toString().slice(-8);

    const order = {
        orderId,
        customerName,
        phone,
        address,
        paymentMethod: "Cash on Delivery",
        items,
        total,
        status: "Order Placed",
        createdAt: new Date().toISOString()
    };

    orders.push(order);

    saveOrders(orders);

    res.status(201).json({
        message: "Order placed successfully!",
        order
    });
});


// =====================================
// GET ALL ORDERS
// =====================================

app.get("/api/orders", (req, res) => {

    const orders = getOrders();

    res.json([...orders].reverse());
});


// =====================================
// GET SINGLE ORDER
// =====================================

app.get("/api/orders/:orderId", (req, res) => {

    const orders = getOrders();

    const order =
        orders.find(
            item =>
                item.orderId ===
                req.params.orderId
        );

    if (!order) {

        return res.status(404).json({
            message: "Order not found."
        });

    }

    res.json(order);
});
// =====================================
// UPDATE ORDER STATUS
// =====================================

app.put(
    "/api/orders/:orderId/status",
    (req, res) => {

        const {
            status
        } = req.body;

        const allowedStatuses = [
            "Order Placed",
            "Preparing",
            "Out for Delivery",
            "Delivered"
        ];

        if (
            !allowedStatuses.includes(
                status
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid order status."
            });
        }

        const orders =
            getOrders();

        const orderIndex =
            orders.findIndex(
                order =>
                    order.orderId ===
                    req.params.orderId
            );

        if (
            orderIndex === -1
        ) {
            return res.status(404).json({
                message:
                    "Order not found."
            });
        }

        orders[orderIndex].status =
            status;

        orders[orderIndex].updatedAt =
            new Date().toISOString();

        saveOrders(orders);

        res.json({
            message:
                "Order status updated successfully.",
            order:
                orders[orderIndex]
        });
    }
);

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
    console.log(`BrewBasket running on http://localhost:${PORT}`);
});