# Furniture E-Commerce Website

1. Clone the repository:
   ```bash
   git clone https://github.com/rubyhw/Furniture-E-Commerce-Web.git
   cd Furniture-E-Commerce-Web
   ```

2. Compile and run the Java server:
   ```bash
   # From the Furniture-E-Commerce-Web directory
   # For Windows:
   javac -cp "lib/*;src" src/main/java/server/*.java
   java -cp "lib/*;src" main.java.server.Main

   # For Mac/Linux:
   javac -cp "lib/*:src" src/main/java/server/*.java
   java -cp "lib/*:src" main.java.server.Main
   ```

   Note: Make sure you have the `lib` folder with `json.jar` in your project directory.
   If you get JSON-related errors, it means the JSON library is not in your classpath.

3. Open web browser and visit:
   ```
   http://localhost:8080
   ```
