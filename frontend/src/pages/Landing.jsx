/**
 * Nobita Café — Landing Page
 */
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { GALLERY } from '@/data/galleryData'
import { MENU_ITEMS } from '@/data/menuData'

// Assets
import heroBg from '@/assets/hero/bg (7).jpeg'
import shopFront from '@/assets/shop/IMG_20260324_122103.jpg.jpeg'
import shopInside from '@/assets/shop/IMG_20260324_122110.jpg.jpeg'

const WHATSAPP_ORDER_MESSAGE = [
  'Hi Nobita Cafe, I want to place an order.',
  '',
  'Available food items:',
  ...MENU_ITEMS.map((item, index) => `${index + 1}. ${item.name} - Rs.${item.price}`),
  '',
  'Please reply with availability and confirm my order.',
].join('\n')

const WHATSAPP_ORDER_LINK = `https://wa.me/918489401699?text=${encodeURIComponent(WHATSAPP_ORDER_MESSAGE)}`

const FEATURES = [
  { icon: '🛵', title: 'Fast Delivery', desc: '30 min or free' },
  { icon: '☕', title: 'Premium Quality', desc: '100% Arabica beans' },
  { icon: '🏪', title: 'Pickup Ready', desc: 'Skip the queue' },
  { icon: '💵', title: 'Cash on Delivery', desc: 'Pay when your order arrives' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar transparent />

      {/* ═══ Hero Section ═══ */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        id="hero-section"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <div className="animate-fade-in">
            <p className="text-primary-300 font-medium text-sm sm:text-base tracking-widest uppercase mb-4">
              Welcome to
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-shadow-lg leading-tight">
              Nobita
              <span className="block text-primary-400">Café</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
              Premium coffee, fresh bites & warm vibes — 
              crafted with love in every cup.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/app"
                className="btn-primary text-lg px-10 py-4 rounded-2xl shadow-2xl 
                           shadow-primary-600/30 hover:shadow-primary-600/50 
                           transform hover:-translate-y-0.5 min-h-[52px]
                           flex items-center gap-2"
                id="cta-order-now"
              >
                <span>🛒</span> Order Now
              </Link>
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJZ4e_J1MHqTsRH1GB7pDrFpE"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary border-white/50 text-white hover:bg-white 
                           hover:text-espresso text-lg px-10 py-4 rounded-2xl min-h-[52px]
                           flex items-center gap-2"
                id="cta-leave-review"
              >
                <span>⭐</span> Leave a Review
              </a>
            </div>

            <a
              href={WHATSAPP_ORDER_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 bg-[#25D366] text-white hover:bg-[#1ebe5d] 
                         px-5 py-3 rounded-xl font-semibold text-sm shadow-lg transition-colors"
              id="cta-whatsapp-order"
            >
              <span>💬</span> WhatsApp Order Available
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features Strip ═══ */}
      <section className="bg-espresso py-12 sm:py-16 relative overflow-hidden" id="features-section">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(196,139,89,0.15),transparent_50%)]" />
        <div className="container-custom relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 group-hover:animate-float transition-transform duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                  {feat.title}
                </h3>
                <p className="text-white/60 text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Gallery Grid ═══ */}
      <section className="section-padding bg-cream" id="gallery-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-primary-500 font-medium text-sm tracking-widest uppercase mb-2">
              Our Space
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-espresso">
              A Glimpse Inside
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[200px] sm:auto-rows-[250px] items-stretch">
            {GALLERY.map((item, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${item.span}`}
              >
                <img
                  src={item.img}
                  alt={item.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 
                             group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full 
                               group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-white font-medium text-sm sm:text-base">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Location Section ═══ */}
      <section className="section-padding bg-white" id="location-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-primary-500 font-medium text-sm tracking-widest uppercase mb-2">
              Find Us
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-espresso">
              Visit Our Café
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-xl h-[300px] sm:h-[400px] bg-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.193198539659!2d77.3392437750403!3d11.099191689069796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9075327bf8767%3A0x9116eb90ee81511f!2sNobita%20cafe!5e0!3m2!1sen!2sin!4v1744607470659!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nobita Café Location"
              />
            </div>

            {/* Details + Photos */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-xl text-espresso mb-4">📍 Location</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Nobita cafe, Mangalam Rd, Vaniga Vallagam,<br />
                  Karuvampalayam, Tiruppur, Tamil Nadu 641604
                </p>
                <a
                  href={WHATSAPP_ORDER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 
                             px-4 py-2 rounded-xl text-sm font-medium transition-colors mb-3"
                >
                  💬 WhatsApp Order Available
                </a>
                <br />
                <a
                  href="https://maps.google.com/?q=11.0989288,77.3415407"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary-100 text-primary-700 hover:bg-primary-200 
                             px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Get Directions →
                </a>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-xl text-espresso mb-4">🕐 Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday – Friday</span>
                    <span className="font-semibold text-espresso">7:00 AM – 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday – Sunday</span>
                    <span className="font-semibold text-espresso">8:00 AM – 11:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden shadow-md h-40">
                  <img
                    src={shopFront}
                    alt="Nobita Café Exterior"
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md h-40">
                  <img
                    src={shopInside}
                    alt="Nobita Café Interior"
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-espresso text-white py-12" id="footer">
        <div className="container-custom">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-display text-xl mb-3">Nobita Café</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Premium coffee, fresh bites & warm vibes.
                Crafted with love in every cup.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/app" className="block text-white/60 hover:text-primary-400 transition-colors text-sm">Menu</Link>
                <Link to="/cart" className="block text-white/60 hover:text-primary-400 transition-colors text-sm">Cart</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>📞 +91 84894 01699</p>
                <p>✉️ nobitacafe.feedback@gmail.com</p>
                <a 
                  href="https://maps.google.com/?q=11.0989288,77.3415407" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block hover:text-primary-400 transition-colors"
                >
                  📍 Karuvampalayam, Tiruppur
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} Nobita Café. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
