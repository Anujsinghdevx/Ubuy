'use client';

import Head from 'next/head';
import { motion } from 'framer-motion';
import { MailIcon, PhoneIcon, MapPinIcon, SendIcon } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us | U-Buy</title>
        <meta
          name="description"
          content="Get in touch with U-Buy. Reach out for support, inquiries, or feedback through our contact form or contact details."
        />
        <meta property="og:title" content="Contact Us | U-Buy" />
        <meta
          property="og:description"
          content="Get in touch with U-Buy. Reach out for support, inquiries, or feedback through our contact form or contact details."
        />
        <meta name="keywords" content="Contact, U-Buy, Support, Feedback, Help, Inquiry" />
      </Head>

      <section className="max-w-5xl mx-auto p-6 sm:p-10 space-y-14">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold text-gray-800">Get in Touch</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Have a question, suggestion, or feedback? Reach out to us — we’d love to hear from you!
          </p>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          {[
            {
              icon: <MailIcon className="text-emerald-600" />,
              title: 'Email',
              value: 'support@ubuy.in',
            },
            {
              icon: <PhoneIcon className="text-emerald-600" />,
              title: 'Phone',
              value: '+91 98765 43210',
            },
            {
              icon: <MapPinIcon className="text-emerald-600" />,
              title: 'Location',
              value: 'New Delhi, India',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white rounded-xl shadow flex flex-col items-center space-y-3"
            >
              <div className="p-4 bg-emerald-200 rounded-full">{item.icon}</div>
              <h3 className="text-lg font-semibold text-emerald-800">{item.title}</h3>
              <p className="text-gray-600">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6 bg-white p-8 rounded-xl shadow"
          onSubmit={(e) => {
            e.preventDefault();
            alert('Message sent successfully!');
          }}
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Send Us a Message</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Your Name"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              required
            />
          </div>
          <textarea
            placeholder="Your Message"
            rows={5}
            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 transition"
          >
            <SendIcon size={18} /> Send Message
          </button>
        </motion.form>
      </section>
    </>
  );
}
