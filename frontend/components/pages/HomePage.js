window.HomePage = ({ setCurrentPage }) => {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [fadeIn, setFadeIn] = React.useState(false);

    const slides = [
        {
            image: 'https://deborainteriors.com/wp-content/uploads/2023/04/white-living-room-vintage.png',
            text: 'Modern Living Room Collections'
        },
        {
            image: 'https://www.home-designing.com/wp-content/uploads/2016/11/natural-minimalist-bedroom.jpg',
            text: 'Elegant Bedroom Designs'
        },
        {
            image: 'https://static.vecteezy.com/system/resources/previews/040/286/256/non_2x/ai-generated-a-minimalist-home-office-with-a-simple-desk-ergonomic-chair-free-photo.jpeg',
            text: 'Stylish Office Furniture'
        }
    ];

    React.useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000);

        setFadeIn(true);

        return () => {
            clearInterval(slideInterval);
        };
    }, []);

    React.useEffect(() => {
        setFadeIn(false);
        const timeout = setTimeout(() => setFadeIn(true), 100);
        return () => clearTimeout(timeout);
    }, [currentSlide]);

    const navigateToProducts = (e) => {
        e.preventDefault();
        setCurrentPage('products');
    };

    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="slideshow">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            style={{
                                backgroundImage: `url(${slide.image})`,
                                opacity: index === currentSlide ? 1 : 0
                            }}
                        />
                    ))}
                    <div className={`slide-content ${fadeIn ? 'fade-in' : ''}`}>
                        <h1>{slides[currentSlide].text}</h1>
                        <button className="cta-button" onClick={navigateToProducts}>Shop Now</button>
                    </div>
                </div>
            </div>

            <div className="about-us-section">
                <div className="about-us-header">
                    <h1>About Furniture Haven </h1>
                    <p className="tagline">Transforming Houses into Homes, One Piece at a Time</p>
                </div>

                <div className="about-us-content">
                    <section className="about-section">
                        <h2>Our Story</h2>
                        <p>Founded in 2025, Furniture Haven has been dedicated to bringing quality, style, and comfort to
                            homes across Malaysia.
                            We believe that furniture is more than just functional pieces – they're the foundation of your
                            living spaces and the backdrop to your life's precious moments.</p>
                    </section>

                    <section className="mission-section">
                        <h2>Our Mission</h2>
                        <p>To provide high-quality, beautifully designed furniture that enhances the way people live, work,
                            and relax in their spaces.
                            We strive to combine aesthetics with functionality, ensuring each piece tells a story while
                            serving its purpose.</p>
                    </section>

                    <section className="values-section">
                        <h2>Our Values</h2>
                        <ul>
                            <li><strong>Quality:</strong> We source only the finest materials and work with skilled
                                craftsmen
                            </li>
                            <li><strong>Sustainability:</strong> Committed to eco-friendly practices and sustainable
                                sourcing
                            </li>
                            <li><strong>Customer Service:</strong> Your satisfaction is our top priority</li>
                            <li><strong>Innovation:</strong> Constantly updating our collections with modern designs</li>
                        </ul>
                    </section>

                    <section className="contact-section">
                        <h2>Contact Us</h2>
                        <div className="contact-details">
                            <div className="contact-item">
                                <h3>Address</h3>
                                <p>13 Furniture Street<br/>
                                    Georgetown, 11600<br/>
                                    Malaysia</p>
                            </div>
                            <div className="contact-item">
                                <h3>Contact Information</h3>
                                <p>Email: info@furniture.my<br/>
                                    Phone: +60 11-546 1845<br/>
                                    WhatsApp: +60 10-323 1722</p>
                            </div>
                            <div className="contact-item">
                                <h3>Business Hours</h3>
                                <p>Monday - Friday: 9:00 AM - 8:00 PM<br/>
                                    Saturday - Sunday: 10:00 AM - 6:00 PM<br/>
                                    Public Holidays: 10:00 AM - 4:00 PM</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
