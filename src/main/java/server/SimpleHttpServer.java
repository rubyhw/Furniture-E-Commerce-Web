package server;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;

public class SimpleHttpServer {
    private HttpServer server;
    private static final String FRONTEND_PATH = "frontend";
    private static final Map<String, String> MIME_TYPES = new HashMap<>();
    
    static {
        MIME_TYPES.put(".html", "text/html");
        MIME_TYPES.put(".js", "text/javascript");
        MIME_TYPES.put(".css", "text/css");
        MIME_TYPES.put(".json", "application/json");
        MIME_TYPES.put(".png", "image/png");
        MIME_TYPES.put(".jpg", "image/jpeg");
    }
    
    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Set up routes
        server.createContext("/api/products", new ProductHandler());
        server.createContext("/", new StaticFileHandler());
        
        server.setExecutor(null);
        server.start();
        System.out.println("Server started on port 8080");
    }
    
    static class ProductHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "{\"products\": []}";
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length());
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        }
    }
    
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            System.out.println("Requested path: " + path); // Debug log
            
            // Default to index.html for root path
            if (path.equals("/")) {
                path = "/index.html";
            }
            
            // Remove leading slash and combine with frontend path
            String fullPath = FRONTEND_PATH + path;
            System.out.println("Looking for file: " + fullPath); // Debug log
            
            File file = new File(fullPath);
            if (!file.exists()) {
                String response = "404 Not Found: " + path;
                System.out.println(response); // Debug log
                exchange.sendResponseHeaders(404, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
                return;
            }
            
            // Set content type based on file extension
            String contentType = getContentType(path);
            exchange.getResponseHeaders().set("Content-Type", contentType);
            
            // Read and send the file
            byte[] response = Files.readAllBytes(file.toPath());
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
            System.out.println("Successfully served: " + path + " with type: " + contentType); // Debug log
        }
        
        private String getContentType(String path) {
            String defaultType = "text/plain";
            int lastDot = path.lastIndexOf('.');
            if (lastDot < 0) {
                return defaultType;
            }
            String ext = path.substring(lastDot);
            return MIME_TYPES.getOrDefault(ext, defaultType);
        }
    }
}
