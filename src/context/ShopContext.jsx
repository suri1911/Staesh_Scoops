import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsData } from '../data/products';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Load saved state from localStorage if available
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('staesh_cart');
    return saved ? JSON.parse(saved) : [
      { product: productsData[0], quantity: 1, selectedColor: '#2D2D2D', selectedSize: 'Standard' },
      { product: productsData[1], quantity: 2, selectedColor: '#000000', selectedSize: 'UK 9' }
    ];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('staesh_wishlist');
    return saved ? JSON.parse(saved) : [productsData[2].id, productsData[3].id];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('staesh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('staesh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message, icon = 'bi-check-circle-fill') => {
    setToast({ message, icon, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Cart Handlers
  const addToCart = (product, quantity = 1, color = null, size = null) => {
    const chosenColor = color || (product.colors && product.colors[0]) || '';
    const chosenSize = size || (product.sizes && product.sizes[0]) || '';

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product.id === product.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedColor: chosenColor, selectedSize: chosenSize }];
      }
    });

    showToast(`Added ${product.name} to Cart!`, 'bi-bag-check-fill');
  };

  const removeFromCart = (productId, color, size) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
    ));
    showToast('Item removed from cart.', 'bi-trash-fill');
  };

  const updateQuantity = (productId, color, size, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.product.id === productId && item.selectedColor === color && item.selectedSize === size) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartOriginalTotal = () => {
    return cart.reduce((total, item) => total + (item.product.originalPrice || item.product.price) * item.quantity, 0);
  };

  // Wishlist Handlers
  const toggleWishlist = (product) => {
    const isSaved = wishlist.includes(product.id);
    if (isSaved) {
      setWishlist(prev => prev.filter(id => id !== product.id));
      showToast(`Removed from Wishlist`, 'bi-heartbreak-fill');
    } else {
      setWishlist(prev => [...prev, product.id]);
      showToast(`Saved to Wishlist!`, 'bi-heart-fill');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <ShopContext.Provider
      value={{
        products: productsData,
        cart,
        wishlist,
        searchQuery,
        setSearchQuery,
        quickViewProduct,
        setQuickViewProduct,
        toast,
        showToast,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartSubtotal,
        getCartOriginalTotal,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
