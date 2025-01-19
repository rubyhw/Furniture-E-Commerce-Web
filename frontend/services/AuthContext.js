const AuthContext = {
  async handleLogin({
    email,
    password,
    setIsAuthenticated,
    setIsAdmin,
    setUserId,
    setUserName,
  }) {
    try {
      console.log("submitting form");
      console.log(JSON.stringify({ email, password }));
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setIsAuthenticated(true);
        setUserId(data.id);
        setUserName(data.name);
        if (data.admin === "TRUE") {
          setIsAdmin(true);
        }
      } else {
        throw new Error("Invalid User Credentials");
      }
    } catch (err) {
      throw err;
    }
  },

  async handleSignUp({
    email,
    password,
    name
  }) {
    try {
      console.log("submitting form");
      console.log(JSON.stringify({ email, password, name }));
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data.error);
        throw new Error(data.error);
      }
    } catch (err) {
      throw err;
    }
  }
};

window.AuthContext = AuthContext;
