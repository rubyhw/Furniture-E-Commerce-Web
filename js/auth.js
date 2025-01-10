// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if username already exists
    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
        return;
    }

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        alert('Email already exists!');
        return;
    }

    // Create new user
    const newUser = {
        username,
        email,
        password // In a real app, never store passwords in plain text
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Set current user
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Redirect to products page
    window.location.href = 'products.html';
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'products.html';
    } else {
        alert('Invalid email or password!');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Update navigation based on auth state
function updateNavigation() {
    const cartLink = document.querySelector('nav a[href="cart.html"]').parentElement;
    const loginLink = document.querySelector('nav a[href="login.html"]');
    
    if (isLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        cartLink.style.display = 'block';
        loginLink.textContent = `Logout (${user.username})`;
        loginLink.href = '#';
        loginLink.onclick = handleLogout;
    } else {
        cartLink.style.display = 'none';
        loginLink.textContent = 'Login';
        loginLink.href = 'login.html';
        loginLink.onclick = null;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    
    // Handle signup form
    const signupForm = document.querySelector('.auth-form');
    if (signupForm && window.location.pathname.includes('signup.html')) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Handle login form
    if (signupForm && window.location.pathname.includes('login.html')) {
        signupForm.addEventListener('submit', handleLogin);
    }
    
    // Redirect from cart if not logged in
    if (window.location.pathname.includes('cart.html') && !isLoggedIn()) {
        window.location.href = 'login.html';
    }
});
