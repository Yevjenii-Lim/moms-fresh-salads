'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: string;
  calories: number;
}

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number; // This is the cart quantity (how many items)
  itemQuantity: string; // This is the item portion size (like "1 lb")
  calories: number;
}

// Fallback menu data in case API fails
const fallbackMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Classic Korean Carrot Salad',
    description: 'Spicy, tangy shredded carrots with garlic and chili oil, a crisp and flavorful salad loved across Eastern Europe.',
    price: 9.99,
    image: "https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/carrot.jpg",
    category: 'classic',
    quantity: '1 lb',
    calories: 200
  },
  {
    id: 2,
    name: 'Cabbage & Cucumber Salad',
    description: 'Light and crunchy mix of shredded cabbage, fresh cucumber, and dill, tossed in a simple tangy dressing for a refreshing taste.',
    price: 9.99,
    image: 'https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/cabbage.jpg',
    category: 'classic',
    quantity: '1 lb',
    calories: 150
  },
  {
    id: 3,
    name: 'Funchoza Salad',
    description: 'A colorful noodle salad with glass noodles, tender beef, fresh vegetables, and herbs tossed in a savory soy-garlic dressing. Light, flavorful, and full of texture.',
    price: 11.99,
    image: 'https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/funchoza.jpg',
    category: 'premium',
    quantity: '1 lb',
    calories: 350
  },
  {
    id: 4,
    name: 'Samsa',
    description: 'Flaky golden pastries filled with seasoned meat and onions, baked to perfection for a crisp outside and juicy, savory inside. A classic Central Asian favorite.',
    price: 9.99,
    image: 'https://eurasianbowl.s3.us-east-1.amazonaws.com/salads/samsa.jpg',
    category: 'healthy',
    quantity: '5 pieces',
    calories: 450
  }
];

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackMenuItems);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    // Don't clear localStorage when cart is empty - let other pages handle clearing
  }, [cart]);

  // Fetch menu items from DynamoDB on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        console.log('🍽️ Fetching menu items from API...');
        const response = await fetch('/api/menu');
        const data = await response.json();
        
        if (response.ok && data.items) {
          console.log(`✅ Loaded ${data.items.length} menu items from DynamoDB`);
          setMenuItems(data.items);
        } else {
          console.warn('⚠️ Failed to fetch menu items, using fallback data');
          setMenuItems(fallbackMenuItems);
        }
      } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        console.log('🔄 Using fallback menu data');
        setMenuItems(fallbackMenuItems);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

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

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
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

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };


  const showNotification = (message: string) => {
    alert(message);
  };



  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            <div className="hero-delivery">
              <i className="fas fa-truck"></i>
              <span>Free Delivery in SC:<br></br> Spartanburg, Greer, Greenville, Inman, Lyman, Cowpens, Boiling Springs, Duncan, Union, Greenwood, Laurens, Moore</span>
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
            {menuLoading ? (
              <div className="loading-message">
                <p>Loading fresh menu items...</p>
              </div>
            ) : (
              menuItems.map((item) => (
              <div key={item.id} className={`menu-item ${item.id === 1000 ? 'test-item' : ''}`}>
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
                    {item.id === 1000 ? 'Test Payment' : 'Add to Cart'}
                  </button>
                </div>
              </div>
              ))
            )}
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
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="total-line total-final">
                      <span>Total:</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    className="btn-checkout"
                    onClick={() => {
                      setIsCartOpen(false);
                      window.location.href = '/checkout';
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