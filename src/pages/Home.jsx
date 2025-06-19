import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import mainImage from '../assets/Home/main.jpg';
import popularPick1 from '../assets/Home/popularpick1.jpg';
import popularPick2 from '../assets/Home/popularpick2.jpg';
import popularPick3 from '../assets/Home/popularpick3.jpg';
import popularPick4 from '../assets/Home/popularpick4.jpg';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants for framer-motion
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-teal-100 text-gray-800 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Section */}
        <motion.div
          className="flex flex-col lg:flex-row items-center justify-between mb-20 gap-12"
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={fadeIn}
        >
          <div className="lg:w-1/2">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-teal-900 mb-4 tracking-tight"
              variants={slideIn}
            >
              Haritha Hub
            </motion.h1>
            <motion.p
              className="text-xl text-teal-700 mb-6 font-medium"
              variants={fadeIn}
            >
              Grow Fresh. Live Healthy.
            </motion.p>
            <motion.p
              className="text-base text-gray-700 leading-relaxed max-w-lg"
              variants={fadeIn}
            >
              At Haritha Hub, we are dedicated to empowering urban gardeners with simple, sustainable solutions. From compact balconies to lush backyards, our curated seeds, tools, and kits make growing fresh, organic produce effortless. Start your journey to a healthier, greener lifestyle today.
            </motion.p>
            <motion.a
              href="/shop"
              className="mt-6 inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md"
              variants={fadeIn}
            >
              Explore Products
            </motion.a>
          </div>
          <motion.div
            className="lg:w-1/2 flex justify-center"
            variants={fadeIn}
          >
            <img
              src={mainImage}
              alt="Haritha Hub Main"
              className="w-full max-w-md rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </motion.div>

        {/* Vision and Mission Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <motion.div
            className="p-8 bg-white rounded-xl shadow-lg border border-teal-100 hover:shadow-xl transition-all duration-300"
            variants={slideIn}
          >
            <h2 className="text-2xl font-bold text-teal-800 mb-4">Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To inspire a global community of urban gardeners, fostering sustainable living through homegrown, healthy produce.
            </p>
          </motion.div>
          <motion.div
            className="p-8 bg-white rounded-xl shadow-lg border border-teal-100 hover:shadow-xl transition-all duration-300"
            variants={slideIn}
          >
            <h2 className="text-2xl font-bold text-teal-800 mb-4">Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To simplify urban gardening with accessible tools and resources, enabling anyone to grow fresh, organic food in any space.
            </p>
          </motion.div>
        </motion.div>

        {/* Popular Picks Section */}
        <motion.div
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold text-teal-900 mb-6 text-center">Popular Picks</h2>
          <div className="border-b-4 border-teal-600 w-20 mx-auto mb-10"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: popularPick1, title: 'Basil Bonanza Kit', desc: 'Grow fresh basil for your culinary creations.' },
              { img: popularPick2, title: 'Mini Root Box', desc: 'Harvest tiny carrots, radishes, and more.' },
              { img: popularPick3, title: 'Self-Watering Pots', desc: 'Perfect for hassle-free plant care.' },
              { img: popularPick4, title: 'Compost Starter Kit', desc: 'Transform scraps into nutrient-rich compost.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="bg-white p-6 rounded-xl shadow-md border border-teal-100 hover:shadow-lg transition-all duration-300"
                variants={fadeIn}
                whileHover={{ scale: 1.03 }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{item.desc}</p>
                <a
                  href="/shop"
                  className="mt-4 inline-block text-teal-600 hover:text-teal-700 font-medium text-sm"
                >
                  Shop Now
                </a>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="/shop"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md"
            >
              View All Products
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;