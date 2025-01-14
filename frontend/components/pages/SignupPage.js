window.SignupPage = ({ setCurrentPage }) => {
    return (
        <div className="signup-page">
            <div className="signup-container">
                <h1>Create Account</h1>
                <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" required />
                    </div>
                    <button type="submit">Create Account</button>
                </form>
                <p>
                    Already have an account? <a href="#" onClick={() => setCurrentPage('login')}>Login</a>
                </p>
            </div>
        </div>
    );
};
