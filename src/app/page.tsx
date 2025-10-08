'use client';

import { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const menuItems: MenuItem[] = [
  {
    id: 'caesar',
    name: 'Classic Caesar Salad',
    description: 'Fresh romaine lettuce, parmesan cheese, croutons, and our signature caesar dressing',
    price: 12.99,
    image: '🥗',
    category: 'classic'
  },
  {
    id: 'greek',
    name: 'Greek Garden Salad',
    description: 'Mixed greens, tomatoes, cucumbers, olives, feta cheese, and greek dressing',
    price: 13.99,
    image: '🥙',
    category: 'classic'
  },
  {
    id: 'cobb',
    name: 'Cobb Salad',
    description: 'Romaine lettuce, grilled chicken, bacon, avocado, blue cheese, and ranch dressing',
    price: 15.99,
    image: '🥗',
    category: 'premium'
  },
  {
    id: 'quinoa',
    name: 'Quinoa Power Bowl',
    description: 'Quinoa, kale, chickpeas, roasted vegetables, and tahini dressing',
    price: 14.99,
    image: '🥗',
    category: 'healthy'
  },
  {
    id: 'test',
    name: '🧪 Test Payment Item',
    description: 'This is a test item for payment system testing. Perfect for verifying Stripe integration!',
    price: 1.00,
    image: '🧪',
    category: 'test'
  }
];

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    instructions: ''
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle swipe to close cart on mobile
  const handleCartTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    e.currentTarget.setAttribute('data-touch-start', touchStartX.toString());
  };

  const handleCartTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchStartX = parseFloat(e.currentTarget.getAttribute('data-touch-start') || '0');
    const swipeDistance = touchEndX - touchStartX;
    
    // If swiped right more than 100px, close cart
    if (swipeDistance > 100) {
      setIsCartOpen(false);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const processPayment = async () => {
    const { subtotal, tax, total } = getTotalPrice();
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          customerInfo,
          subtotal,
          tax,
          total
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const showNotification = (message: string) => {
    alert(message);
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });

      if (response.ok) {
        showNotification('Message sent successfully! We\'ll get back to you soon.');
        (e.target as HTMLFormElement).reset();
      } else {
        showNotification('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Failed to send message. Please try again.');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };


  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <i className="fas fa-leaf"></i>
            <span>Mom&apos;s Fresh Salads</span>
          </div>
          <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <li><a href="#home">Home</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-actions">
            <button className="cart-toggle" onClick={() => setIsCartOpen(true)}>
              <i className="fas fa-shopping-cart"></i>
              <span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </button>
          </div>
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <div>
            <h1>Fresh, Healthy Salads Made with Love</h1>
            <p>Discover the perfect blend of crisp vegetables, premium ingredients, and homemade dressings crafted by mom&apos;s skilled hands.</p>
            <div className="hero-buttons">
              <a href="#menu" className="btn btn-primary">View Menu</a>
              <a href="#contact" className="btn btn-secondary">Contact Us</a>
            </div>
          </div>
          <div className="hero-image">
            <div className="salad-placeholder">
              <i className="fas fa-seedling"></i>
              <p>Fresh Salad Image</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="menu">
        <div className="container">
          <h2>Our Signature Salads</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div key={item.id} className={`menu-item ${item.id === 'test' ? 'test-item' : ''}`}>
                <div className="menu-image">
                  <i className="fas fa-image"></i>
                </div>
                <div className="menu-content">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="price">${item.price.toFixed(2)}</div>
                  <button
                    onClick={() => addToCart(item)}
                    className="btn btn-add-to-cart"
                  >
                    <i className="fas fa-plus"></i>
                    {item.id === 'test' ? 'Test Payment' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Mom&apos;s Kitchen</h2>
              <p>For over 20 years, Mom has been perfecting her salad recipes, combining traditional cooking methods with fresh, local ingredients. Each salad is prepared with the same care and attention that she would give to her own family.</p>
              <p>Our mission is to bring healthy, delicious meals to your table while supporting local farmers and suppliers. Every ingredient is carefully selected for quality, freshness, and nutritional value.</p>
            </div>
            <div className="about-image">
              <div className="chef-placeholder">
                <i className="fas fa-user-friends"></i>
                <p>Mom in the Kitchen</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Get in Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Contact Information</h3>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>(319))693-6570</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>yevhenii.lim27@gmail.com</span>
              </div>
            
              <div className="hours">
                <h4>Business Hours</h4>
                <p>Monday - Friday: 10:00 AM - 10:00 PM<br />
                Saturday: 9:00 AM - 6:00 PM<br />
                Sunday: Closed</p>
              </div>
            </div>
     
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 2500 }}>
          <div className="cart-overlay active" onClick={() => setIsCartOpen(false)} />
          <div 
            className="cart-sidebar active"
            onTouchStart={handleCartTouchStart}
            onTouchEnd={handleCartTouchEnd}
          >
            <div className="flex flex-col h-full">
              <div className="cart-header">
                <h3>Your Cart</h3>
                <div className="cart-header-actions">
                  <div className="swipe-hint">← Swipe to close</div>
                  <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                    <i className="fas fa-times"></i>
                    <span className="close-label">Close</span>
                  </button>
                </div>
              </div>
              
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <i className="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="#menu" className="btn btn-primary" onClick={() => setIsCartOpen(false)}>Browse Menu</a>
                  </div>
                ) : (
                  <div>
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div className="text-2xl">{item.image}</div>
                        <div className="cart-item-info">
                          <div className="cart-item-name">{item.name}</div>
                          <div className="cart-item-price">${item.price.toFixed(2)} each</div>
                        </div>
                        <div className="cart-item-controls">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <span className="cart-item-quantity">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="remove-item"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-total">
                    <div className="total-line">
                      <span>Subtotal:</span>
                      <span>${getTotalPrice().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="total-line">
                      <span>Tax (8%):</span>
                      <span>${getTotalPrice().tax.toFixed(2)}</span>
                    </div>
                    <div className="total-line total-final">
                      <span>Total:</span>
                      <span>${getTotalPrice().total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    className="btn-checkout"
                    onClick={() => {
                      setIsCartOpen(false);
                      setShowCheckout(true);
                    }}
                  >
                    <i className="fas fa-credit-card"></i>
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCheckout(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Checkout</h3>
                  <button onClick={() => setShowCheckout(false)}>
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <textarea
                    placeholder="Delivery Address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                  <textarea
                    placeholder="Special Instructions (optional)"
                    value={customerInfo.instructions}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                  />
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${getTotalPrice().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${getTotalPrice().tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${getTotalPrice().total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={processPayment}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>💳</span>
                      <span>Pay ${getTotalPrice().total.toFixed(2)}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <i className="fas fa-leaf"></i>
              <span>Mom&apos;s Fresh Salads</span>
            </div>
            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#menu">Menu</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
          
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Mom&apos;s Fresh Salads. Made with ❤️ for healthy living.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}