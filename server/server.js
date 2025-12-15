import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration - allow specific origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'] // Default Vite dev ports

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())

// In-memory data storage (in production, use a database)
let users = [] // Simple user storage
let sessions = {} // Session storage (sessionId -> userData)
let favorites = {} // userId -> [itemIds]
let addresses = {} // userId -> [addresses]
let reviews = [] // Reviews for menu items
let promoCodes = {
  'WELCOME10': { discount: 10, type: 'percentage', minOrder: 0 },
  'SAVE20': { discount: 20, type: 'percentage', minOrder: 50 },
  'FREESHIP': { discount: 5, type: 'fixed', minOrder: 25 }
}

let orders = []
let orderStatus = {} // Track order stages

// Restaurants Data
let restaurants = [
  {
    id: 1,
    name: "Pizza Paradise",
    description: "Authentic Italian pizzas with the finest ingredients",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    rating: 4.8,
    deliveryTime: "25-30 min",
    minOrder: 15,
    cuisine: "Italian",
    address: "123 Main St, Downtown",
    phone: "+1 234-567-8900",
    openTime: "10:00",
    closeTime: "22:00",
    isOpen: true
  },
  {
    id: 2,
    name: "Burger Junction",
    description: "Gourmet burgers and American classics",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop",
    rating: 4.6,
    deliveryTime: "20-25 min",
    minOrder: 12,
    cuisine: "American",
    address: "456 Oak Ave, Midtown",
    phone: "+1 234-567-8901",
    openTime: "11:00",
    closeTime: "23:00",
    isOpen: true
  },
  {
    id: 3,
    name: "Asian Fusion",
    description: "Delicious Asian cuisine with modern twists",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    rating: 4.9,
    deliveryTime: "30-35 min",
    minOrder: 18,
    cuisine: "Asian",
    address: "789 Pine Rd, Uptown",
    phone: "+1 234-567-8902",
    openTime: "12:00",
    closeTime: "22:30",
    isOpen: true
  },
  {
    id: 4,
    name: "Sweet Treats Bakery",
    description: "Fresh desserts and baked goods daily",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop",
    rating: 4.7,
    deliveryTime: "15-20 min",
    minOrder: 10,
    cuisine: "Desserts",
    address: "321 Elm St, Downtown",
    phone: "+1 234-567-8903",
    openTime: "08:00",
    closeTime: "21:00",
    isOpen: true
  }
]

// Menu Items organized by restaurant
let menuItems = [
  // Pizza Paradise (Restaurant ID: 1)
  {
    id: 1,
    restaurantId: 1,
    name: "Margherita Pizza",
    description: "Classic delight with 100% real mozzarella cheese",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    category: "pizza",
    dietary: ["vegetarian"],
    isAvailable: true,
    toppings: ["Extra Cheese", "Mushrooms", "Olives", "Peppers"]
  },
  {
    id: 2,
    restaurantId: 1,
    name: "Pepperoni Pizza",
    description: "Classic pepperoni with mozzarella cheese",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    category: "pizza",
    dietary: [],
    isAvailable: true,
    toppings: ["Extra Cheese", "Pepperoni", "Mushrooms"]
  },
  {
    id: 3,
    restaurantId: 1,
    name: "Pasta Carbonara",
    description: "Creamy pasta with bacon and parmesan cheese",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
    category: "pizza",
    dietary: [],
    isAvailable: true,
    toppings: ["Extra Cheese", "Bacon", "Black Pepper"]
  },
  {
    id: 4,
    restaurantId: 1,
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with Caesar dressing",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop",
    category: "salad",
    dietary: [],
    isAvailable: true,
    toppings: ["Grilled Chicken", "Bacon Bits", "Croutons"]
  },
  // Burger Junction (Restaurant ID: 2)
  {
    id: 5,
    restaurantId: 2,
    name: "Veggie Burger",
    description: "Loaded with fresh veggies and cheese",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1525059696034-4967a729002e?w=600&h=400&fit=crop",
    category: "burger",
    dietary: ["vegetarian"],
    isAvailable: true,
    toppings: ["Lettuce", "Tomato", "Onions", "Pickles", "Jalapenos"]
  },
  {
    id: 6,
    restaurantId: 2,
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with cheese and special sauce",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    category: "burger",
    dietary: [],
    isAvailable: true,
    toppings: ["Lettuce", "Tomato", "Onions", "Pickles", "Cheese"]
  },
  {
    id: 7,
    restaurantId: 2,
    name: "Chicken Wings",
    description: "Crispy buffalo wings with blue cheese dip",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=400&fit=crop",
    category: "burger",
    dietary: [],
    isAvailable: true,
    toppings: ["Extra Spicy", "Ranch Dressing", "Celery Sticks"]
  },
  {
    id: 8,
    restaurantId: 2,
    name: "BBQ Bacon Burger",
    description: "Grilled beef with crispy bacon and BBQ sauce",
    price: 9.49,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
    category: "burger",
    dietary: [],
    isAvailable: true,
    toppings: ["Bacon", "Onion Rings", "BBQ Sauce", "Cheese"]
  },
  // Asian Fusion (Restaurant ID: 3)
  {
    id: 9,
    restaurantId: 3,
    name: "Chicken Biryani",
    description: "Spiced basmati rice with tender chicken pieces",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop",
    category: "asian",
    dietary: [],
    isAvailable: true,
    toppings: ["Extra Chicken", "Boiled Egg", "Raita"]
  },
  {
    id: 10,
    restaurantId: 3,
    name: "Sushi Platter",
    description: "Fresh salmon, tuna, and eel rolls with wasabi",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop",
    category: "asian",
    dietary: [],
    isAvailable: true,
    toppings: ["Extra Wasabi", "Ginger", "Soy Sauce"]
  },
  {
    id: 11,
    restaurantId: 3,
    name: "Pad Thai",
    description: "Stir-fried rice noodles with tamarind sauce",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop",
    category: "asian",
    dietary: [],
    isAvailable: true,
    toppings: ["Shrimp", "Tofu", "Peanuts", "Lime"]
  },
  {
    id: 12,
    restaurantId: 3,
    name: "Vegetable Fried Rice",
    description: "Wok-fried rice with fresh vegetables",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop",
    category: "asian",
    dietary: ["vegetarian", "vegan"],
    isAvailable: true,
    toppings: ["Extra Vegetables", "Soy Sauce"]
  },
  // Sweet Treats Bakery (Restaurant ID: 4)
  {
    id: 13,
    restaurantId: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop",
    category: "dessert",
    dietary: ["vegetarian"],
    isAvailable: true,
    toppings: ["Vanilla Ice Cream", "Whipped Cream", "Strawberries"]
  },
  {
    id: 14,
    restaurantId: 4,
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee and mascarpone",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop",
    category: "dessert",
    dietary: ["vegetarian"],
    isAvailable: true,
    toppings: ["Cocoa Powder", "Chocolate Shavings"]
  },
  {
    id: 15,
    restaurantId: 4,
    name: "New York Cheesecake",
    description: "Creamy cheesecake with graham cracker crust",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&h=400&fit=crop",
    category: "dessert",
    dietary: ["vegetarian"],
    isAvailable: true,
    toppings: ["Berry Compote", "Whipped Cream"]
  },
  {
    id: 16,
    restaurantId: 4,
    name: "Ice Cream Sundae",
    description: "Vanilla ice cream with chocolate sauce and toppings",
    price: 4.49,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop",
    category: "dessert",
    dietary: ["vegetarian"],
    isAvailable: true,
    toppings: ["Chocolate Sauce", "Caramel", "Nuts", "Cherry"]
  }
]

// Authentication Middleware (simple session-based)
const requireAuth = (req, res, next) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '')
  if (!sessionId || !sessions[sessionId]) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  req.user = sessions[sessionId]
  req.userId = req.user.id
  next()
}

// Routes

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' })
  }
  
  const user = {
    id: uuidv4(),
    name,
    email,
    password, // In production, hash this!
    phone: phone || '',
    createdAt: new Date().toISOString()
  }
  
  users.push(user)
  const sessionId = uuidv4()
  sessions[sessionId] = user
  
  res.json({ 
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    token: sessionId 
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const sessionId = uuidv4()
  sessions[sessionId] = user
  
  res.json({ 
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    token: sessionId 
  })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ 
    user: { id: req.user.id, name: req.user.name, email: req.user.email, phone: req.user.phone }
  })
})

app.post('/api/auth/logout', requireAuth, (req, res) => {
  delete sessions[req.headers.authorization?.replace('Bearer ', '')]
  res.json({ message: 'Logged out successfully' })
})

// Restaurant Routes
app.get('/api/restaurants', (req, res) => {
  res.json(restaurants)
})

app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === parseInt(req.params.id))
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }
  res.json(restaurant)
})

// Menu Routes
app.get('/api/menu', (req, res) => {
  const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId) : null
  let filteredItems = restaurantId 
    ? menuItems.filter(item => item.restaurantId === restaurantId)
    : menuItems
  
  // Include average ratings
  const menuWithRatings = filteredItems.map(item => {
    const itemReviews = reviews.filter(r => r.itemId === item.id)
    const avgRating = itemReviews.length > 0
      ? itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length
      : 0
    return {
      ...item,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: itemReviews.length
    }
  })
  res.json(menuWithRatings)
})

app.post('/api/menu/:id/review', requireAuth, (req, res) => {
  const { rating, comment } = req.body
  const itemId = parseInt(req.params.id)
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' })
  }
  
  const review = {
    id: uuidv4(),
    itemId,
    userId: req.userId,
    userName: req.user.name,
    rating: parseInt(rating),
    comment: comment || '',
    createdAt: new Date().toISOString()
  }
  
  reviews.push(review)
  res.json(review)
})

app.get('/api/menu/:id/reviews', (req, res) => {
  const itemId = parseInt(req.params.id)
  const itemReviews = reviews.filter(r => r.itemId === itemId)
  res.json(itemReviews)
})

// Favorites Routes
app.get('/api/favorites', requireAuth, (req, res) => {
  const userFavorites = favorites[req.userId] || []
  const favoriteItems = menuItems.filter(item => userFavorites.includes(item.id))
  res.json(favoriteItems)
})

app.post('/api/favorites/:itemId', requireAuth, (req, res) => {
  const itemId = parseInt(req.params.itemId)
  if (!favorites[req.userId]) {
    favorites[req.userId] = []
  }
  if (!favorites[req.userId].includes(itemId)) {
    favorites[req.userId].push(itemId)
  }
  res.json({ message: 'Added to favorites', favorites: favorites[req.userId] })
})

app.delete('/api/favorites/:itemId', requireAuth, (req, res) => {
  const itemId = parseInt(req.params.itemId)
  if (favorites[req.userId]) {
    favorites[req.userId] = favorites[req.userId].filter(id => id !== itemId)
  }
  res.json({ message: 'Removed from favorites', favorites: favorites[req.userId] || [] })
})

// Addresses Routes
app.get('/api/addresses', requireAuth, (req, res) => {
  res.json(addresses[req.userId] || [])
})

app.post('/api/addresses', requireAuth, (req, res) => {
  const { address, label } = req.body
  if (!address) {
    return res.status(400).json({ error: 'Address is required' })
  }
  
  if (!addresses[req.userId]) {
    addresses[req.userId] = []
  }
  
  const newAddress = {
    id: uuidv4(),
    address,
    label: label || 'Home',
    isDefault: addresses[req.userId].length === 0
  }
  
  addresses[req.userId].push(newAddress)
  res.json(newAddress)
})

app.delete('/api/addresses/:id', requireAuth, (req, res) => {
  if (addresses[req.userId]) {
    addresses[req.userId] = addresses[req.userId].filter(addr => addr.id !== req.params.id)
  }
  res.json({ message: 'Address deleted' })
})

// Promo Codes Routes
app.post('/api/promo/validate', (req, res) => {
  const { code, subtotal } = req.body
  const promo = promoCodes[code?.toUpperCase()]
  
  if (!promo) {
    return res.status(400).json({ error: 'Invalid promo code' })
  }
  
  if (subtotal < promo.minOrder) {
    return res.status(400).json({ 
      error: `Minimum order of $${promo.minOrder} required for this promo code` 
    })
  }
  
  const discount = promo.type === 'percentage' 
    ? (subtotal * promo.discount / 100)
    : promo.discount
  
  res.json({ 
    valid: true, 
    discount: discount.toFixed(2),
    code: code.toUpperCase(),
    type: promo.type
  })
})

// Order Routes

app.post('/api/orders', (req, res) => {
  const { items, total, name, phone, email, address, deliveryDate, deliveryTime, specialInstructions, promoCode, userId, restaurantId } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' })
  }

  // Validate required fields
  if (!name || !phone || !email || !address || !deliveryDate || !deliveryTime) {
    return res.status(400).json({ error: 'Missing required fields: name, phone, email, address, deliveryDate, and deliveryTime are required' })
  }

  // Ensure total is a number
  const totalAmount = typeof total === 'number' ? total : parseFloat(total)
  if (isNaN(totalAmount) || totalAmount <= 0) {
    return res.status(400).json({ error: 'Invalid order total' })
  }

  // Validate minimum order for restaurant
  if (restaurantId) {
    const restaurant = restaurants.find(r => r.id === parseInt(restaurantId))
    if (restaurant && totalAmount < restaurant.minOrder) {
      return res.status(400).json({ error: `Minimum order for ${restaurant.name} is $${restaurant.minOrder.toFixed(2)}.` })
    }
  }

  // Calculate discount if promo code provided
  let discount = 0
  if (promoCode) {
    const promo = promoCodes[promoCode.toUpperCase()]
    if (promo && totalAmount >= promo.minOrder) {
      discount = promo.type === 'percentage' 
        ? (totalAmount * promo.discount / 100)
        : promo.discount
    }
  }

  const finalTotal = totalAmount - discount

  const order = {
    id: uuidv4(),
    restaurantId: restaurantId || null,
    items,
    subtotal: totalAmount,
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(finalTotal.toFixed(2)), // Keep as number, not string
    name,
    phone,
    email,
    address,
    deliveryDate,
    deliveryTime,
    specialInstructions,
    promoCode: promoCode || null,
    userId: userId || null,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    stage: 1,
    canCancel: true
  }

  orders.push(order)
  orderStatus[order.id] = {
    stage: 1,
    estimatedTime: calculateEstimatedTime(deliveryDate, deliveryTime)
  }

  // Send order confirmation email (async, don't wait)
  sendOrderConfirmationEmail(order).catch(err => {
    console.error('Failed to send email:', err)
    // Don't fail the order if email fails
  })

  // Simulate order progression
  simulateOrderProgression(order.id)

  res.status(201).json(order)
})

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id)
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  const status = orderStatus[order.id] || { stage: 1 }
  
  res.json({
    ...order,
    stage: status.stage,
    estimatedTime: status.estimatedTime
  })
})

app.get('/api/orders', requireAuth, (req, res) => {
  // Return orders for the logged-in user
  const userOrders = orders.filter(o => o.userId === req.userId)
  res.json(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
})

app.post('/api/orders/:id/reorder', requireAuth, (req, res) => {
  const order = orders.find(o => o.id === req.params.id && o.userId === req.userId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  
  // Return order items for reordering
  res.json({ items: order.items, restaurantId: order.restaurantId })
})

app.post('/api/orders/:id/cancel', requireAuth, (req, res) => {
  const order = orders.find(o => o.id === req.params.id && o.userId === req.userId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  
  // Can only cancel if order is still in early stages
  if (order.stage >= 3 || order.status === 'delivered') {
    return res.status(400).json({ error: 'Order cannot be cancelled at this stage' })
  }
  
  order.status = 'cancelled'
  order.cancelledAt = new Date().toISOString()
  order.canCancel = false
  
  res.json({ message: 'Order cancelled successfully', order })
})

function calculateEstimatedTime(deliveryDate, deliveryTime) {
  const now = new Date()
  const delivery = new Date(`${deliveryDate}T${deliveryTime}`)
  const diffMs = delivery - now
  const diffMins = Math.max(Math.ceil(diffMs / 60000), 20)
  return `${diffMins} minutes`
}

function simulateOrderProgression(orderId) {
  // Start at stage 1 (confirmed), progress through stages
  const stages = [
    { stage: 2, delay: 8000, message: 'Order is now being prepared' },    // 8 seconds: Preparing
    { stage: 3, delay: 15000, message: 'Order is out for delivery' },     // 15 seconds: Out for delivery
    { stage: 4, delay: 20000, message: 'Order has been delivered' }       // 20 seconds: Delivered
  ]

  stages.forEach(({ stage: nextStage, delay, message }) => {
    setTimeout(() => {
      if (orderStatus[orderId]) {
        orderStatus[orderId].stage = nextStage
        orderStatus[orderId].lastUpdate = new Date().toISOString()
        
        // Update order in array
        const orderIndex = orders.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
          orders[orderIndex].stage = nextStage
          if (nextStage === 4) {
            orders[orderIndex].status = 'delivered'
          }
        }
        
        console.log(`📦 Order ${orderId.slice(0, 8)}: ${message}`)
      }
    }, delay)
  })
}

// Email notification function
// For demo: Logs email to console (configure SMTP in production)
async function sendOrderConfirmationEmail(order) {
  if (!order.email) {
    console.log('No email provided, skipping email notification')
    return
  }

  const restaurantName = order.restaurantId 
    ? restaurants.find(r => r.id === order.restaurantId)?.name || 'FoodDeliver'
    : 'FoodDeliver'

  const itemsList = order.items.map(item => 
    `  • ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n')

  // For demo: Log email (in production, use real SMTP)
  console.log('\n📧 ORDER CONFIRMATION EMAIL')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`To: ${order.email}`)
  console.log(`Subject: Order Confirmation #${order.id.slice(0, 8).toUpperCase()}`)
  console.log(`\nThank you for your order!\n`)
  console.log(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`)
  console.log(`Restaurant: ${restaurantName}`)
  console.log(`Date: ${new Date(order.createdAt).toLocaleString()}`)
  if (order.deliveryDate) {
    console.log(`Delivery: ${new Date(order.deliveryDate).toLocaleDateString()} at ${order.deliveryTime}`)
  }
  console.log(`\nItems:\n${itemsList}`)
  if (order.discount && parseFloat(order.discount) > 0) {
    console.log(`Discount: -$${parseFloat(order.discount).toFixed(2)}`)
  }
  console.log(`Total: $${parseFloat(order.total).toFixed(2)}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // In production, configure SMTP and uncomment:
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
  
  await transporter.sendMail({
    from: '"FoodDeliver" <noreply@fooddeliver.com>',
    to: order.email,
    subject: `Order Confirmation #${order.id.slice(0, 8).toUpperCase()}`,
    html: `...email HTML...`,
    text: `...email text...`
  })
  */

  return { success: true }
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📋 Menu API: http://localhost:${PORT}/api/menu`)
  console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`)
})
