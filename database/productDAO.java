import java.sql.*;

public class productDAO {
    public static Connection connect() {
        String url = "jdbc:mysql://localhost:3306/cafe";
        String user = "root";
        String password = "";

        try {
            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            e.printStackTrace(); 
            return null;
        }
    }

    public static void main(String[] args) {
        Connection conn = connect();
        if (conn != null) {
            System.out.println("Kết nối thành công!");
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Kết nối thất bại!");
        }
    }
}