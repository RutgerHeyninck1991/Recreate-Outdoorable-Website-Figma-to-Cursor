import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Camera, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const LifestyleSection = memo(({ beachLoungersImage, modernOutdoorFurnitureImage }) => {
  return (
    <section className="py-24 px-6 lg:px-12 bg-stone-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl mb-6 tracking-wide">Lifestyle & Inspiratie</h2>
          <p className="text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
            Ontdek hoe onze premium outdoor kussens de perfecte ambiance creëren voor 
            elke outdoor setting, van intieme terrassen tot exclusieve resort ervaringen.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <Badge className="bg-white/10 text-white px-4 py-2 rounded-full">
                <Camera className="w-4 h-4 mr-2" />
                Lifestyle Photography
              </Badge>
              <h3 className="text-3xl lg:text-4xl leading-tight">
                Van strandzonsondergang tot rooftop dining
              </h3>
              <p className="text-lg text-stone-300 leading-relaxed">
                Onze kussens transformeren elke outdoor ruimte in een luxe ervaring. 
                Weerbestendig, comfortabel en visueel verbluffend.
              </p>
              <div className="space-y-4">
                {[
                  "UV-bestendig tot 500+ uur directe zon",
                  "100% waterafstotend met sneldrogende kern",
                  "Handgemaakt in Nederland met 5 jaar garantie"
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-stone-200">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300">
                <ImageWithFallback
                  src={beachLoungersImage}
                  alt="Beach loungers with premium cushions"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80"
                  alt="Yacht outdoor cushions"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop&q=80"
                  alt="Modern terrace design"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300">
                <ImageWithFallback
                  src={modernOutdoorFurnitureImage}
                  alt="Restaurant outdoor seating"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

LifestyleSection.displayName = 'LifestyleSection';

export default LifestyleSection;