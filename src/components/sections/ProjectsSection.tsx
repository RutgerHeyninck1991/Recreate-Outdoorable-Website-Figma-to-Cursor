import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { MapPin } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const ProjectsSection = memo(({ featuredProjects }) => {
  return (
    <section className="py-24 px-6 lg:px-12 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl text-stone-800 mb-6 tracking-wide">Featured Projects</h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            Ontdek onze nieuwste projecten en laat je inspireren door de veelzijdigheid 
            van premium outdoor kussens in verschillende settings.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[4/5] relative">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/20 text-white backdrop-blur-sm">
                    {project.category}
                  </Badge>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-lg mb-2 group-hover:text-stone-200 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-stone-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                    <span>•</span>
                    <span>{project.year}</span>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

ProjectsSection.displayName = 'ProjectsSection';

export default ProjectsSection;