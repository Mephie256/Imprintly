'use client';

import { motion } from 'framer-motion';

interface StatsSectionProps {
  staggerContainer: any;
  fadeInUp: any;
  stats: { id: number; name: string; value: string }[];
}

const StatsSection: React.FC<StatsSectionProps> = ({ staggerContainer, fadeInUp, stats }) => {
  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      className="py-8 sm:py-12 bg-gray-900/50"
    >
      <div className="container mx-auto px-6">
        <dl className="grid grid-cols-1 gap-y-6 gap-x-4 text-center sm:grid-cols-3">
          {stats.map((stat) => (
            <motion.div variants={fadeInUp} key={stat.id} className="flex flex-col items-center">
              <dt className="text-xs leading-5 text-gray-400">{stat.name}</dt>
              <dd className="order-first text-2xl font-semibold tracking-tight text-green-400 sm:text-3xl">{stat.value}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </motion.section>
  );
};

export default StatsSection;