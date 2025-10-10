'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: string;
  calories: number;
}

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number; // This is the cart quantity (how many items)
  itemQuantity: string; // This is the item portion size (like "1 lb")
  calories: number;
}

const menuItems: MenuItem[] = [
  {
    id: 'caesar',
    name: 'Classic Korean Carrot Salad',
    description: 'Spicy, tangy shredded carrots with garlic and chili oil, a crisp and flavorful salad loved across Eastern Europe.',
    price: 9.99,
    image: "https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/carrot.jpg",
    category: 'classic',
    quantity: '1 lb',
    calories: 200
  },
  {
    id: 'greek',
    name: 'Cabbage & Cucumber Salad',
    description: 'Light and crunchy mix of shredded cabbage, fresh cucumber, and dill, tossed in a simple tangy dressing for a refreshing taste.',
    price: 9.99,
    image: 'https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/cabbage.jpg',
    category: 'classic',
    quantity: '1 lb',
    calories: 150
  },
  {
    id: 'Funchoza',
    name: 'Funchoza Salad',
    description: 'A colorful noodle salad with glass noodles, tender beef, fresh vegetables, and herbs tossed in a savory soy-garlic dressing. Light, flavorful, and full of texture.',
    price: 11.99,
    image: 'https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/funchoza.jpg',
    category: 'premium',
    quantity: '1 lb',
    calories: 350
  },
  {
    id: 'Samsa',
    name: 'Samsa',
    description: 'Flaky golden pastries filled with seasoned meat and onions, baked to perfection for a crisp outside and juicy, savory inside. A classic Central Asian favorite.',
    price: 9.99,
    image: 'https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/samsa.jpg',
    category: 'healthy',
    quantity: '5 pieces',
    calories: 450
  },
  // {
  //   id: 'test',
  //   name: '🧪 Test Payment Item',
  //   description: 'This is a test item for payment system testing. Perfect for verifying Stripe integration and email confirmations!',
  //   price: 0.50,
  //   image: '🧪',
  //   category: 'test',
  //   quantity: '1 test'
  // }
];

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    instructions: ''
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    address: false
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
      return [...prev, { 
        ...item, 
        quantity: 1,
        itemQuantity: item.quantity // Store the portion size separately
      }];
    });

    // Show notification
    setAddedItemName(item.name);
    setShowAddedNotification(true);
    setTimeout(() => {
      setShowAddedNotification(false);
    }, 2000);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
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
    const discount = paymentMethod === 'cash' ? subtotal * 0.05 : 0; // 5% discount for cash
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.08; // 8% tax on discounted amount
    return { subtotal, discount, tax, total: discountedSubtotal + tax };
  };

  const processPayment = async () => {
    // Reset errors
    setFormErrors({
      name: false,
      email: false,
      phone: false,
      address: false
    });

    // Validate customer information
    const errors = {
      name: !customerInfo.name.trim(),
      email: !customerInfo.email.trim(),
      phone: !customerInfo.phone.trim(),
      address: !customerInfo.address.trim()
    };

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerInfo.email.trim() && !emailRegex.test(customerInfo.email)) {
      errors.email = true;
    }

    // Check if any errors
    if (Object.values(errors).some(error => error)) {
      setFormErrors(errors);
      
      // Show specific error message
      if (errors.name) alert('Please enter your name');
      else if (errors.email) alert('Please enter a valid email address');
      else if (errors.phone) alert('Please enter your phone number');
      else if (errors.address) alert('Please enter your delivery address');
      
      return;
    }
    
    const { subtotal, discount, tax, total } = getTotalPrice();
    
    // Handle cash payment
    if (paymentMethod === 'cash') {
      try {
        const response = await fetch('/api/cash-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cart,
            customerInfo,
            subtotal,
            discount,
            tax,
            total
          }),
        });

        if (response.ok) {
          alert('Order received! We will contact you shortly to confirm. Total to pay in cash: $' + total.toFixed(2));
          setCart([]);
          setShowCheckout(false);
          setCustomerInfo({ name: '', email: '', phone: '', address: '', instructions: '' });
        } else {
          alert('Failed to submit order. Please try again.');
        }
      } catch (error) {
        console.error('Order failed:', error);
        alert('Failed to submit order. Please try again.');
      }
      return;
    }
    
    // Handle card payment
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
      {/* Added to Cart Notification */}
      {showAddedNotification && (
        <div className="added-notification">
          <i className="fas fa-check-circle"></i>
          <span>{addedItemName} added to cart!</span>
        </div>
      )}

      {/* Navigation */}
      <nav className={`navbar ${showCheckout ? 'hidden' : ''}`}>
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
            <div className="hero-delivery">
              <i className="fas fa-truck"></i>
              <span>Free Delivery in SC:<br></br> Spartanburg, Greer, Greenville, Inman, Lyman, Cowpens, Bouling Springs, Duncan, Union, Greenwood, Laurens, Moore</span>
            </div>
         
            <div className="hero-buttons">
              <a href="#menu" className="btn btn-primary">View Menu</a>
              <a href="#contact" className="btn btn-secondary">Contact Us</a>
            </div>
          </div>
          <div className="hero-image">
            <Image src="https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/hero-logo.png" alt="Hero Image" fill className="object-contain" />

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
                  {item.image.startsWith('http') ? (
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="text-6xl flex items-center justify-center h-24 w-full">
                      {item.image}
                    </div>
                  )}
                </div>
                <div className="menu-content">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="menu-info">
                    <div className="menu-quantity">
                      <i className="fas fa-weight-hanging"></i>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="menu-calories">
                      <i className="fas fa-fire"></i>
                      <span>{item.calories} cal</span>
                    </div>
                  </div>
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
        
            </div>
            <div className="about-image">
              <div className="chef-placeholder">
           <Image src="https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/IMG_0787.jpg" alt="Chef Image" fill className="object-cover" />
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
                <span>(319) 693-6570</span>
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
          <div className="cart-sidebar active">
            <div className="flex flex-col h-full">
              <div className="cart-header">
                <h3>Your Cart</h3>
                <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                  <i className="fas fa-times"></i>
                  <span className="close-label">Close</span>
                </button>
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
                        <div className="cart-item-info">
                          <div className="cart-item-name">{item.name}</div>
                          <div className="cart-item-price">${item.price.toFixed(2)} each</div>
                        </div>
                        <div className="cart-item-controls">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="quantity-btn"
                            disabled={item.quantity <= 1}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCheckout(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md my-8">
            <div className="max-h-[85vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Checkout</h3>
                  <button onClick={() => setShowCheckout(false)}>
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                <form className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name for the order"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2.5 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2.5 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2.5 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    required
                  />
                  <textarea
                    placeholder="Delivery Address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full px-3 py-2.5 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    rows={2}
                    required
                  />
                  <textarea
                    placeholder="Special Instructions (optional)"
                    value={customerInfo.instructions}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                  />

                  {/* Payment Method Selection */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold mb-2">Payment Method:</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-green-500 bg-green-50 font-semibold'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <i className="fas fa-credit-card mr-2"></i>
                        Pay by Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-green-500 bg-green-50 font-semibold'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <i className="fas fa-money-bill-wave mr-2"></i>
                        Pay Cash (5% off)
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${getTotalPrice().subtotal.toFixed(2)}</span>
                      </div>
                      {paymentMethod === 'cash' && getTotalPrice().discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Cash Discount (5%):</span>
                          <span>-${getTotalPrice().discount.toFixed(2)}</span>
                        </div>
                      )}
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
                      className="w-full bg-green-600 text-white py-3.5 text-base rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-semibold"
                    >
                      {paymentMethod === 'cash' ? (
                        <>
                          <span>💵</span>
                          <span>Place Order (Cash): ${getTotalPrice().total.toFixed(2)}</span>
                        </>
                      ) : (
                        <>
                          <span>💳</span>
                          <span>Pay by Card: ${getTotalPrice().total.toFixed(2)}</span>
                        </>
                      )}
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