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
        </div>
    );
};
