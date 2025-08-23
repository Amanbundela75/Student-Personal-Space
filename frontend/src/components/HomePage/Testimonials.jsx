import React from 'react';
import Slider from "react-slick";

const testimonialsData = [
    { id: 1, name: "Priya Sharma", feedback: "This LMS changed my life! The teachers are super helpful and content is up-to-date.", avatar: "/images/students/priya.webp" }, // .webp
    { id: 2, name: "Rahul Verma", feedback: "I got my first job after completing the Full Stack course here. Highly recommend!", avatar: "/images/students/rahul.webp" }, // .webp
    { id: 3, name: "Sunita Kaur", feedback: "The flexible learning schedule helped me a lot. The courses are amazing!", avatar: "/images/students/sunita.webp" } // .webp
];

const TestimonialCard = ({ testimonial }) => (
    <div className="testimonial-card-wrapper">
        <div className="testimonial-card">
            {/* === LAZY LOADING ENABLED === */}
            <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" loading="lazy" />
            <p>"{testimonial.feedback}"</p>
            <span className="testimonial-name">- {testimonial.name}</span>
        </div>
    </div>
);

const Testimonials = () => {
    const settings = {
        dots: true, infinite: true, speed: 500, slidesToShow: 1,
        slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000,
        arrows: true, fade: true, cssEase: 'linear'
    };

    return (
        <section className="testimonials-section">
            <div className="container">
                <h2 className="section-title">What Our Students Say</h2>
                <div className="testimonial-carousel-container">
                    <Slider {...settings}>
                        {testimonialsData.map((t) => <TestimonialCard key={t.id} testimonial={t} />)}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;