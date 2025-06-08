'use client'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { 
  FaWallet, FaArrowRight, FaGlobe, FaMobileAlt, 
  FaCreditCard, FaExchangeAlt, FaChartLine, FaUserFriends,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa'
import { FiSend, FiDollarSign, FiClock, FiUserCheck } from 'react-icons/fi'
import { RiSecurePaymentLine } from 'react-icons/ri'
import Link from 'next/link'

// Component for animated elements when they come into view
const AnimatedSection = ({ children, delay = 0 }) => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 30 }
      }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

const FeatureCard = ({ icon, title, description, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <div className={`${colors[color]} p-3 rounded-full inline-flex mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

const LandingPage = () => {
  // Stats data
  const stats = [
    { value: '1M+', label: 'Active Users' },
    { value: '$500M+', label: 'Transactions' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Countries' }
  ]

  const socialMedia = [
    { icon: <FaFacebook />, name: 'Facebook', url: '#' },
    { icon: <FaTwitter />, name: 'Twitter', url: '#' },
    { icon: <FaInstagram />, name: 'Instagram', url: '#' },
    { icon: <FaLinkedinIn />, name: 'LinkedIn', url: '#' },
    { icon: <FaYoutube />, name: 'YouTube', url: '#' },
  ];

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', url: '#' },
        { name: 'Pricing', url: '#' },
        { name: 'Security', url: '#' },
        { name: 'Integrations', url: '#' },
        { name: 'API', url: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', url: '#' },
        { name: 'Careers', url: '#' },
        { name: 'Blog', url: '#' },
        { name: 'Press', url: '#' },
        { name: 'Partners', url: '#' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', url: '#' },
        { name: 'Community', url: '#' },
        { name: 'Tutorials', url: '#' },
        { name: 'Webinars', url: '#' },
        { name: 'Events', url: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', url: '#' },
        { name: 'Terms of Service', url: '#' },
        { name: 'Cookie Policy', url: '#' },
        { name: 'GDPR', url: '#' },
        { name: 'Compliance', url: '#' }
      ]
    }
  ];


  return (
    <div className="font-sans bg-gray-50 overflow-x-hidden pt-12">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-r from-transparent to-white opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <AnimatedSection>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Next-Gen Digital Wallet
                  </span>{' '}
                  for Your Financial Freedom
                </h1>
              </AnimatedSection>
              
              <AnimatedSection delay={0.2}>
                <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mb-10">
                  Experience seamless transactions, top-tier security, and financial insights all in one powerful app.
                </p>
              </AnimatedSection>
              
              <AnimatedSection delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <motion.a
                    href="/create-account"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Get Started Free</span>
                    <FaArrowRight className="text-sm" />
                  </motion.a>
                  <motion.a
                    href="#features"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                  >
                    Learn More
                  </motion.a>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={0.6}>
                <div className="flex flex-wrap gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-xs border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
            
            <AnimatedSection delay={0.3}>
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl -z-10"></div>
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-900 text-white p-4 rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                        <FaWallet className="text-white" />
                      </div>
                      <span className="font-medium">MyWallet</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Active</span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-gray-500 text-sm">Total Balance</p>
                        <p className="text-3xl font-bold text-gray-900">$1,250.00</p>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <FiSend />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <FiDollarSign />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Income</p>
                        <p className="font-medium text-blue-600">+$1,500</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Expenses</p>
                        <p className="font-medium text-red-600">-$250</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Savings</p>
                        <p className="font-medium text-green-600">15%</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">Recent Transactions</p>
                        <button className="text-xs text-blue-600">View All</button>
                      </div>
                      <div className="space-y-3">
                        {['Netflix', 'Starbucks', 'Amazon', 'Uber'].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                {item.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item}</p>
                                <p className="text-xs text-gray-500">Today</p>
                              </div>
                            </div>
                            <p className={`text-sm font-medium ${index % 2 === 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {index % 2 === 0 ? '-$12.99' : '+$150.00'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2">
                      <span>Add Money</span>
                      <FaArrowRight className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-gray-100 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {['Forbes', 'TechCrunch', 'Bloomberg', 'WSJ', 'TheVerge'].map((brand, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="text-2xl font-bold text-gray-400">{brand}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <AnimatedSection>
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-600 mb-4">
                Why Choose Us
              </span>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Banking Made <span className="text-blue-600">Simple</span> and <span className="text-purple-600">Secure</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine cutting-edge technology with exceptional service to give you the best financial experience.
              </p>
            </AnimatedSection>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedSection delay={0.2}>
              <FeatureCard
                icon={<RiSecurePaymentLine size={24} />}
                title="Military-Grade Security"
                description="Your funds are protected with bank-level encryption and multi-factor authentication."
                color="blue"
              />
            </AnimatedSection>
            
            <AnimatedSection delay={0.3}>
              <FeatureCard
                icon={<FaExchangeAlt size={20} />}
                title="Instant Transfers"
                description="Send money to anyone, anywhere in seconds with zero waiting time."
                color="purple"
              />
            </AnimatedSection>
            
            <AnimatedSection delay={0.4}>
              <FeatureCard
                icon={<FaGlobe size={20} />}
                title="Global Coverage"
                description="Operate in over 150 countries with real-time currency conversion."
                color="green"
              />
            </AnimatedSection>
            
            <AnimatedSection delay={0.5}>
              <FeatureCard
                icon={<FaChartLine size={20} />}
                title="Smart Analytics"
                description="Get personalized insights to help you manage your money better."
                color="orange"
              />
            </AnimatedSection>
            
            <AnimatedSection delay={0.6}>
              <FeatureCard
                icon={<FaUserFriends size={20} />}
                title="Family Accounts"
                description="Easily manage shared finances with family members."
                color="purple"
              />
            </AnimatedSection>
            
            <AnimatedSection delay={0.7}>
              <FeatureCard
                icon={<FiClock size={20} />}
                title="24/7 Support"
                description="Our award-winning customer service is always available."
                color="blue"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <AnimatedSection>
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-600 mb-4">
                Getting Started
              </span>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Get Started in <span className="text-blue-600">3 Minutes</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join millions of happy users managing their finances with ease.
              </p>
            </AnimatedSection>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: <FiUserCheck size={24} className="text-blue-600" />,
                title: "Create Account",
                description: "Sign up with your email or phone number in under a minute."
              },
              {
                step: "2",
                icon: <FaCreditCard size={20} className="text-purple-600" />,
                title: "Add Payment Method",
                description: "Connect your bank account or credit card securely."
              },
              {
                step: "3",
                icon: <FaMobileAlt size={20} className="text-green-600" />,
                title: "Start Transacting",
                description: "Send, receive, and manage money instantly."
              }
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                      <span className="text-2xl font-bold text-blue-600">{item.step}</span>
                    </div>
                    <div className="mb-4 text-blue-600">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <AnimatedSection>
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-600 mb-4">
                User Stories
              </span>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Loved by <span className="text-blue-600">Thousands</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don't just take our word for it - hear from our users.
              </p>
            </AnimatedSection>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Freelance Designer",
                quote: "I've tried many wallets but none compare to the simplicity and speed of this one.",
                rating: 5,
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Small Business Owner",
                quote: "The family accounts feature has simplified our household finances tremendously.",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "David Wilson",
                role: "Digital Nomad",
                quote: "As someone who travels constantly, the multi-currency support is a game-changer.",
                rating: 5,
                avatar: "DW"
              }
            ].map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Financial Life?
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-10">
              Join over 1 million users who trust us with their money every day.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.a
                href="/create-account"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <FaArrowRight className="text-sm" />
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center"
              >
                Contact Sales
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <FaWallet className="text-blue-400 text-3xl" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                MyWallet
              </span>
            </div>
            <p className="text-gray-400 mb-6 text-lg">
              The most secure and user-friendly digital wallet for all your financial needs.
            </p>
            
            {/* Newsletter Subscription */}
            <div className="mb-8">
              <h4 className="text-white font-medium mb-3">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-3 w-full rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 rounded-r-lg font-medium hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-medium mb-3">Follow Us</h4>
              <div className="flex flex-wrap gap-3">
                {socialMedia.map((social, index) => (
                  <Link
                    key={index}
                    href={social.url}
                    aria-label={social.name}
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-all"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold text-lg mb-6">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.url}
                      className="text-gray-400 hover:text-white transition-colors text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12"></div>

        {/* Bottom Footer */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 md:mb-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MyWallet. All rights reserved.
            </p>
            <div className="hidden sm:block text-gray-600">|</div>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-500 hover:text-white text-sm">
                Terms
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white text-sm">
                Privacy
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white text-sm">
                Cookies
              </Link>
            </div>
          </div>

          {/* App Download Buttons */}
          <div className="flex gap-3">
            <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              App Store
            </button>
            <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
              </svg>
              Google Play
            </button>
          </div>
        </div>
      </div>
    </footer>
    </div>
  )
}

export default LandingPage