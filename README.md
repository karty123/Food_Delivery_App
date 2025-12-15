# FoodDeliver - Modern Food Ordering & Booking Platform

A full-stack food delivery and booking application built with React, Node.js, and Express.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Menu Browsing**: Search and filter through delicious menu items
- **Shopping Cart**: Add items with custom quantities and toppings
- **Order & Booking**: Place orders with delivery date/time booking
- **Real-time Tracking**: Track your order status in real-time
- **RESTful API**: Complete backend API for orders and menu management

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique ID generation

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup Instructions

1. **Install all dependencies:**
```bash
npm run install:all
```

Or manually:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

2. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:5000

### Run Separately

**Frontend only:**
```bash
npm run dev:client
```

**Backend only:**
```bash
npm run dev:server
```

## 📁 Project Structure

```
food-delivery/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Header.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── OrderTracking.jsx
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Express backend
│   ├── server.js          # Main server file
│   └── package.json
│
├── package.json           # Root package.json
└── README.md
```

## 🎯 Usage

1. **Browse Menu**: View available dishes and search for specific items
2. **Add to Cart**: Select quantity and toppings, then add items to cart
3. **Checkout**: Fill in delivery information and book a delivery time
4. **Track Order**: Monitor your order progress through different stages:
   - Order Confirmed
   - Preparing
   - Out for Delivery
   - Delivered

## 🔌 API Endpoints

### Menu
- `GET /api/menu` - Get all menu items

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order details and status
- `GET /api/orders` - Get all orders

## 🎨 Customization

### Adding Menu Items
Edit `server/server.js` and add items to the `menuItems` array.

### Styling
Modify Tailwind classes in components or update `tailwind.config.js` for theme customization.

## 📝 Notes

- Orders are stored in memory (restarting the server clears orders)
- For production, integrate a database (MongoDB, PostgreSQL, etc.)
- Add authentication for user accounts
- Implement payment gateway integration
- Add email/SMS notifications

## 🤝 Contributing

Feel free to fork, modify, and use this project for your needs!

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.
