window.SignupPage = ({ setCurrentPage }) => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
        await window.AuthContext.handleSignUp({
            email,
            password,
            name
        });
        setCurrentPage("home");
        } catch (err) {
        setError(err.message);
        setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <h1>Create Account</h1>
                {error && <div className="error-message">{error}</div>}
                <form className="signup-form" onSubmit={handleSignUpSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
                </form>
                <p>
                    Already have an account? <a href="#" onClick={() => setCurrentPage('login')}>Login</a>
                </p>
            </div>
        </div>
    );
};
