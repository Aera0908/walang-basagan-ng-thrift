import { FaHandScissors, FaBoxOpen, FaLock, FaHeart } from 'react-icons/fa6'
import featuresData from '../data/features.json'

type FeatureIconKey = 'scissors' | 'package' | 'lock' | 'heart'

interface Feature {
  iconKey: FeatureIconKey
  label: string
}

const iconMap: Record<FeatureIconKey, React.ComponentType<{ className?: string }>> = {
  scissors: FaHandScissors,
  package: FaBoxOpen,
  lock: FaLock,
  heart: FaHeart,
}

const features = featuresData as Feature[]

function FeaturesSection() {
  return (
    <section className="border-y border-pink-100 bg-white py-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6">
        {features.map((f) => {
          const Icon = iconMap[f.iconKey]
          return (
            <div key={f.label} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-pink-200 bg-pink-50">
                <Icon className="h-8 w-8 text-pink-400" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-pink-500">{f.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default FeaturesSection

