window.LoginPage = ({
  setCurrentPage,
  setIsAuthenticated,
  setIsAdmin,
  setUserId,
  setUserName,
}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await window.AuthContext.handleLogin({
        email,
        password,
        setIsAuthenticated,
        setIsAdmin,
        setUserId,
        setUserName,
      });
      setCurrentPage("home");
    } catch (err) {
      console.log(err);
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>
          Don't have an account?{" "}
          <a href="#" onClick={() => setCurrentPage("signup")}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};
