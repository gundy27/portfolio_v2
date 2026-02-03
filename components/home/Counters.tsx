import { CounterCard } from '@/components/ui/CounterCard'

export function Counters() {
  return (
    <section className="section-spacing-large">
      <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] xl:w-[calc(100%-6rem)] 2xl:w-[calc(100%-8rem)] max-w-[90rem] mx-auto">
        <div className="py-8 px-6 sm:py-12 sm:px-8 lg:py-16 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-4">
            <CounterCard start={0} stop={7} label="BUILDING PRODUCTS" valueSuffix=" yrs" variant="dark-accent" />
            <CounterCard start={0} stop={4} label="0->1 PRODUCT LAUNCHES" valueSuffix="" variant="dark-accent" />
            <CounterCard start={0} stop={27} label="REVENUE IMPACTED" valueSuffix="M+" variant="dark-accent" />
            <CounterCard start={0} stop={3} label="CONVERSION RATE BOOST" valueSuffix="X" variant="dark-accent" />
          </div>
        </div>
      </div>
    </section>
  )
}

