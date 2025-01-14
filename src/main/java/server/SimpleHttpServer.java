package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.util.List;

public class SimpleHttpServer {
    private HttpServer server;

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/api/products", new ProductHandler());
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Server started successfully! Access the website at http://localhost:8080");
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
                        if (header.equals("id") || header.equals("price")) {
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
