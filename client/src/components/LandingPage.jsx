import { useState } from 'react'
import { 
  ArrowRight, 
  Clock, 
  Shield, 
  Truck, 
  Star, 
  CheckCircle,
  Sparkles,
  Zap,
  Heart
} from 'lucide-react'

export default function LandingPage({ onGetStarted }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Get your food delivered in 30 minutes or less',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure payment with multiple options',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'Free delivery on orders over $25',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Heart,
      title: 'Fresh Ingredients',
      description: 'Only the freshest ingredients in every dish',
      color: 'from-red-500 to-orange-500'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      text: 'Amazing food and super fast delivery! Best food delivery app I\'ve used.',
      image: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      rating: 5,
      text: 'The booking feature is so convenient. I love scheduling my meals in advance.',
      image: '👨‍💻'
    },
    {
      name: 'Emma Williams',
      rating: 5,
      text: 'Great variety and quality. The UI is beautiful and easy to use!',
      image: '👩‍🎨'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 opacity-90">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Premium Food Delivery</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
              Delicious Food
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                Delivered Fresh
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-light">
              Order your favorite meals, book delivery times, and track your order in real-time.
              Experience the future of food delivery.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="group btn-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                Order Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-black text-white mb-2">10K+</div>
                <div className="text-white/80 text-sm">Happy Customers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-black text-white mb-2">500+</div>
                <div className="text-white/80 text-sm">Dishes Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-black text-white mb-2">30min</div>
                <div className="text-white/80 text-sm">Avg Delivery Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Why Choose <span className="gradient-text">FoodDeliver</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine great food with amazing technology to deliver the best experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="glass-effect rounded-2xl p-8 card-hover cursor-pointer group"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your favorite food in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Browse & Order', desc: 'Explore our menu and add items to your cart' },
              { step: '02', title: 'Book Delivery', desc: 'Choose your preferred delivery date and time' },
              { step: '03', title: 'Track & Enjoy', desc: 'Track your order in real-time and enjoy your meal' }
            ].map((item, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-black shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              What Our <span className="gradient-text">Customers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="glass-effect rounded-2xl p-8 card-hover"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">Verified Customer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers and experience the best food delivery service
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  )
}
