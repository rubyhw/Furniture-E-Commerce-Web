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
   javac -cp "lib/*;src" src/main/java/server/*.java src/main/java/Main.java
   java -cp "lib/*;src" main.java.Main

   # For Mac/Linux:
   javac -cp "lib/*:src" src/main/java/server/*.java src/main/java/Main.java
   java -cp "lib/*:src" main.java.Main
   ```

   Note: Make sure:
   1. You have the `lib` folder with `json.jar` in your project directory
   2. You're running these commands from the project root directory (Furniture-E-Commerce-Web)
   3. If you get JSON-related errors, it means the JSON library is not in your classpath
   4. If you get "Main class not found", double check that you're in the correct directory

3. Open web browser and visit:
   ```
   http://localhost:8080
   ```
