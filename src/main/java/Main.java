import server.SimpleHttpServer;

public class Main {
    public static void main(String[] args) {
        try {
            SimpleHttpServer server = new SimpleHttpServer();
            server.start();
            System.out.println("Server started successfully!");
        } catch (Exception e) {
            System.err.println("Failed to start server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
