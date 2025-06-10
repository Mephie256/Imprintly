'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-gray-900/50 backdrop-blur-sm"
    >
      <div className="container mx-auto py-12 px-6 text-center text-gray-400">
        <motion.div whileHover={{ scale: 1.05 }} className="text-xl font-bold text-green-400 mb-4 inline-flex items-center space-x-2">
          <Link href="/">
            <Image src="https://i.ibb.co/0RYBCCPp/imageedit-3-7315062423.png" alt="Imprintly Logo" width={40} height={40} />
          </Link>
          <span className="text-xl font-bold text-green-400">Imprintly</span>
        </motion.div>
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="#features" className="text-sm leading-6 text-gray-300 hover:text-green-400"><motion.span whileHover={{ scale: 1.05 }}>Features</motion.span></Link>
          <Link href="#pricing" className="text-sm leading-6 text-gray-300 hover:text-green-400"><motion.span whileHover={{ scale: 1.05 }}>Pricing</motion.span></Link>
          <Link href="#terms" className="text-sm leading-6 text-gray-300 hover:text-green-400"><motion.span whileHover={{ scale: 1.05 }}>Terms</motion.span></Link>
          <Link href="#privacy" className="text-sm leading-6 text-gray-300 hover:text-green-400"><motion.span whileHover={{ scale: 1.05 }}>Privacy</motion.span></Link>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} Imprintly. All rights reserved.</p>
        <p className="text-xs mt-1">
          Create amazing image overlays with ease.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;