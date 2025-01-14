window.LoginPage = ({ setCurrentPage }) => {
    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Login</h1>
                <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" required />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <p>
                    Don't have an account? <a href="#" onClick={() => setCurrentPage('signup')}>Sign up</a>
                </p>
            </div>
        </div>
    );
};
