'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { BarChart3, FlaskConical, Gauge, Layers } from 'lucide-react'

export function PrimaryAttributes() {
  const attributes = [
    {
      label: 'ENTREPRENEURIAL',
      title: 'Mindset',
      description:
        "Builds with the business outcome in mind, translating ambiguous problems into systems that ship and compound value. He's led ideas from strategy to production such as launching a trial motion that drove a 3X improvement on the self-serve sales pipeline by being gritty and learning by shipping.",
      icon: <Layers className="h-5 w-5 text-secondary" aria-hidden="true" />,
    },
    {
      label: 'EXPERIMENTAL',
      title: 'Builder',
      description:
        "Treats growth like a science experiment, rapidly shipping, testing, and iterating in the real world. He's built multiple solutions to the same problem, using structured experimentation to find what actually works",
      icon: <FlaskConical className="h-5 w-5 text-secondary" aria-hidden="true" />,
    },
    {
      label: 'DATA',
      title: 'Driven',
      description:
        'Uses data as a decision engine, not a vanity metric, grounding priorities in real usage and outcomes. Designs experiments, analyzes results, and doubles down on what moves the needle',
      icon: <BarChart3 className="h-5 w-5 text-secondary" aria-hidden="true" />,
    },
    {
      label: 'HIGH',
      title: 'Agency',
      description:
        "Doesn't wait for perfect clarity or permission, takes ownership and ships. Bias toward action, consistently turns obstacles into progress.",
      icon: <Gauge className="h-5 w-5 text-secondary" aria-hidden="true" />,
    },
  ] as const

  return (
    <section className="section-spacing-large bg-gray-100 !mt-32 sm:!mt-48 lg:!mt-64">
      <div className="container-wide pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-8 sm:mt-12 lg:mt-16">
          {attributes.map((attribute, index) => (
            <motion.div
              key={attribute.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className="h-full"
            >
              <Card
                label={attribute.label}
                title={attribute.title}
                description={attribute.description}
                icon={attribute.icon}
                className="h-full"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
