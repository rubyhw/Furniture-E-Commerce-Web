package com.furniture.web.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static Map<String, User> usersByEmail = new HashMap<>();
    private static Map<String, User> usersByUsername = new HashMap<>();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String action = request.getParameter("action");
        
        if ("signup".equals(action)) {
            handleSignup(request, response);
        } else if ("login".equals(action)) {
            handleLogin(request, response);
        }
    }

    private void handleSignup(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        // Check if username or email already exists
        if (usersByUsername.containsKey(username)) {
            response.sendRedirect("signup.html?error=username_exists");
            return;
        }
        if (usersByEmail.containsKey(email)) {
            response.sendRedirect("signup.html?error=email_exists");
            return;
        }

        // Create new user
        User newUser = new User(username, email, password);
        usersByEmail.put(email, newUser);
        usersByUsername.put(username, newUser);
        
        // Create session
        HttpSession session = request.getSession();
        session.setAttribute("user", newUser);
        session.setAttribute("username", username);
        
        response.sendRedirect("products.html");
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        User user = usersByEmail.get(email);
        if (user != null && user.getPassword().equals(password)) {
            HttpSession session = request.getSession();
            session.setAttribute("user", user);
            session.setAttribute("username", user.getUsername());
            response.sendRedirect("products.html");
        } else {
            response.sendRedirect("login.html?error=invalid");
        }
    }
}

class User {
    private String username;
    private String email;
    private String password;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
}
