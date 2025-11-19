import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Quote, Star } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const TestimonialsSection = memo(({ testimonials }) => {
  return (
    <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-stone-100 via-stone-50 to-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl text-stone-800 mb-6 tracking-wide">Wat Onze Klanten Zeggen</h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            Ontdek waarom professionals en particulieren vertrouwen op Outdoorable 
            voor hun premium outdoor kussen behoeften.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Quote className="w-8 h-8 text-stone-300 mb-6" />
              
              <p className="text-stone-700 leading-relaxed mb-6 text-lg">
                "{testimonial.quote}"
              </p>

              <div className="flex space-x-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden hover:scale-110 transition-transform duration-300">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-stone-800">{testimonial.name}</p>
                  <p className="text-sm text-stone-600">{testimonial.role}</p>
                  <p className="text-sm text-stone-500">{testimonial.company}</p>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="text-xs bg-white/50">
                  {testimonial.project}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';

export default TestimonialsSection;