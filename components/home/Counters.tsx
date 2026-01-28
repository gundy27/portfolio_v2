import { CounterCard } from '@/components/ui/CounterCard'

export function Counters() {
  return (
    <section className="section-spacing-large">
      <div className="floating-section">
        <div className="floating-section__content">
          <div className="grid gap-6 sm:grid-cols-3">
            <CounterCard start={0} stop={34} label="REVENUE IMPACTED" />
            <CounterCard start={0} stop={45} label="FEATURES DELIVERED" />
            <CounterCard start={0} stop={12} label="EXPERIMENTS RUN" />
          </div>
        </div>
      </div>
    </section>
  )
}

