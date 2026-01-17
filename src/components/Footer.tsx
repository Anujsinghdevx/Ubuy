'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-emerald-600 text-gray-300 pb-6">
      <div className="mx-auto pt-10 px-8 sm:px-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Intro */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 cursor-pointer hover:scale-[1.02] transition-transform duration-200 ease-out">
            U-Buy
          </h2>
          <p className="text-sm leading-relaxed">
            Bid, win, and own unique collectibles and rare finds at unbeatable prices. Experience
            seamless, real-time auctions.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/"
                className="hover:text-white hover:underline underline-offset-4 transition duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/auctions"
                className="hover:text-white hover:underline underline-offset-4 transition duration-200"
              >
                Auctions
              </Link>
            </li>
            <li>
              <Link
                href="/badges"
                className="hover:text-white hover:underline underline-offset-4 transition duration-200"
              >
                Badges
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white hover:underline underline-offset-4 transition duration-200"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-white hover:underline underline-offset-4 transition duration-200"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/terms"
                className="hover:text-white hover:underline underline-offset-4 transition duration-200"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-white hover:underline underline-offset-4 transition duration-200"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Connect with Us</h3>
          <p className="text-sm flex items-center mb-3">
            <Mail className="w-4 h-4 mr-2" />
            <a
              href="mailto:support@ubuy.com"
              className="hover:text-white hover:underline underline-offset-4 transition duration-200"
            >
              support@ubuy.com
            </a>
          </p>

          <div className="flex space-x-5 mt-4">
            <a
              href="https://facebook.com/auctionify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition-transform duration-200 hover:scale-110"
            >
              <FaFacebookF className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/auctionify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-white transition-transform duration-200 hover:scale-110"
            >
              <FaTwitter className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/auctionify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition-transform duration-200 hover:scale-110"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-300 mt-10 pt-5 text-center text-sm text-gray-300">
        © {new Date().getFullYear()} U-Buy. All rights reserved.
      </div>
    </footer>
  );
}
