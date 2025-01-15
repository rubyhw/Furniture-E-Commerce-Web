window.HomePage = ({ setCurrentPage }) => {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [fadeIn, setFadeIn] = React.useState(false);

    const slides = [
        {
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
            text: 'Modern Living Room Collections'
        },
        {
            image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457',
            text: 'Elegant Bedroom Designs'
        },
        {
            image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
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
                        <p>Discover our curated collection of premium furniture</p>
                        <button className="cta-button" onClick={navigateToProducts}>Shop Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
