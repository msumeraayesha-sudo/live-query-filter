# 🛍️ Live Query Filter

A full-stack shopping application built with **Node.js, Express.js, HTML, CSS, and JavaScript**. The application provides live search, category filtering, pagination, favorites, shopping cart functionality, checkout, and Cash on Delivery ordering.

## ✨ Features

* 🔍 **Live Search** – Search products by name, description, or category.
* 🏷️ **Category Filtering** – Filter products by Coffee, Tea, and Dessert.
* 📄 **Pagination** – Browse products page by page.
* ⭐ **Product Ratings** – Display ratings and star reviews.
* ❤️ **Favorites** – Save favorite products using browser local storage.
* 🛒 **Shopping Cart** – Add, remove, and update product quantities.
* 🛍️ **Buy Now** – Quickly add a product and proceed to checkout.
* 💳 **Cash on Delivery** – Place orders using Cash on Delivery.
* 📦 **Order Management** – Store orders and update their status.
* 🆔 **Order ID** – Generate a unique order ID for every order.
* 🌙 **Dark Mode** – Switch between light and dark themes.
* 📱 **Responsive Design** – Designed to work across different screen sizes.
* ⚡ **Debounced Search** – Reduces unnecessary API requests while typing.

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Local Storage
* Fetch API

### Backend

* Node.js
* Express.js
* CORS
* File System (`fs`)
* REST API

### Data Storage

* JSON-based order storage
* Browser Local Storage for cart and favorites

## 📂 Project Structure

```text
live-query-filter/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── orders.json
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Get Products

```http
GET /api/items
```

Supports:

```text
search
category
page
limit
```

Example:

```text
/api/items?search=coffee&category=Coffee&page=1&limit=6
```

### Create Order

```http
POST /api/orders
```

Creates a new Cash on Delivery order.

### Get All Orders

```http
GET /api/orders
```

Returns all orders.

### Get Single Order

```http
GET /api/orders/:orderId
```

Returns details for a specific order.

### Update Order Status

```http
PUT /api/orders/:orderId/status
```

Supported statuses:

```text
Order Placed
Preparing
Out for Delivery
Delivered
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
gi
```
