import server.SimpleHttpServer;

public class Main {
    public static void main(String[] args) {
        try {
            new SimpleHttpServer().start();
        } catch (Exception e) {
            System.err.println("Failed to start server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
