package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import server.SimpleHttpServer.LoginHandler;
import server.SimpleHttpServer.SignUpHandler;
import server.SimpleHttpServer.ProductHandler;
import server.SimpleHttpServer.CheckoutHandler;
import server.SimpleHttpServer.StaticFileHandler;
import server.SimpleHttpServer.StockHandler;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class SimpleHttpServer {
    private HttpServer server;

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/api/login", new LoginHandler());
        server.createContext("/api/signup", new SignUpHandler());
        server.createContext("/api/products", new ProductHandler());
        server.createContext("/api/stock", new StockHandler());
        server.createContext("/api/checkout", new CheckoutHandler());
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Server started successfully! Access the website at http://localhost:8080");
    }

    static class LoginHandler implements HttpHandler{
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

                    String body = requestBody.toString().trim();
                    System.out.println(body);
                    body = body.substring(1, body.length()-1);
                    String[] parts = body.split(",");
                    String email = parts[0].split(":")[1];
                    String password = parts[1].split(":")[1];
                    email = email.substring(1, email.length()-1);
                    password = password.substring(1, password.length()-1);

                    String currentDir = System.getProperty("user.dir");
                    String csvPath = currentDir + "/data/users.csv";
                    File csvFile = new File(csvPath);
                    if (!csvFile.exists() || !csvFile.canRead()) {
                        throw new IOException("Cannot access CSV file at: " + csvPath);
                    }
                    try (Scanner reader = new Scanner(csvFile)) {
                        while(reader.hasNextLine()){
                            String record = reader.nextLine();
                            String[] userInformation = record.split(",");
                            if(userInformation[1].equals(email) && userInformation[3].equals(password)){
                                StringBuilder jsonBuilder = new StringBuilder();
                                jsonBuilder.append("{\"id\":\"" + userInformation[0] + "\",\"email\":\"" + userInformation[1] + "\",\"name\":\"" + userInformation[2] + "\",\"admin\":\"" + userInformation[4] + "\"}");
                                String userCredentials = jsonBuilder.toString();
                                System.err.println(userCredentials);
                                exchange.getResponseHeaders().set("Content-Type", "application/json");
                                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                                byte[] responseBytes = userCredentials.getBytes("UTF-8");
                                exchange.sendResponseHeaders(200, responseBytes.length);
                                try (OutputStream os = exchange.getResponseBody()) {
                                    os.write(responseBytes);
                                }
                            }
                        }
                    } catch (FileNotFoundException err){
                        System.err.println("scanner failed");
                    }
                    String response = "{\"error\":\"User not found\"}";
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    byte[] responseBytes = response.getBytes("UTF-8");
                    exchange.sendResponseHeaders(400, responseBytes.length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(responseBytes);
                    }
                } else{
                    throw new IOException("Method not allowed");
                }
            }catch(IOException e){
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
                    System.out.println(body);
                    body = body.substring(1, body.length()-1);
                    System.out.println(body);
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