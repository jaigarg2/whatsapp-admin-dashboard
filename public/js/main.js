// Check if user is logged in
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
  }
  
  // Redirect if not authenticated
  function checkAuth() {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }
  
  // Format date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Format currency
  function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
  
  // Get auth header
  function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  
  // Perform API request
  async function apiRequest(url, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: getAuthHeader()
      };
  
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
  
      const response = await fetch(url, options);
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }
  
      return result;
    } catch (error) {
      console.error('API Error:', error);
      showAlert(error.message, 'danger');
      return null;
    }
  }
  
  // Show alert message
  function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  
    // Find alert container or fallback to top of content
    const alertContainer = document.querySelector('.alert-container') || document.querySelector('#content');
    if (alertContainer) {
      alertContainer.prepend(alertDiv);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
      }, 5000);
    }
  }
  
  // Document ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on restricted pages
    if (!window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register')) {
      checkAuth();
    }
  });