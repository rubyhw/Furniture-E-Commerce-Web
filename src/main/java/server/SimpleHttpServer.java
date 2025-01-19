package main.java.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.Headers;

import main.java.server.SimpleHttpServer.LoginHandler;
import main.java.server.SimpleHttpServer.SignUpHandler;
import main.java.server.SimpleHttpServer.ProductHandler;
import main.java.server.SimpleHttpServer.CheckoutHandler;
import main.java.server.SimpleHttpServer.StaticFileHandler;
import main.java.server.SimpleHttpServer.StockHandler;
import main.java.server.SimpleHttpServer.ManageProductsHandler;
import main.java.server.SimpleHttpServer.OrderHandler;
import main.java.server.SimpleHttpServer.OrderManagementHandler;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.json.JSONObject;
import org.json.JSONArray;

/**
 * Simple HTTP server that handles requests for the e-commerce application.
 */
public class SimpleHttpServer {
    private HttpServer server;

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/api/login", new LoginHandler());
        server.createContext("/api/signup", new SignUpHandler());
        server.createContext("/api/products", new ProductHandler());
        server.createContext("/api/stock", new StockHandler());
        server.createContext("/api/checkout", new CheckoutHandler());
        server.createContext("/api/manage-products", new ManageProductsHandler());
        server.createContext("/api/order", new OrderHandler());
        server.createContext("/api/order-management", new OrderManagementHandler());
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Server started successfully! Access the website at http://localhost:8080");
    }

    static class LoginHandler implements HttpHandler{
        @Override
        public void handle(HttpExchange exchange) throws IOException{
            System.out.println("LoginHandler: Request received"); // Verbose logging
            
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    // Read request body
                    InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    BufferedReader br = new BufferedReader(isr);
                    StringBuilder requestBody = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        requestBody.append(line);
                    }

                    // Get email and password from request body
                    String body = requestBody.toString().trim();
                    System.out.println("LoginHandler: Raw request body: " + body); // Verbose logging

                    // Parse JSON body
                    JSONObject jsonBody;
                    try {
                        jsonBody = new JSONObject(body);
                    } catch (Exception e) {
                        System.err.println("LoginHandler: JSON parsing error: " + e.getMessage());
                        sendErrorResponse(exchange, 400, "Invalid request body");
                        return;
                    }

                    // Extract email and password
                    String email = jsonBody.optString("email");
                    String password = jsonBody.optString("password");

                    System.out.println("LoginHandler: Attempting login for email: " + email); // Verbose logging

                    if (email.isEmpty() || password.isEmpty()) {
                        System.err.println("LoginHandler: Missing email or password"); // Verbose logging
                        sendErrorResponse(exchange, 400, "Email and password are required");
                        return;
                    }

                    String currentDir = System.getProperty("user.dir");
                    String csvPath = currentDir + "/data/users.csv";
                    File csvFile = new File(csvPath);

                    if (!csvFile.exists() || !csvFile.canRead()) {
                        System.err.println("LoginHandler: Cannot access CSV file at: " + csvPath);
                        sendErrorResponse(exchange, 500, "Server configuration error");
                        return;
                    }

                    try (Scanner reader = new Scanner(csvFile)) {
                        while (reader.hasNextLine()) {
                            String record = reader.nextLine();
                            String[] userInformation = record.split(",");
                            
                            // Ensure we have enough fields
                            if (userInformation.length < 5) {
                                continue;
                            }

                            // Trim and compare email and password
                            if (userInformation[1].trim().equals(email.trim()) && 
                                userInformation[3].trim().equals(password.trim())) {
                                
                                JSONObject userResponse = new JSONObject();
                                userResponse.put("id", userInformation[0]);
                                userResponse.put("email", userInformation[1]);
                                userResponse.put("name", userInformation[2]);
                                userResponse.put("admin", userInformation[4]);

                                System.out.println("LoginHandler: User authenticated successfully: " + email); // Verbose logging

                                // Send successful response
                                String userCredentials = userResponse.toString();
                                exchange.getResponseHeaders().set("Content-Type", "application/json");
                                byte[] responseBytes = userCredentials.getBytes("UTF-8");
                                exchange.sendResponseHeaders(200, responseBytes.length);
                                try (OutputStream os = exchange.getResponseBody()) {
                                    os.write(responseBytes);
                                }
                                return;
                            }
                        }
                    } catch (FileNotFoundException err) {
                        System.err.println("LoginHandler: Scanner failed to read users file");
                        sendErrorResponse(exchange, 500, "Internal server error");
                        return;
                    }

                    // If no user found
                    System.err.println("LoginHandler: Invalid credentials for email: " + email); // Verbose logging
                    sendErrorResponse(exchange, 400, "Invalid email or password");

                } else {
                    System.err.println("LoginHandler: Method not allowed"); // Verbose logging
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } catch (Exception e) {
                System.err.println("LoginHandler: Unexpected error: " + e.getMessage());
                e.printStackTrace();
                sendErrorResponse(exchange, 500, "Unexpected server error");
            }
        }

        // Helper method to send error responses
        private void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
            JSONObject errorResponse = new JSONObject();
            errorResponse.put("error", message);

            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            
            byte[] responseBytes = errorResponse.toString().getBytes("UTF-8");
            exchange.sendResponseHeaders(statusCode, responseBytes.length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(responseBytes);
            }
        }
    }

    static class SignUpHandler implements HttpHandler{
        @Override
        public void handle(HttpExchange exchange) throws IOException{
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try{
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    // Read request body
                    InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    BufferedReader br = new BufferedReader(isr);
                    StringBuilder requestBody = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        requestBody.append(line);
                    }

                    // Get email, pw and name from json
                    String body = requestBody.toString().trim();
                    System.out.println(body);
                    body = body.substring(1, body.length()-1);
                    String[] parts = body.split(",");
                    String email = parts[0].split(":")[1];
                    String password = parts[1].split(":")[1];
                    String name = parts[2].split(":")[1];
                    email = email.substring(1, email.length()-1);
                    password = password.substring(1, password.length()-1);
                    name = name.substring(1, name.length()-1);

                    // Regular expression to match valid email formats
                    String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@" +
                    "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
                    // Compile the regex
                    Pattern p = Pattern.compile(emailRegex);
                    // Check if email format is invalid
                    if(!p.matcher(email).matches()){
                        throw new Exception("Email format is invalid");
                    }

                    String currentDir = System.getProperty("user.dir");
                    String csvPath = currentDir + "/data/users.csv";
                    File csvFile = new File(csvPath);
                    if (!csvFile.exists() || !csvFile.canRead()) {
                        throw new IOException("Cannot access CSV file at: " + csvPath);
                    }

                    // Check if there is conflicting email
                    List<String> lines = Files.readAllLines(csvFile.toPath());
                    for(int i = 0; i < lines.size(); i++){
                        String[] record = lines.get(i).split(",");
                        if(record[1].equals(email))
                            throw new Exception("Email already has an account");
                    }

                    FileWriter fw = new FileWriter(csvFile, true);
                    String newRecord = "\n" + Integer.toString(lines.size()+1) + "," + email + "," + name + "," + password + "," + "FALSE";
                    fw.append(newRecord);
                    fw.close();
                    exchange.sendResponseHeaders(204, -1);
                } else{
                    throw new IOException("Method not allowed");
                }
            }catch(Exception e){
                String response = "{\"error\":\"" + e.getMessage() + "\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                byte[] responseBytes = response.getBytes("UTF-8");
                exchange.sendResponseHeaders(500, responseBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(responseBytes);
                }
            }

        }
    }

    static class ProductHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                String currentDir = System.getProperty("user.dir");
                String csvPath = currentDir + "/data/products.csv";
                File csvFile = new File(csvPath);
                
                if (!csvFile.exists() || !csvFile.canRead()) {
                    throw new IOException("Cannot access CSV file at: " + csvPath);
                }
                
                List<String> lines = Files.readAllLines(csvFile.toPath());
                if (lines.isEmpty()) {
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                    String emptyResponse = "{\"products\":[]}";
                    byte[] responseBytes = emptyResponse.getBytes("UTF-8");
                    exchange.sendResponseHeaders(200, responseBytes.length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(responseBytes);
                    }
                    return;
                }
                
                StringBuilder jsonBuilder = new StringBuilder();
                jsonBuilder.append("{\"products\":[");
                
                String[] headers = lines.get(0).split(",");
                for (int i = 1; i < lines.size(); i++) {
                    if (i > 1) jsonBuilder.append(",");
                    String[] values = lines.get(i).split(",");
                    jsonBuilder.append("{");
                    for (int j = 0; j < headers.length && j < values.length; j++) {
                        if (j > 0) jsonBuilder.append(",");
                        String header = headers[j].trim();
                        String value = values[j].trim();
                        jsonBuilder.append("\"").append(header).append("\":");
                        if (header.equals("id") || header.equals("price") || header.equals("stock_count")) {
                            jsonBuilder.append(value);
                        } else {
                            jsonBuilder.append("\"").append(value).append("\"");
                        }
                    }
                    jsonBuilder.append("}");
                }
                jsonBuilder.append("]}");
                
                String response = jsonBuilder.toString();
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                byte[] responseBytes = response.getBytes("UTF-8");
                exchange.sendResponseHeaders(200, responseBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(responseBytes);
                }
            } catch (IOException e) {
                e.printStackTrace();
                String response = "{\"error\":\"" + e.getMessage() + "\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                byte[] responseBytes = response.getBytes("UTF-8");
                exchange.sendResponseHeaders(500, responseBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(responseBytes);
                }
            }
        }
    }

    static class StockHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Set CORS headers for all responses
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
            
            // Handle preflight requests
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                String currentDir = System.getProperty("user.dir");
                String csvPath = currentDir + "/data/products.csv";
                File csvFile = new File(csvPath);
                
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    // Read request body
                    InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    BufferedReader br = new BufferedReader(isr);
                    StringBuilder requestBody = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        requestBody.append(line);
                    }

                    // Parse productId and quantity
                    String[] parts = requestBody.toString().split("&");
                    int productId = -1;
                    int quantity = 0;
                    for (String part : parts) {
                        String[] keyValue = part.split("=");
                        if (keyValue.length == 2) {
                            if (keyValue[0].equals("productId")) {
                                productId = Integer.parseInt(keyValue[1]);
                            } else if (keyValue[0].equals("quantity")) {
                                quantity = Integer.parseInt(keyValue[1]);
                            }
                        }
                    }
                    
                    if (productId == -1 || quantity <= 0) {
                        throw new IOException("Invalid product ID or quantity");
                    }
                    
                    // Read and update CSV file
                    List<String> lines = Files.readAllLines(csvFile.toPath());
                    if (lines.size() <= productId) {
                        throw new IOException("Product not found");
                    }
                    
                    String[] headers = lines.get(0).split(",");
                    int stockIndex = -1;
                    for (int i = 0; i < headers.length; i++) {
                        if (headers[i].trim().equals("stock_count")) {
                            stockIndex = i;
                            break;
                        }
                    }
                    
                    if (stockIndex == -1) {
                        throw new IOException("Stock count column not found");
                    }
                    
                    // Find and update the product
                    boolean found = false;
                    for (int i = 1; i < lines.size(); i++) {
                        String[] values = lines.get(i).split(",");
                        if (Integer.parseInt(values[0].trim()) == productId) {
                            int currentStock = Integer.parseInt(values[stockIndex].trim());
                            if (currentStock < quantity) {
                                String response = "{\"error\":\"Not enough stock\",\"available\":" + currentStock + "}";
                                exchange.getResponseHeaders().set("Content-Type", "application/json");
                                byte[] responseBytes = response.getBytes("UTF-8");
                                exchange.sendResponseHeaders(400, responseBytes.length);
                                try (OutputStream os = exchange.getResponseBody()) {
                                    os.write(responseBytes);
                                }
                                return;
                            }
                            
                            // Update stock
                            values[stockIndex] = String.valueOf(currentStock - quantity);
                            lines.set(i, String.join(",", values));
                            found = true;
                            break;
                        }
                    }
                    
                    if (!found) {
                        throw new IOException("Product not found");
                    }
                    
                    // Write updated content back to file
                    Files.write(csvFile.toPath(), lines);
                    
                    String response = "{\"success\":true}";
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    byte[] responseBytes = response.getBytes("UTF-8");
                    exchange.sendResponseHeaders(200, responseBytes.length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(responseBytes);
                    }
                } else {
                    throw new IOException("Method not allowed");
                }
            } catch (IOException e) {
                e.printStackTrace();
                String response = "{\"error\":\"" + e.getMessage() + "\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                byte[] responseBytes = response.getBytes("UTF-8");
                exchange.sendResponseHeaders(500, responseBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(responseBytes);
                }
            }
        }
    }

    static class CheckoutHandler implements HttpHandler{
        @Override
        public void handle(HttpExchange exchange) throws IOException{
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try{
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    BufferedReader br = new BufferedReader(isr);
                    StringBuilder requestBody = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        requestBody.append(line);
                    }

                    // Seperate json string into attributes
                    String body = requestBody.toString().trim();
                    body = body.substring(1, body.length()-1);
                    String[] parts = body.split(",\"");
                    String userId = parts[0].split(":")[1];
                    String productIDs = parts[1].split(":")[1];
                    String total = parts[2].split(":")[1];
                    productIDs = productIDs.substring(1, productIDs.length()-1);
                    String[] productId = productIDs.split(",");
                    userId = userId.substring(1, userId.length()-1);

                    // Find the quantity of repeated products
                    Map<String, Integer> frequency = new HashMap<>();
                    for (String str : productId) {
                        // getOrDefault returns the current count or 0 if the string isn't in the map
                        frequency.put(str, frequency.getOrDefault(str, 0) + 1);
                    }

                    // Read all of orders.csv to find next order ID
                    String currentDir = System.getProperty("user.dir");
                    String csvPath = currentDir + "/data/orders.csv";
                    File csvFile = new File(csvPath);
                    if (!csvFile.exists() || !csvFile.canRead()) {
                        throw new IOException("Cannot access CSV file at: " + csvPath);
                    }
                    List<String> orders = Files.readAllLines(csvFile.toPath());

                    // Update product stock counts
                    String productsPath = currentDir + "/data/products.csv";
                    File productsFile = new File(productsPath);
                    List<String> products = Files.readAllLines(productsFile.toPath());
                    List<String> updatedProducts = new ArrayList<>();
                    
                    // Add header
                    updatedProducts.add(products.get(0));
                    
                    // Update stock counts
                    for (int i = 1; i < products.size(); i++) {
                        String[] productData = products.get(i).split(",");
                        String prodId = productData[0];
                        if (frequency.containsKey(prodId)) {
                            int currentStock = Integer.parseInt(productData[5]);
                            int orderQuantity = frequency.get(prodId);
                            if (currentStock < orderQuantity) {
                                throw new IOException("Insufficient stock for product ID: " + prodId);
                            }
                            productData[5] = String.valueOf(currentStock - orderQuantity);
                        }
                        updatedProducts.add(String.join(",", productData));
                    }
                    
                    // Write updated products back to file
                    Files.write(productsFile.toPath(), updatedProducts);

                    FileWriter fw = new FileWriter(csvFile, true);
                    LocalDate orderDate = LocalDate.now();
                    String status = "Processing";
                    // Insert into orders.csv: orderId, userId, date, total, status, productId*, corresponding quantity*
                    // *productId & corresponding quantity is repeated as many times as needed
                    String newRecord = Integer.toString(orders.size()+1) + "," + userId + "," + orderDate + "," + total + "," + status + ",";
                    for(String id : frequency.keySet()){
                        newRecord = newRecord + id + "," + frequency.get(id) + ","; 
                    }
                    newRecord = newRecord.substring(0, newRecord.length() - 1);
                    newRecord = newRecord + "\n";
                    System.out.println(newRecord);
                    fw.append(newRecord);
                    fw.close();
                    exchange.sendResponseHeaders(204, -1);
                }
            } catch(Exception e){
                e.printStackTrace();
                String response = "{\"error\":\"" + e.getMessage() + "\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                byte[] responseBytes = response.getBytes("UTF-8");
                exchange.sendResponseHeaders(500, responseBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(responseBytes);
                }
            }
        }
    }

    static class ManageProductsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                String currentDir = System.getProperty("user.dir");
                String csvPath = currentDir + "/data/products.csv";
                File csvFile = new File(csvPath);
                
                if (!csvFile.exists() || !csvFile.canRead()) {
                    throw new IOException("Cannot access CSV file at: " + csvPath);
                }

                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    // Add new product
                    InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    BufferedReader br = new BufferedReader(isr);
                    StringBuilder requestBody = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        requestBody.append(line);
                    }

                    // Parse product data
                    String body = requestBody.toString().trim();
                    body = body.substring(1, body.length()-1);
                    String[] parts = body.split(",\"");
                    
                    // Extract product details
                    String name = parts[0].split(":")[1].replaceAll("\"", "");
                    String price = parts[1].split(":")[1].replaceAll("\"", "");
                    String description = parts[2].split(":")[1].replaceAll("\"", "");
                    String category = parts[3].split(":")[1].replaceAll("\"", "");
                    String stockCount = parts[4].split(":")[1].replaceAll("\"", "");
                    String imageUrl = parts[5].split(":")[1].replaceAll("\"", "");

                    // Read existing products to get next ID
                    List<String> lines = Files.readAllLines(csvFile.toPath());
                    int nextId = lines.size(); // Since header is at index 0

                    // Add new product
                    String newProduct = String.format("\n%d,%s,%s,%s,%s,%s,%s",
                        nextId, name, price, description, category, stockCount, imageUrl);
                    
                    FileWriter fw = new FileWriter(csvFile, true);
                    fw.append(newProduct);
                    fw.close();

                    exchange.sendResponseHeaders(204, -1);

                } else if (exchange.getRequestMethod().equalsIgnoreCase("PUT")) {
                    // Update existing product
                    InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    BufferedReader br = new BufferedReader(isr);
                    StringBuilder requestBody = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        requestBody.append(line);
                    }

                    // Parse product data
                    String body = requestBody.toString().trim();
                    body = body.substring(1, body.length()-1);
                    String[] parts = body.split(",\"");
                    
                    // Extract product details
                    String id = parts[0].split(":")[1].replaceAll("\"", "");
                    String name = parts[1].split(":")[1].replaceAll("\"", "");
                    String price = parts[2].split(":")[1].replaceAll("\"", "");
                    String description = parts[3].split(":")[1].replaceAll("\"", "");
                    String category = parts[4].split(":")[1].replaceAll("\"", "");
                    String stockCount = parts[5].split(":")[1].replaceAll("\"", "");
                    String imageUrl = parts[6].split(":")[1].replaceAll("\"", "");

                    // Read and update file
                    List<String> lines = Files.readAllLines(csvFile.toPath());
                    List<String> updatedLines = new ArrayList<>();
                    updatedLines.add(lines.get(0)); // Add header

                    boolean found = false;
                    for (int i = 1; i < lines.size(); i++) {
                        String[] values = lines.get(i).split(",");
                        if (values[0].equals(id)) {
                            // Update product
                            String updatedProduct = String.format("%s,%s,%s,%s,%s,%s,%s",
                                id, name, price, description, category, stockCount, imageUrl);
                            updatedLines.add(updatedProduct);
                            found = true;
                        } else {
                            updatedLines.add(lines.get(i));
                        }
                    }

                    if (!found) {
                        throw new IOException("Product not found");
                    }

                    // Write updated content back to file
                    Files.write(csvFile.toPath(), updatedLines);
                    
                    exchange.sendResponseHeaders(204, -1);

                } else if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
                    // Delete product
                    String productId = exchange.getRequestURI().getQuery().split("=")[1];

                    // Read and update file
                    List<String> lines = Files.readAllLines(csvFile.toPath());
                    List<String> updatedLines = new ArrayList<>();
                    updatedLines.add(lines.get(0)); // Add header

                    boolean found = false;
                    for (int i = 1; i < lines.size(); i++) {
                        String[] values = lines.get(i).split(",");
                        if (!values[0].equals(productId)) {
                            updatedLines.add(lines.get(i));
                        } else {
                            found = true;
                        }
                    }

                    if (!found) {
                        throw new IOException("Product not found");
                    }

                    // Write updated content back to file
                    Files.write(csvFile.toPath(), updatedLines);
                    
                    exchange.sendResponseHeaders(204, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                String response = "{\"error\":\"" + e.getMessage() + "\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                byte[] responseBytes = response.getBytes("UTF-8");
                exchange.sendResponseHeaders(500, responseBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(responseBytes);
                }
            }
        }
    }

    static class OrderHandler implements HttpHandler{
        @Override
        public void handle(HttpExchange exchange) throws IOException{
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try{
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    BufferedReader br = new BufferedReader(isr);
                    StringBuilder requestBody = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        requestBody.append(line);
                    }

                    String body = requestBody.toString().trim();
                    boolean isAdminRequest = false;
                    String userId = null;

                    try {
                        JSONObject jsonBody = new JSONObject(body);
                        if (jsonBody.has("isAdmin")) {
                            Object adminValue = jsonBody.get("isAdmin");
                            isAdminRequest = (adminValue instanceof Boolean && (Boolean)adminValue) ||
                                           (adminValue instanceof String && 
                                            (adminValue.equals("true") || adminValue.equals("TRUE")));
                        }
                        
                        if (jsonBody.has("userId")) {
                            userId = jsonBody.getString("userId");
                        }
                    } catch (Exception e) {
                        isAdminRequest = body.contains("\"isAdmin\":true") || 
                                       body.contains("\"isAdmin\":\"true\"") || 
                                       body.contains("\"isAdmin\":\"TRUE\"") ||
                                       body.contains("isAdmin=true");
                    }
                    
                    String currentDir = System.getProperty("user.dir");
                    String csvPath = currentDir + "/data/orders.csv";
                    List<String> lines = Files.readAllLines(Paths.get(csvPath));
                    
                    JSONObject response = new JSONObject();
                    JSONArray orderHistory = new JSONArray();

                    for (String currentLine : lines) {
                        if (currentLine.trim().isEmpty()) {
                            continue;
                        }

                        String[] orderData = currentLine.split(",");
                        if (orderData.length < 5) {
                            continue;
                        }

                        if (orderData[0].equalsIgnoreCase("id") || 
                            orderData[0].equalsIgnoreCase("orderid") || 
                            orderData[0].equalsIgnoreCase("order_id")) {
                            continue;
                        }

                        boolean includeOrder = isAdminRequest || 
                            (userId != null && orderData[1].equals(userId));
                        
                        if (includeOrder) {
                            try {
                                // Parse and validate the total amount
                                String totalStr = orderData[3].trim();
                                double total;
                                try {
                                    total = Double.parseDouble(totalStr);
                                } catch (NumberFormatException e) {
                                    System.err.println("Invalid price format: " + totalStr);
                                    continue;
                                }

                                JSONObject order = new JSONObject();
                                order.put("id", orderData[0].trim());
                                order.put("userId", orderData[1].trim());
                                order.put("date", orderData[2].trim());
                                order.put("total", total); // Send as number, not string
                                order.put("status", orderData[4].trim());
                                
                                JSONArray items = new JSONArray();
                                for (int j = 5; j < orderData.length; j++) {
                                    items.put(orderData[j].trim());
                                }
                                order.put("items", items);
                                
                                orderHistory.put(order);
                            } catch (Exception e) {
                                System.err.println("Error processing order: " + e.getMessage());
                                continue;
                            }
                        }
                    }

                    response.put("orderHistory", orderHistory);
                    String responseBody = response.toString();
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    byte[] responseBytes = responseBody.getBytes("UTF-8");
                    exchange.sendResponseHeaders(200, responseBytes.length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(responseBytes);
                    }
                }
            } catch (Exception e) {
                String response = "{\"error\":\"" + e.getMessage() + "\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                byte[] responseBytes = response.getBytes("UTF-8");
                exchange.sendResponseHeaders(500, responseBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(responseBytes);
                }
            }
        }
    }

    static class OrderManagementHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Set CORS headers
            Headers headers = exchange.getResponseHeaders();
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            headers.add("Access-Control-Allow-Headers", "Content-Type");

            // Handle preflight request
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            if (!"POST".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "Method Not Allowed");
                return;
            }

            try {
                // Read request body
                InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
                BufferedReader br = new BufferedReader(isr);
                String requestBody = br.lines().collect(Collectors.joining());
                
                // Parse JSON
                JSONObject jsonRequest = new JSONObject(requestBody);
                int orderId = jsonRequest.getInt("orderId");
                String newStatus = jsonRequest.getString("status");

                // Update order status in CSV
                boolean updated = updateOrderStatus(orderId, newStatus);

                if (updated) {
                    JSONObject response = new JSONObject();
                    response.put("message", "Order status updated successfully");
                    sendResponse(exchange, 200, response.toString());
                } else {
                    sendResponse(exchange, 404, "Order not found");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }

        private boolean updateOrderStatus(int orderId, String newStatus) {
            try {
                Path path = Paths.get("data/orders.csv");
                List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
                
                boolean updated = false;
                for (int i = 0; i < lines.size(); i++) {
                    String[] parts = lines.get(i).split(",");
                    if (parts.length > 0 && Integer.parseInt(parts[0]) == orderId) {
                        // Update status (5th column)
                        parts[4] = newStatus;
                        lines.set(i, String.join(",", parts));
                        updated = true;
                        break;
                    }
                }

                if (updated) {
                    Files.write(path, lines, StandardCharsets.UTF_8);
                }

                return updated;
            } catch (IOException | NumberFormatException e) {
                e.printStackTrace();
                return false;
            }
        }

        private void sendResponse(HttpExchange exchange, int code, String response) throws IOException {
            exchange.sendResponseHeaders(code, response.length());
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        }
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            
            // Serve index.html for root path
            if (path.equals("/")) {
                path = "/index.html";
            }
            
            try {
                String currentDir = System.getProperty("user.dir");
                String fullPath = currentDir + "/frontend" + path;
                File file = new File(fullPath);
                
                if (!file.exists()) {
                    // If file not found, serve index.html for client-side routing
                    file = new File(currentDir + "/frontend/index.html");
                }
                
                exchange.getResponseHeaders().set("Content-Type", getContentType(path));
                byte[] fileContent = Files.readAllBytes(file.toPath());
                exchange.sendResponseHeaders(200, fileContent.length);
                
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(fileContent);
                }
            } catch (IOException e) {
                e.printStackTrace();
                String response = "404 (Not Found)\n";
                exchange.sendResponseHeaders(404, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }
        }
        
        private String getContentType(String path) {
            if (path.endsWith(".html")) return "text/html";
            if (path.endsWith(".js")) return "text/javascript";
            if (path.endsWith(".css")) return "text/css";
            if (path.endsWith(".json")) return "application/json";
            return "text/plain";
        }
    }
}